import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.element_version import ElementVersion
from app.models.review import Review
from app.schemas.element_version import ElementVersionRead, ReviewCreate, ReviewRead

router = APIRouter(prefix="/element-versions", tags=["element-versions"])


@router.get("/{version_id}", response_model=ElementVersionRead)
async def get_element_version(
    version_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> ElementVersion:
    result = await db.execute(
        select(ElementVersion)
        .options(selectinload(ElementVersion.reviews))
        .where(ElementVersion.id == version_id)
    )
    version = result.scalar_one_or_none()
    if version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
    return version


@router.post("/{version_id}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def submit_review(
    version_id: uuid.UUID, body: ReviewCreate, db: AsyncSession = Depends(get_db)
) -> Review:
    version = await db.get(ElementVersion, version_id)
    if version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    review = Review(
        element_version_id=version_id,
        reviewer_id=body.reviewer_id,
        decision=body.decision,
        comment=body.comment,
    )
    db.add(review)

    # Update version status to match decision
    if body.decision == "approved":
        version.status = "approved"
    elif body.decision == "rejected":
        version.status = "rejected"

    await db.commit()
    await db.refresh(review)
    return review
