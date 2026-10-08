import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.element import Element
from app.models.element_version import ElementVersion
from app.models.review import Review
from app.schemas.element_version import ElementVersionCreate, ElementVersionRead

router = APIRouter(prefix="/elements", tags=["elements"])


@router.get("/{element_id}/versions", response_model=list[ElementVersionRead])
async def get_element_versions(
    element_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> list[ElementVersion]:
    element = await db.get(Element, element_id)
    if element is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Element not found")
    result = await db.execute(
        select(ElementVersion)
        .where(ElementVersion.element_id == element_id)
        .order_by(ElementVersion.version_number.desc())
    )
    return list(result.scalars().all())


@router.post("/{element_id}/versions", response_model=ElementVersionRead, status_code=status.HTTP_201_CREATED)
async def create_element_version(
    element_id: uuid.UUID, body: ElementVersionCreate, db: AsyncSession = Depends(get_db)
) -> ElementVersion:
    element = await db.get(Element, element_id)
    if element is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Element not found")

    result = await db.execute(
        select(ElementVersion)
        .where(ElementVersion.element_id == element_id)
        .order_by(ElementVersion.version_number.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()
    next_version = (latest.version_number + 1) if latest else 1

    version = ElementVersion(
        element_id=element_id,
        version_number=next_version,
        **body.model_dump(),
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)
    return version


@router.delete("/{element_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_element(element_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    element = await db.get(Element, element_id)
    if element is None:
        raise HTTPException(status_code=404, detail="Element not found")
    version_ids = list((await db.execute(
        select(ElementVersion.id).where(ElementVersion.element_id == element_id)
    )).scalars())
    if version_ids:
        await db.execute(delete(Review).where(Review.element_version_id.in_(version_ids)))
    await db.execute(delete(ElementVersion).where(ElementVersion.element_id == element_id))
    await db.delete(element)
    await db.commit()
