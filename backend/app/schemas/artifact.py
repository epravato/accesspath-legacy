import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ArtifactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    filename: str
    status: str
    created_at: datetime
