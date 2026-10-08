from __future__ import annotations

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid

if TYPE_CHECKING:
    from app.models.artifact import Artifact
    from app.models.assignment import Assignment
    from app.models.element_version import ElementVersion


class ElementKind(StrEnum):
    diagram = "diagram"
    text_block = "text_block"
    formula = "formula"
    table = "table"
    other = "other"


class Element(Base, TimestampMixin):
    __tablename__ = "elements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=new_uuid)
    artifact_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False
    )
    parent_element_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("elements.id", ondelete="SET NULL"), nullable=True
    )
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    artifact: Mapped[Artifact] = relationship("Artifact", back_populates="elements")
    children: Mapped[list[Element]] = relationship(
        "Element",
        back_populates="parent",
        lazy="select",
        foreign_keys="[Element.parent_element_id]",
    )
    parent: Mapped[Element | None] = relationship(
        "Element",
        back_populates="children",
        foreign_keys="[Element.parent_element_id]",
        remote_side="[Element.id]",
    )
    versions: Mapped[list[ElementVersion]] = relationship(
        "ElementVersion", back_populates="element", lazy="select"
    )
    assignments: Mapped[list[Assignment]] = relationship(
        "Assignment", back_populates="element", lazy="select"
    )
