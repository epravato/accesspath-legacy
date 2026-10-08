import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.artifact import Artifact
from app.models.element import Element
from app.models.element_version import ElementVersion
from app.models.review import Review
from app.schemas.element import ElementRead

router = APIRouter(prefix="/artifacts", tags=["artifacts"])


@router.get("/{artifact_id}/elements", response_model=list[ElementRead])
async def get_artifact_elements(
    artifact_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> list[dict]:
    result = await db.execute(
        select(Element).where(Element.artifact_id == artifact_id).order_by(Element.sequence)
    )
    elements = list(result.scalars().all())

    out = []
    for el in elements:
        latest_version = None
        ver_result = await db.execute(
            select(ElementVersion)
            .where(ElementVersion.element_id == el.id)
            .order_by(ElementVersion.version_number.desc())
            .limit(1)
        )
        latest_version = ver_result.scalar_one_or_none()
        out.append({
            "id": el.id,
            "artifact_id": el.artifact_id,
            "kind": el.kind,
            "sequence": el.sequence,
            "created_at": el.created_at,
            "latest_version_id": latest_version.id if latest_version else None,
            "latest_version_status": latest_version.status if latest_version else None,
        })
    return out


@router.delete("/{artifact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_artifact(artifact_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    artifact = await db.get(Artifact, artifact_id)
    if artifact is None:
        raise HTTPException(status_code=404, detail="Artifact not found")
    # Delete reviews → element versions → elements → artifact
    elements = list((await db.execute(select(Element).where(Element.artifact_id == artifact_id))).scalars())
    for el in elements:
        version_ids = list((await db.execute(
            select(ElementVersion.id).where(ElementVersion.element_id == el.id)
        )).scalars())
        if version_ids:
            await db.execute(delete(Review).where(Review.element_version_id.in_(version_ids)))
        await db.execute(delete(ElementVersion).where(ElementVersion.element_id == el.id))
    await db.execute(delete(Element).where(Element.artifact_id == artifact_id))
    await db.delete(artifact)
    await db.commit()
