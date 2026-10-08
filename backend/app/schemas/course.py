import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CourseCreate(BaseModel):
    code: str = Field(..., max_length=50, examples=["ME 274"])
    name: str = Field(..., max_length=200, examples=["Dynamics"])
    term: str = Field(..., max_length=50, examples=["Spring 2026"])
    owner_id: uuid.UUID | None = None


class CourseUpdate(BaseModel):
    code: str | None = Field(default=None, max_length=50)
    name: str | None = Field(default=None, max_length=200)
    term: str | None = Field(default=None, max_length=50)
    owner_id: uuid.UUID | None = None


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    term: str
    owner_id: uuid.UUID | None
    created_at: datetime
