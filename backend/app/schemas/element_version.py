import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reviewer_id: uuid.UUID
    decision: str
    comment: str | None
    created_at: datetime


class ElementVersionCreate(BaseModel):
    content: dict[str, Any] | None = None
    tool_used: str | None = None
    confidence_score: float | None = None
    rationale: str | None = None
    status: str = "remediated"


class ElementVersionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    element_id: uuid.UUID
    version_number: int
    status: str
    content: dict[str, Any] | None
    tool_used: str | None
    confidence_score: float | None
    rationale: str | None
    created_at: datetime
    reviews: list[ReviewRead] = []


class ReviewCreate(BaseModel):
    reviewer_id: uuid.UUID
    decision: str
    comment: str | None = None
