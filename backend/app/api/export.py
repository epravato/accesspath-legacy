import uuid
from html import escape

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.artifact import Artifact
from app.models.course import Course
from app.models.element import Element
from app.models.element_version import ElementVersion

router = APIRouter(prefix="/courses", tags=["export"])


@router.get("/{course_id}/export", response_class=HTMLResponse)
async def export_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> str:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    artifact_result = await db.execute(
        select(Artifact).where(Artifact.course_id == course_id).order_by(Artifact.created_at)
    )
    artifacts = artifact_result.scalars().all()

    sections = []
    total_elements = 0
    total_approved = 0

    for artifact in artifacts:
        el_result = await db.execute(
            select(Element).where(Element.artifact_id == artifact.id).order_by(Element.sequence)
        )
        elements = el_result.scalars().all()
        if not elements:
            continue

        blocks = []
        for el in elements:
            ver_result = await db.execute(
                select(ElementVersion)
                .where(ElementVersion.element_id == el.id)
                .order_by(ElementVersion.version_number.desc())
                .limit(1)
            )
            ver = ver_result.scalar_one_or_none()
            if not ver:
                continue

            total_elements += 1
            approved = ver.status == "approved"
            if approved:
                total_approved += 1

            status_badge = (
                '<span class="badge approved">Approved</span>' if approved
                else '<span class="badge pending">Needs Review</span>'
            )

            if el.kind == "text_block":
                text = escape(ver.content.get("text", "") if ver.content else "")
                page = ver.content.get("page") if ver.content else None
                page_note = f'<span class="meta">Page {page}</span>' if page else ""
                blocks.append(f"""
                <div class="element text-block {'approved' if approved else 'pending'}">
                  <div class="element-header">
                    <span class="kind">Text</span>{page_note}{status_badge}
                  </div>
                  <p>{text}</p>
                </div>""")

            elif el.kind == "diagram":
                content = ver.content or {}
                alt = escape(content.get("alt_text", "No description available."))
                src = content.get("src", "")
                page = content.get("page")
                page_note = f'<span class="meta">Page {page}</span>' if page else ""
                img_tag = f'<img src="{escape(src)}" alt="{alt}" />' if src else ""
                blocks.append(f"""
                <div class="element diagram {'approved' if approved else 'pending'}">
                  <div class="element-header">
                    <span class="kind">Image</span>{page_note}{status_badge}
                  </div>
                  {img_tag}
                  <div class="alt-text">
                    <strong>Alt text:</strong> {alt}
                  </div>
                </div>""")

        if blocks:
            sections.append(f"""
        <section aria-label="{escape(artifact.filename)}">
          <h2>{escape(artifact.filename)}</h2>
          {''.join(blocks)}
        </section>""")

    pct = round(total_approved / total_elements * 100) if total_elements else 0
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Accessible Export — {escape(course.code)}: {escape(course.name)}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: system-ui, -apple-system, sans-serif; font-size: 16px; line-height: 1.6;
            color: #1a1a1a; background: #fff; max-width: 860px; margin: 0 auto; padding: 40px 24px; }}
    h1 {{ font-size: 1.8rem; margin-bottom: 4px; }}
    h2 {{ font-size: 1.2rem; color: #374151; border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px; margin: 40px 0 16px; }}
    .meta-bar {{ background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px;
                 padding: 14px 18px; margin: 20px 0 36px; font-size: 14px; color: #6b7280; }}
    .meta-bar strong {{ color: #111827; }}
    .element {{ border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;
                margin-bottom: 12px; background: #fafafa; }}
    .element.approved {{ border-left: 4px solid #16a34a; }}
    .element.pending  {{ border-left: 4px solid #d97706; }}
    .element-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }}
    .kind {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
             background: #e5e7eb; color: #374151; padding: 2px 7px; border-radius: 4px; }}
    .meta {{ font-size: 12px; color: #9ca3af; }}
    .badge {{ font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; }}
    .badge.approved {{ background: #dcfce7; color: #15803d; }}
    .badge.pending  {{ background: #fef3c7; color: #92400e; }}
    .element p {{ color: #374151; }}
    .element img {{ max-width: 100%; border-radius: 4px; margin-bottom: 10px; display: block; }}
    .alt-text {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
                 padding: 10px 14px; font-size: 14px; color: #1e40af; margin-top: 8px; }}
    .skip-link {{ position: absolute; top: -40px; left: 0; background: #2563eb; color: #fff;
                  padding: 8px 16px; text-decoration: none; border-radius: 4px; }}
    .skip-link:focus {{ top: 6px; }}
    @media print {{ .badge.pending {{ display: none; }} }}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>
    <h1>{escape(course.code)}: {escape(course.name)}</h1>
    <p style="color:#6b7280;margin-top:4px">{escape(course.term)} &mdash; Accessible Course Materials Export</p>
    <div class="meta-bar">
      <strong>{total_approved}</strong> of <strong>{total_elements}</strong> elements approved
      ({pct}% complete) &mdash; Elements marked "Needs Review" have AI-generated descriptions
      that have not yet been verified by a human reviewer.
    </div>
  </header>
  <main id="main-content">
    {''.join(sections) if sections else '<p>No content has been ingested for this course yet.</p>'}
  </main>
</body>
</html>"""

    return HTMLResponse(content=html, headers={
        "Content-Disposition": f'attachment; filename="{course.code.replace(" ", "_")}_accessible.html"'
    })
