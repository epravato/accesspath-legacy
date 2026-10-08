from __future__ import annotations

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid

if TYPE_CHECKING:
    from app.models.element import Element
    from app.models.review import Review


class ElementVersionStatus(StrEnum):
    pending = "pending"
    remediated = "remediated"
    approved = "approved"
    rejected = "rejected"


class ElementVersion(Base, TimestampMixin):
    __tablename__ = "element_versions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=new_uuid)
    element_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("elements.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ElementVersionStatus.pending
    )
    # Structured remediation output; shape depends on element kind.
    content: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    tool_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)

    element: Mapped[Element] = relationship("Element", back_populates="versions")
    reviews: Mapped[list[Review]] = relationship(
        "Review", back_populates="element_version", lazy="select"
    )
