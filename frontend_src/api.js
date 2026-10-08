// AccessPath — API Client
// Connects AccessPath.html to the FastAPI backend at http://localhost:8000
//
// Usage: load this BEFORE your app scripts
//   <script src="api.js"></script>
//
// All functions return parsed JSON or throw on error.
// Set API_BASE below to match your backend URL.

const API_BASE = "http://localhost:8000";

// ── Hardcoded user UUIDs (seeded in Alembic migration 0001) ──────────────────
const USER_IDS = {
  "prof@example.com":     "00000000-0000-0000-0000-000000000001",
  "ta@example.com":       "00000000-0000-0000-0000-000000000002",
  "observer@example.com": "00000000-0000-0000-0000-000000000003",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${options.method || "GET"} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Courses ───────────────────────────────────────────────────────────────────
const api = {

  // GET /courses/
  listCourses: () => apiFetch("/courses/"),

  // GET /courses/:id
  getCourse: (courseId) => apiFetch(`/courses/${courseId}`),

  // POST /courses/
  createCourse: (body) => apiFetch("/courses/", { method: "POST", body: JSON.stringify(body) }),

  // PATCH /courses/:id
  updateCourse: (courseId, body) => apiFetch(`/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(body) }),

  // DELETE /courses/:id
  deleteCourse: (courseId) => apiFetch(`/courses/${courseId}`, { method: "DELETE" }),

  // DELETE /artifacts/:id
  deleteArtifact: (artifactId) => apiFetch(`/artifacts/${artifactId}`, { method: "DELETE" }),

  // DELETE /elements/:id
  deleteElement: (elementId) => apiFetch(`/elements/${elementId}`, { method: "DELETE" }),


  // ── Artifacts ────────────────────────────────────────────────────────────
  // GET /courses/:courseId/artifacts
  listArtifacts: (courseId) => apiFetch(`/courses/${courseId}/artifacts`),

  // POST /courses/:courseId/ingest-url
  ingestURL: (courseId, url) =>
    apiFetch(`/courses/${courseId}/ingest-url`, { method: "POST", body: JSON.stringify({ url }) }),

  // POST /courses/:courseId/upload-file  (multipart — PDF or HTML)
  uploadFile: (courseId, file) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch(`/courses/${courseId}/upload-file`, { method: "POST", body: form, headers: {} });
  },

  // ── Review queue ─────────────────────────────────────────────────────────
  // GET /courses/:courseId/review-queue
  // Returns elements whose latest version has status "remediated" (= needs review)
  getReviewQueue: (courseId) => apiFetch(`/courses/${courseId}/review-queue`),


  // ── Artifacts / Elements ─────────────────────────────────────────────────
  // GET /artifacts/:artifactId/elements
  getArtifactElements: (artifactId) => apiFetch(`/artifacts/${artifactId}/elements`),


  // ── Element Versions ─────────────────────────────────────────────────────
  // GET /elements/:elementId/versions  — full version history (newest first)
  getElementVersions: (elementId) => apiFetch(`/elements/${elementId}/versions`),

  // POST /elements/:elementId/versions  — create a new version manually (e.g. after editing)
  // body: { content, tool_used, confidence_score, rationale, status }
  createElementVersion: (elementId, body) =>
    apiFetch(`/elements/${elementId}/versions`, { method: "POST", body: JSON.stringify(body) }),

  // GET /element-versions/:versionId  — single version + all its reviews
  getElementVersion: (versionId) => apiFetch(`/element-versions/${versionId}`),


  // ── Reviews (approve / reject) ───────────────────────────────────────────
  // POST /element-versions/:versionId/reviews
  // body: { reviewer_id, decision: "approved"|"rejected", comment? }
  submitReview: (versionId, body) =>
    apiFetch(`/element-versions/${versionId}/reviews`, { method: "POST", body: JSON.stringify(body) }),

  // ── Convenience wrappers ─────────────────────────────────────────────────
  // Approve a version — pass the current user's email
  approveVersion: (versionId, reviewerEmail, comment = null) =>
    api.submitReview(versionId, {
      reviewer_id: USER_IDS[reviewerEmail],
      decision: "approved",
      comment,
    }),

  // Reject/flag a version
  rejectVersion: (versionId, reviewerEmail, comment = null) =>
    api.submitReview(versionId, {
      reviewer_id: USER_IDS[reviewerEmail],
      decision: "rejected",
      comment,
    }),

  // Save edited output as a new version
  saveEditedOutput: (elementId, newText, toolUsed, confidence) =>
    api.createElementVersion(elementId, {
      content: { alt_text: newText },
      tool_used: toolUsed || "manual",
      confidence_score: confidence ? confidence / 100 : null,
      rationale: "Manually edited by reviewer",
      status: "remediated",
    }),

  // GET /courses/:courseId/export  — returns accessible HTML file
  exportCourse: (courseId) => `${API_BASE}/courses/${courseId}/export`,

  // Health check
  health: () => apiFetch("/health"),
};

// ── Data shape adapters ───────────────────────────────────────────────────────
// Convert the backend's ElementWithLatestVersion into the shape
// AccessPath.html's node table expects.
//
// Backend status values  →  frontend stage values
const STATUS_MAP = {
  "ingested":   "ingested",
  "queued":     "ingested",
  "remediated": "ai-generated",   // AI has run, nobody reviewed yet
  "approved":   "approved",
  "rejected":   "flagged",
};

function adaptElement(el) {
  return {
    id:          el.id,
    lectureId:   el.artifact_id,   // use artifact_id as the "lecture" grouping key
    title:       `${kindToType(el.kind)} #${el.sequence + 1}`,
    type:        kindToType(el.kind),
    stage:       STATUS_MAP[el.latest_version_status] || "ingested",
    confidence:  null,             // populated from version detail
    assignee:    null,             // populated from assignment detail
    model:       null,             // populated from version detail
    updatedAt:   el.created_at ? el.created_at.slice(0, 10) : "—",
    // raw backend fields preserved for action calls:
    _latestVersionId: el.latest_version_id,
    _elementId:       el.id,
  };
}

function kindToType(kind) {
  const map = {
    diagram:    "Figure",
    formula:    "Equation",
    text_block: "Text",
    table:      "Table",
    other:      "Text",
  };
  return map[kind] || "Text";
}

// Merge a full version into a node object
function mergeVersion(node, version) {
  return {
    ...node,
    confidence: version.confidence_score != null ? Math.round(version.confidence_score * 100) : null,
    model:      version.tool_used || null,
    aiOutput:   version.content?.alt_text || version.content?.text || null,
    tableData:  version.content?.headers ? { headers: version.content.headers, rows: version.content.rows } : null,
    isHeading:  version.content?.heading || false,
    headingLevel: version.content?.heading_level || null,
    isCode:     version.content?.code || false,
    fileUrl:    version.content?.file_url || null,
    editHistory: (version.reviews || []).map(r => ({
      by:    r.reviewer_id,
      label: r.decision === "approved" ? "Approved" : "Rejected",
      note:  r.comment || "",
      at:    r.created_at ? r.created_at.slice(0, 16).replace("T", " ") : "—",
    })),
    comments: (version.reviews || [])
      .filter(r => r.comment)
      .map(r => ({
        author: Object.keys(USER_IDS).find(k => USER_IDS[k] === r.reviewer_id) || r.reviewer_id,
        text:   r.comment,
        at:     r.created_at ? r.created_at.slice(0, 16).replace("T", " ") : "—",
      })),
    approvalChain: (version.reviews || [])
      .filter(r => r.decision === "approved")
      .map(r => ({
        role:   "Reviewer",
        email:  Object.keys(USER_IDS).find(k => USER_IDS[k] === r.reviewer_id) || r.reviewer_id,
        action: "Approved",
        at:     r.created_at ? r.created_at.slice(0, 16).replace("T", " ") : "—",
      })),
  };
}

window.api = api;
window.USER_IDS = USER_IDS;
window.adaptElement = adaptElement;
window.mergeVersion = mergeVersion;
