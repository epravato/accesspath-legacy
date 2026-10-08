# Accessibility Pipeline
A web application that ingests course materials (PDFs, slide decks, images), decomposes them into structured sub-elements (diagrams, text blocks, formulas, tables), remediates each element for WCAG 2.1 AA compliance via AI tooling, and provides a course-team review workflow with element-level version control so instructors, TAs, and observers can approve or reject each remediation before the accessible version is shipped.
## Getting started
### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git for Windows | Latest | https://git-scm.com/download/win |
| Node.js | 22.x | https://nodejs.org |
| pnpm | Latest | `npm i -g pnpm` |
| Python | 3.12 via `uv` | `pip install uv` or https://docs.astral.sh/uv |
### First-time setup
```bash