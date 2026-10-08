from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid

if TYPE_CHECKING:
    from app.models.artifact import Artifact
    from app.models.user import User


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=new_uuid)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    term: Mapped[str] = mapped_column(String(50), nullable=False)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    owner: Mapped[User | None] = relationship("User", lazy="select")
    artifacts: Mapped[list[Artifact]] = relationship(
        "Artifact", back_populates="course", lazy="select"
    )
