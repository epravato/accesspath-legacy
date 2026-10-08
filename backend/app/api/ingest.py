import io
import uuid
from urllib.parse import urljoin, urlparse

import anthropic
import httpx
import pdfplumber
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException, status
from playwright.async_api import async_playwright
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.artifact import Artifact
from app.models.course import Course
from app.models.element import Element
from app.models.element_version import ElementVersion
from app.api.ai_utils import describe_image_bytes
from app.api.upload import process_html as parse_html_content

router = APIRouter(prefix="/courses", tags=["ingest"])

MAX_PDFS = 5          # max PDFs to download per ingestion
MAX_PAGES_PER_PDF = 8 # max pages to extract per PDF
MAX_IMAGES = 6        # max images to send to Claude


class IngestURLRequest(BaseModel):
    url: str


class IngestResult(BaseModel):
    artifact_id: str
    elements_created: int
    url: str
    pdfs_found: int


async def render_page(url: str) -> str:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle", timeout=30000)
        html = await page.content()
        await browser.close()
    return html


async def ingest_pdf(pdf_bytes: bytes, artifact: Artifact, db: AsyncSession,
                     ai: anthropic.AsyncAnthropic) -> int:
    count = 0
    sequence = 0
    images_described = 0

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages[:MAX_PAGES_PER_PDF]):
            # Extract text
            text = page.extract_text()
            if text and len(text.strip()) > 40:
                el = Element(artifact_id=artifact.id, kind="text_block", sequence=sequence)
                db.add(el)
                await db.flush()
                db.add(ElementVersion(
                    element_id=el.id, version_number=1, status="remediated",
                    content={"text": text.strip(), "page": page_num + 1},
                    tool_used="pdfplumber", confidence_score=1.0,
                    rationale=f"Extracted from PDF page {page_num + 1} — review for accuracy.",
                ))
                sequence += 1
                count += 1

            # Extract images from page
            if images_described < MAX_IMAGES:
                for img_obj in page.images:
                    if images_described >= MAX_IMAGES:
                        break
                    try:
                        # Crop the image region from the page
                        bbox = (img_obj["x0"], img_obj["top"], img_obj["x1"], img_obj["bottom"])
                        cropped = page.crop(bbox)
                        img_bytes = cropped.to_image(resolution=100).original.tobytes("jpeg", "RGB")
                        description = await describe_image_bytes(img_bytes, "image/jpeg", f"Page {page_num+1}", ai)
                        el = Element(artifact_id=artifact.id, kind="diagram", sequence=sequence)
                        db.add(el)
                        await db.flush()
                        db.add(ElementVersion(
                            element_id=el.id, version_number=1, status="remediated",
                            content={"alt_text": description, "page": page_num + 1},
                            tool_used="claude-haiku-4-5-20251001", confidence_score=0.85,
                            rationale="AI-generated alt text — needs review.",
                        ))
                        sequence += 1
                        count += 1
                        images_described += 1
                    except Exception:
                        continue

    return count


@router.post("/{course_id}/ingest-url", response_model=IngestResult)
async def ingest_url(
    course_id: uuid.UUID,
    body: IngestURLRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=400, detail="ANTHROPIC_API_KEY not configured")

    # Render the page with JS
    try:
        html = await render_page(body.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not load URL: {e}")

    soup = BeautifulSoup(html, "html.parser")

    # Find all PDF links on the page
    pdf_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        abs_href = urljoin(body.url, href)
        if abs_href.lower().endswith(".pdf") and abs_href not in pdf_links:
            pdf_links.append(abs_href)

    ai_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    total_elements = 0
    pdfs_processed = 0

    # Create one artifact per page ingested
    page_artifact = Artifact(
        course_id=course_id,
        filename=urlparse(body.url).netloc + urlparse(body.url).path,
        storage_path=body.url,
        mime_type="text/html",
    )
    db.add(page_artifact)
    await db.flush()

    # Parse the page HTML itself (up to 30 text elements)
    try:
        html_bytes = html.encode("utf-8")
        page_count = await parse_html_content(html_bytes, page_artifact, db, max_elements=30)
        total_elements += page_count
    except Exception:
        pass

    # Download and parse each PDF
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}, follow_redirects=True, timeout=30) as http:
        for pdf_url in pdf_links[:MAX_PDFS]:
            try:
                r = await http.get(pdf_url)
                if r.status_code != 200:
                    continue
                filename = urlparse(pdf_url).path.split("/")[-1]
                artifact = Artifact(
                    course_id=course_id,
                    filename=filename,
                    storage_path=pdf_url,
                    mime_type="application/pdf",
                )
                db.add(artifact)
                await db.flush()
                count = await ingest_pdf(r.content, artifact, db, ai_client)
                total_elements += count
                pdfs_processed += 1
            except Exception:
                continue

    await db.commit()
    return {
        "artifact_id": str(page_artifact.id),
        "elements_created": total_elements,
        "url": body.url,
        "pdfs_found": len(pdf_links),
    }
