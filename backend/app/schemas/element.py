import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ElementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    artifact_id: uuid.UUID
    kind: str
    sequence: int
    created_at: datetime
    latest_version_id: uuid.UUID | None = None
    latest_version_status: str | None = None
