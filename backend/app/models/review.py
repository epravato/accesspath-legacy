from __future__ import annotations

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid

if TYPE_CHECKING:
    from app.models.element_version import ElementVersion
    from app.models.user import User


class ReviewDecision(StrEnum):
    approved = "approved"
    rejected = "rejected"


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=new_uuid)
    element_version_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("element_versions.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    element_version: Mapped[ElementVersion] = relationship(
        "ElementVersion", back_populates="reviews"
    )
    reviewer: Mapped[User] = relationship("User")
