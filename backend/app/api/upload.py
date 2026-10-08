import io
import os
import re
import uuid

import anthropic
import pdfplumber
from bs4 import BeautifulSoup, Tag
from docx import Document as DocxDocument
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pptx import Presentation
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.artifact import Artifact
from app.models.course import Course
from app.models.element import Element
from app.models.element_version import ElementVersion
from app.api.ai_utils import describe_image_bytes

router = APIRouter(prefix="/courses", tags=["upload"])

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")

MAX_PAGES  = 20
MAX_IMAGES = 10
MAX_SLIDES = 30

SUPPORTED = {
    ".pdf":  "application/pdf",
    ".html": "text/html",
    ".htm":  "text/html",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif":  "image/gif",
    ".webp": "image/webp",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt":  "application/vnd.ms-powerpoint",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def ai_client() -> anthropic.AsyncAnthropic | None:
    return anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None


def save_upload(artifact_id: str, filename: str, content: bytes) -> str:
    folder = os.path.join(UPLOADS_DIR, artifact_id)
    os.makedirs(folder, exist_ok=True)
    safe = os.path.basename(filename)
    path = os.path.join(folder, safe)
    with open(path, "wb") as f:
        f.write(content)
    return f"/uploads/{artifact_id}/{safe}"


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _add_element(db, artifact, sequence: int, kind: str, content: dict, tool: str,
                       confidence: float = 1.0, rationale: str = "Extracted — review for accuracy."):
    el = Element(artifact_id=artifact.id, kind=kind, sequence=sequence)
    db.add(el)
    await db.flush()
    db.add(ElementVersion(
        element_id=el.id, version_number=1, status="remediated",
        content=content, tool_used=tool,
        confidence_score=confidence, rationale=rationale,
    ))


async def _add_image(db, artifact, sequence: int, img_bytes: bytes, media_type: str,
                     context: str, page: int | None = None, ai=None, file_url: str | None = None):
    description = "Image — no description generated (AI not configured)."
    if ai:
        try:
            description = await describe_image_bytes(img_bytes, media_type, context, ai)
        except Exception:
            description = "Image — description unavailable."
    content: dict = {"alt_text": description}
    if page:
        content["page"] = page
    if file_url:
        content["file_url"] = file_url
    await _add_element(db, artifact, sequence, "diagram", content,
                       tool="claude-haiku-4-5-20251001" if ai else "none",
                       confidence=0.85 if ai else 0.0,
                       rationale="AI-generated alt text — needs review." if ai else "No AI configured.")


# ── PDF ────────────────────────────────────────────────────────────────────────

def _is_heading_line(line: str) -> bool:
    """Heuristic: short line that is ALL CAPS or title-case with no sentence punctuation."""
    s = line.strip()
    if not s or len(s) > 120:
        return False
    if s == s.upper() and len(s) > 3:
        return True
    if re.match(r'^[A-Z][^.!?]{3,80}$', s) and len(s.split()) <= 10:
        return True
    return False


async def process_pdf(content: bytes, artifact, db, ai) -> int:
    seq = 0
    images_done = 0
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for pn, page in enumerate(pdf.pages[:MAX_PAGES]):
            # ── Tables ──
            try:
                tables = page.extract_tables()
                for tbl in tables:
                    if not tbl or len(tbl) < 2:
                        continue
                    headers = [str(c or "").strip() for c in tbl[0]]
                    rows = [[str(c or "").strip() for c in row] for row in tbl[1:]]
                    if any(any(cell for cell in row) for row in rows):
                        await _add_element(db, artifact, seq, "table",
                                           {"headers": headers, "rows": rows, "page": pn + 1},
                                           tool="pdfplumber")
                        seq += 1
            except Exception:
                pass

            # ── Text (skip if mostly covered by table) ──
            text = page.extract_text() or ""
            text = text.strip()
            if len(text) >= 20:
                # Split into lines and group into paragraphs, flagging headings
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                paragraphs: list[dict] = []
                buf: list[str] = []
                for line in lines:
                    if _is_heading_line(line):
                        if buf:
                            paragraphs.append({"text": " ".join(buf)})
                            buf = []
                        paragraphs.append({"text": line, "heading": True})
                    else:
                        buf.append(line)
                if buf:
                    paragraphs.append({"text": " ".join(buf)})

                for para in paragraphs:
                    if len(para["text"]) < 20:
                        continue
                    c: dict = {"text": para["text"], "page": pn + 1}
                    if para.get("heading"):
                        c["heading"] = True
                    await _add_element(db, artifact, seq, "text_block", c, tool="pdfplumber")
                    seq += 1

            # ── Images ──
            if ai and images_done < MAX_IMAGES:
                for img_obj in page.images:
                    if images_done >= MAX_IMAGES:
                        break
                    try:
                        bbox = (img_obj["x0"], img_obj["top"], img_obj["x1"], img_obj["bottom"])
                        if (bbox[2] - bbox[0]) < 30 or (bbox[3] - bbox[1]) < 30:
                            continue
                        buf2 = io.BytesIO()
                        page.crop(bbox).to_image(resolution=100).original.save(buf2, format="JPEG")
                        await _add_image(db, artifact, seq, buf2.getvalue(), "image/jpeg",
                                         f"Page {pn + 1} of {artifact.filename}", page=pn + 1, ai=ai)
                        seq += 1
                        images_done += 1
                    except Exception:
                        continue
    return seq


# ── HTML ───────────────────────────────────────────────────────────────────────

def _extract_table(table_tag) -> dict | None:
    """Convert a BeautifulSoup <table> into {headers, rows}."""
    headers: list[str] = []
    rows: list[list[str]] = []
    thead = table_tag.find("thead")
    if thead:
        header_row = thead.find("tr")
        if header_row:
            headers = [th.get_text(" ", strip=True) for th in header_row.find_all(["th", "td"])]
    tbody = table_tag.find("tbody") or table_tag
    for tr in tbody.find_all("tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.find_all(["td", "th"])]
        if any(cells):
            rows.append(cells)
    # If no explicit thead, treat first row as headers
    if not headers and rows:
        headers = rows.pop(0)
    if not headers and not rows:
        return None
    return {"headers": headers, "rows": rows}


async def process_html(content: bytes, artifact, db, max_elements: int = 60) -> int:
    soup = BeautifulSoup(content, "html.parser")
    for t in soup(["script", "style", "nav", "footer", "header", "aside"]):
        t.decompose()
    seq = 0

    # Walk tags in document order
    tags_of_interest = ["h1", "h2", "h3", "h4", "h5", "h6",
                        "p", "li", "blockquote", "pre", "code",
                        "figcaption", "caption", "table"]

    seen_ids: set[int] = set()  # avoid double-counting nested tags

    for tag in soup.find_all(tags_of_interest):
        if id(tag) in seen_ids:
            continue
        if seq >= max_elements:
            break

        name = tag.name

        # Tables → structured element
        if name == "table":
            tbl = _extract_table(tag)
            if tbl:
                # Mark all descendants as seen
                for child in tag.find_all(True):
                    seen_ids.add(id(child))
                await _add_element(db, artifact, seq, "table", tbl, tool="html-parser")
                seq += 1
            continue

        text = tag.get_text(" ", strip=True)

        if name in ("figcaption", "caption"):
            if len(text) < 5:
                continue
        elif name in ("pre", "code"):
            if len(text) < 10:
                continue
        else:
            if len(text) < 15:
                continue

        c: dict = {"text": text}
        if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            c["heading_level"] = int(name[1])
            c["heading"] = True
        elif name in ("pre", "code"):
            c["code"] = True

        await _add_element(db, artifact, seq, "text_block", c, tool="html-parser")
        seq += 1

    return seq


# ── PPTX ───────────────────────────────────────────────────────────────────────

def _slide_title(slide) -> str | None:
    """Return the title text from a slide, trying the title placeholder first."""
    from pptx.enum.shapes import PP_PLACEHOLDER
    for shape in slide.placeholders:
        try:
            if shape.placeholder_format.idx == 0:  # title placeholder
                t = shape.text_frame.text.strip()
                if t:
                    return t
        except Exception:
            pass
    # Fallback: shape named "Title" or largest font size
    best_text, best_size = "", 0
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        if "title" in (shape.name or "").lower():
            t = shape.text_frame.text.strip()
            if t:
                return t
        for para in shape.text_frame.paragraphs:
            for run in para.runs:
                sz = run.font.size or 0
                if sz > best_size:
                    best_size = sz
                    best_text = run.text.strip()
    return best_text or None


async def process_pptx(content: bytes, artifact, db, ai) -> int:
    prs = Presentation(io.BytesIO(content))
    seq = 0
    images_done = 0

    for slide_num, slide in enumerate(prs.slides[:MAX_SLIDES]):
        title_text = _slide_title(slide)
        title_shape_ids: set[int] = set()

        # Record which shape provided the title so we don't duplicate it
        if title_text:
            for shape in slide.shapes:
                if shape.has_text_frame and shape.text_frame.text.strip() == title_text:
                    title_shape_ids.add(shape.shape_id)
                    break

        # Emit title node
        if title_text:
            await _add_element(db, artifact, seq, "text_block",
                               {"text": title_text, "page": slide_num + 1, "is_title": True,
                                "heading": True},
                               tool="python-pptx")
            seq += 1

        # Emit body text — one node per shape (not all merged)
        body_texts: list[str] = []
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            if shape.shape_id in title_shape_ids:
                continue
            lines = []
            for para in shape.text_frame.paragraphs:
                t = " ".join(r.text for r in para.runs).strip()
                if len(t) >= 10:
                    lines.append(t)
            if lines:
                combined = "\n".join(lines)
                body_texts.append(combined)
                await _add_element(db, artifact, seq, "text_block",
                                   {"text": combined, "page": slide_num + 1},
                                   tool="python-pptx")
                seq += 1

        # Images — richer context: title + first body chunk
        if ai and images_done < MAX_IMAGES:
            ctx_parts = []
            if title_text:
                ctx_parts.append(title_text)
            if body_texts:
                ctx_parts.append(body_texts[0][:100])
            ctx = " · ".join(ctx_parts)[:200]

            for shape in slide.shapes:
                if images_done >= MAX_IMAGES:
                    break
                if shape.shape_type == 13:  # MSO_SHAPE_TYPE.PICTURE
                    try:
                        img_bytes = shape.image.blob
                        ext = shape.image.ext.lower()
                        media_type = f"image/{ext}" if ext in ("png", "jpeg", "jpg", "gif", "webp") else "image/png"
                        await _add_image(db, artifact, seq, img_bytes, media_type,
                                         f"Slide {slide_num + 1}: {ctx}", page=slide_num + 1, ai=ai)
                        seq += 1
                        images_done += 1
                    except Exception:
                        continue

    return seq


# ── DOCX ───────────────────────────────────────────────────────────────────────

def _heading_level(para) -> int | None:
    """Return heading level 1–6 from paragraph style, or None if not a heading."""
    style_name = (para.style.name or "") if para.style else ""
    m = re.match(r"[Hh]eading\s*(\d)", style_name)
    if m:
        return int(m.group(1))
    return None


async def process_docx(content: bytes, artifact, db, ai) -> int:
    doc = DocxDocument(io.BytesIO(content))
    seq = 0
    images_done = 0

    # ── Paragraphs ──
    for para in doc.paragraphs:
        if seq >= 80:
            break
        text = para.text.strip()
        if len(text) < 20:
            continue
        level = _heading_level(para)
        c: dict = {"text": text}
        if level:
            c["heading_level"] = level
            c["heading"] = True
        await _add_element(db, artifact, seq, "text_block", c, tool="python-docx")
        seq += 1

    # ── Tables ──
    for tbl in doc.tables:
        if seq >= 80:
            break
        rows_data: list[list[str]] = []
        for row in tbl.rows:
            cells = [cell.text.strip() for cell in row.cells]
            rows_data.append(cells)
        if len(rows_data) >= 2:
            headers = rows_data[0]
            rows = rows_data[1:]
            await _add_element(db, artifact, seq, "table",
                               {"headers": headers, "rows": rows},
                               tool="python-docx")
            seq += 1

    # ── Inline images ──
    if ai:
        for rel in doc.part.rels.values():
            if images_done >= MAX_IMAGES:
                break
            if "image" in rel.reltype:
                try:
                    img_bytes = rel.target_part.blob
                    await _add_image(db, artifact, seq, img_bytes, "image/png",
                                     artifact.filename, ai=ai)
                    seq += 1
                    images_done += 1
                except Exception:
                    continue

    return seq


# ── Image ──────────────────────────────────────────────────────────────────────

async def process_image(content: bytes, media_type: str, artifact, db, ai) -> int:
    file_url = save_upload(str(artifact.id), artifact.filename, content)
    await _add_image(db, artifact, 0, content, media_type, artifact.filename, ai=ai, file_url=file_url)
    return 1


# ── Route ──────────────────────────────────────────────────────────────────────

@router.post("/{course_id}/upload-file")
async def upload_file(
    course_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    content = await file.read()
    filename = file.filename or "upload"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in SUPPORTED:
        raise HTTPException(status_code=400,
            detail=f"Unsupported file type '{ext}'. Supported: {', '.join(SUPPORTED)}")

    artifact = Artifact(
        course_id=course_id, filename=filename,
        storage_path=f"upload/{filename}", mime_type=SUPPORTED[ext],
    )
    db.add(artifact)
    await db.flush()

    ai = ai_client()
    if ext == ".pdf":
        count = await process_pdf(content, artifact, db, ai)
    elif ext in (".html", ".htm"):
        count = await process_html(content, artifact, db)
    elif ext in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
        count = await process_image(content, SUPPORTED[ext], artifact, db, ai)
    elif ext == ".pptx":
        count = await process_pptx(content, artifact, db, ai)
    elif ext == ".docx":
        count = await process_docx(content, artifact, db, ai)
    else:
        count = 0

    await db.commit()
    return {"artifact_id": str(artifact.id), "elements_created": count, "filename": filename}
