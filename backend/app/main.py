from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.artifacts import router as artifacts_router
from app.api.export import router as export_router
from app.api.ingest import router as ingest_router
from app.api.upload import router as upload_router  # handles /upload-file (PDF + HTML)
from app.api.courses import router as courses_router
from app.api.element_versions import router as element_versions_router
from app.api.elements import router as elements_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    yield


app = FastAPI(title="Accessibility Pipeline", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router)
app.include_router(export_router)
app.include_router(ingest_router)
app.include_router(upload_router)
app.include_router(artifacts_router)
app.include_router(elements_router)
app.include_router(element_versions_router)

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
