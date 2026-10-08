import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.artifact import Artifact
from app.models.course import Course
from app.models.element import Element
from app.models.element_version import ElementVersion
from app.models.review import Review
from app.schemas.artifact import ArtifactRead
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate
from app.schemas.element import ElementRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/", response_model=list[CourseRead])
async def list_courses(db: AsyncSession = Depends(get_db)) -> list[Course]:
    result = await db.execute(select(Course).order_by(Course.created_at.desc()))
    return list(result.scalars().all())


@router.post("/", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(body: CourseCreate, db: AsyncSession = Depends(get_db)) -> Course:
    course = Course(**body.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Course:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.patch("/{course_id}", response_model=CourseRead)
async def update_course(
    course_id: uuid.UUID, body: CourseUpdate, db: AsyncSession = Depends(get_db)
) -> Course:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    # Manually cascade: reviews → element_versions → elements → artifacts → course
    artifacts = list((await db.execute(select(Artifact).where(Artifact.course_id == course_id))).scalars())
    for artifact in artifacts:
        elements = list((await db.execute(select(Element).where(Element.artifact_id == artifact.id))).scalars())
        for el in elements:
            version_ids = list((await db.execute(
                select(ElementVersion.id).where(ElementVersion.element_id == el.id)
            )).scalars())
            if version_ids:
                await db.execute(delete(Review).where(Review.element_version_id.in_(version_ids)))
            await db.execute(delete(ElementVersion).where(ElementVersion.element_id == el.id))
        await db.execute(delete(Element).where(Element.artifact_id == artifact.id))
    await db.execute(delete(Artifact).where(Artifact.course_id == course_id))
    await db.delete(course)
    await db.commit()


@router.get("/{course_id}/artifacts", response_model=list[ArtifactRead])
async def list_course_artifacts(
    course_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> list[Artifact]:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    result = await db.execute(
        select(Artifact).where(Artifact.course_id == course_id).order_by(Artifact.created_at)
    )
    return list(result.scalars().all())


@router.get("/{course_id}/review-queue", response_model=list[ElementRead])
async def get_review_queue(
    course_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> list[dict]:
    course = await db.get(Course, course_id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    artifact_result = await db.execute(
        select(Artifact).where(Artifact.course_id == course_id)
    )
    artifact_ids = [a.id for a in artifact_result.scalars().all()]
    if not artifact_ids:
        return []

    element_result = await db.execute(
        select(Element).where(Element.artifact_id.in_(artifact_ids))
    )
    elements = list(element_result.scalars().all())

    out = []
    for el in elements:
        ver_result = await db.execute(
            select(ElementVersion)
            .where(ElementVersion.element_id == el.id)
            .order_by(ElementVersion.version_number.desc())
            .limit(1)
        )
        latest = ver_result.scalar_one_or_none()
        if latest and latest.status == "remediated":
            out.append({
                "id": el.id,
                "artifact_id": el.artifact_id,
                "kind": el.kind,
                "sequence": el.sequence,
                "created_at": el.created_at,
                "latest_version_id": latest.id,
                "latest_version_status": latest.status,
            })
    return out
