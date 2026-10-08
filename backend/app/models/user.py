import uuid
from enum import StrEnum

from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_uuid


class UserRole(StrEnum):
    instructor = "instructor"
    ta = "ta"
    observer = "observer"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
