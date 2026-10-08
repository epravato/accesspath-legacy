# Accessibility Pipeline

## What this is
A web app that ingests course materials (PDFs, slides, images, eventually video),
decomposes them into structured elements, remediates each element for WCAG 2.1 AA
compliance via AI tools, and provides a course-team review workflow with
element-level version control.

The user (course instructor) uploads a folder of materials, the system identifies
sub-elements (diagrams, text blocks, formulas, tables), routes each to the
appropriate specialist tool, and reassembles a candidate accessible version for
review by TAs and the professor before shipping.

## Stack
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query
- Backend: FastAPI (Python 3.12), SQLAlchemy 2.x, Alembic, Arq (Redis-based job queue)
- DB: Postgres 16 (via Docker)
- Cache/queue: Redis 7 (via Docker)
- AI: Anthropic API (vision + reasoning), Mathpix (math OCR — added later)
- Package managers: uv (Python), pnpm (Node)

## GitHub
https://github.com/AaronDoubert/doubieKing_prvato (private)
Main branch: main. Always work on a feature branch — never commit directly to main.

### Branch + PR workflow (every session)
```powershell
# Start of session — create feature branch first, before any changes
git checkout -b feat/<short-description>

# End of session — push and open PR
git push -u origin feat/<short-description>
# gh is installed but NOT on PATH yet (needs Claude Code restart to pick it up)
# Use full path until then:
& "C:\Program Files\GitHub CLI\gh.exe" pr create --title "..." --body "..."
```

## Repo layout
accessibility-pipeline/
  CLAUDE.md
  README.md
  docker-compose.yml
  .env.example
  .gitignore
  frontend/        Next.js app
  backend/         FastAPI app
    app/
      api/         Route handlers
      models/      SQLAlchemy models
      schemas/     Pydantic schemas
      services/    Business logic
      pipelines/   Decomposition + remediation orchestration
      tools/       AI tool wrappers (vision, OCR, etc.)
      workers/     Arq background jobs
      main.py
    alembic/
    tests/
    pyproject.toml
  samples/         Real PDFs for testing decomposition

## Dev commands

### Infrastructure
```powershell
# Docker is NOT on PATH — use the full path or open Docker Desktop first
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up -d
# Or just open Docker Desktop and run:
docker compose up -d   # works once Docker Desktop adds it to PATH in a new terminal
```

### Backend
```powershell
# DO NOT use `python -m uv run` — uv is installed on Python 3.11, not 3.12.
# Use the venv directly instead:
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000

# Migrations (same pattern — use venv alembic, not uv):
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\alembic.exe revision --autogenerate -m "description"
```

### Frontend
```powershell
# Node 22 + pnpm must be installed first (not yet done in dev machine PATH):
# winget install OpenJS.NodeJS.LTS  then  npm i -g pnpm
cd frontend
pnpm dev    # http://localhost:3000
```

### API testing (PowerShell)
```powershell
# Health check
Invoke-RestMethod http://localhost:8000/health

# Create a course
Invoke-RestMethod -Method Post -Uri http://localhost:8000/courses/ `
  -ContentType "application/json" `
  -Body '{"code":"ME 274","name":"Dynamics","term":"Spring 2026"}'
```

## Conventions
- Python: type hints everywhere, Pydantic for all I/O schemas, async by default
- TypeScript: strict mode on, server components by default in Next.js
- All AI tool calls go through wrappers in backend/app/tools/. Route handlers
  never call external APIs directly.
- Element-level versioning: every remediation creates a new ElementVersion row.
  Never mutate an existing version.
- Cross-platform paths: pathlib.Path in Python, never raw strings with backslashes.
- File storage abstracted behind a Storage interface; local filesystem in dev.
- SQLAlchemy models: use `from __future__ import annotations` + TYPE_CHECKING
  imports for cross-model Mapped[] type hints to avoid circular imports.

## Key data model
All 7 tables exist and have been migrated (alembic revision 0001):
- User: hardcoded (instructor/ta/observer), seeded in migration
- Course → owner: User, artifacts: Artifact[]
- Artifact → course: Course, elements: Element[]
- Element → artifact, parent (self-ref), children (self-ref), versions, assignments
- ElementVersion → element; immutable once created (append-only)
- Assignment → element, user (reviewer), assigned_by
- Review → element_version, reviewer; decision: approved | rejected

## Hardcoded users (v1, no real auth)
Fixed UUIDs seeded in migration 0001:
- 00000000-0000-0000-0000-000000000001  instructor@example.com  instructor
- 00000000-0000-0000-0000-000000000002  ta@example.com          ta
- 00000000-0000-0000-0000-000000000003  observer@example.com    observer

## What's been built
- Session 1: repo scaffold, docker-compose, backend uv project, Next.js 15 frontend shell
- Session 2: all 7 SQLAlchemy models, Alembic migration 0001, /courses CRUD
- Session 2 verified: all /courses endpoints tested end-to-end against live Postgres

## Next up (session 3)
Version tracking vertical slice — the core review workflow:

Backend endpoints to add:
  GET  /courses/{id}/review-queue              → elements awaiting review
  GET  /artifacts/{id}/elements                → elements in an artifact
  GET  /elements/{id}/versions                 → version history for an element
  POST /elements/{id}/versions                 → create a new version manually
  GET  /element-versions/{id}                  → single version + its reviews
  POST /element-versions/{id}/reviews          → submit approve/reject + comment

Frontend pages/components to add:
  /courses/[id]/review                         → review workflow page
    ElementList (left sidebar)                 → elements with status badges
    VersionViewer (center)                     → content, tool used, confidence, rationale
    VersionHistory (right panel)               → timeline + approve/reject form

UI design: plan to use Claude's design tool (Anthropic's new UI prototyping
product) to prototype the review page before wiring it up in Next.js.

## Out of scope for v1
- Real auth (use hardcoded user table, fake login)
- Video and audio descriptions
- Live LMS integration via LTI (import/export only for demo)
- Multi-tenant infrastructure
- Institutional admin dashboard

## Coding style
- Small, focused commits. One vertical slice at a time.
- Tests for decomposition logic and version-control logic. UI tests skipped for now.
- No premature abstraction. If something is used once, inline it.
