// AccessPath — Upload Screen
const { useState, useRef, useEffect } = React;

const INGESTION_STEPS = [
  { label: "Parsing document structure…",   duration: 600 },
  { label: "Detecting content elements…",   duration: 800 },
  { label: "Classifying node types…",       duration: 700 },
  { label: "Queuing AI processing jobs…",   duration: 500 },
  { label: "Ingestion complete",            duration: 0   },
];

const DETECTED_NODES = [
  { type: "Figure",   title: "Figure 1: System Overview Diagram",      model: "claude-3-5-sonnet" },
  { type: "Equation", title: "Equation 1: Conservation Law",            model: "gpt-4o" },
  { type: "Equation", title: "Equation 2: Boundary Conditions",         model: "gpt-4o" },
  { type: "Figure",   title: "Figure 2: Phase Portrait",                model: "claude-3-5-sonnet" },
  { type: "Text",     title: "Introduction paragraph",                  model: "claude-3-5-sonnet" },
  { type: "Problem",  title: "Practice Problem 1",                      model: "gpt-4o" },
  { type: "Video",    title: "Video 1: Demonstration clip",             model: "whisper-v3" },
  { type: "Figure",   title: "Figure 3: Results Chart",                 model: "claude-3-5-sonnet" },
];

const IngestionView = ({ filename, onDone }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [revealedNodes, setRevealedNodes] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let step = 0;
    let nodeIdx = 0;

    const advance = () => {
      if (step >= INGESTION_STEPS.length - 1) {
        setStepIdx(INGESTION_STEPS.length - 1);
        setFinished(true);
        return;
      }
      setStepIdx(step);
      const dur = INGESTION_STEPS[step].duration;

      // reveal nodes during "detecting" and "classifying" steps
      if (step === 1 || step === 2) {
        const batch = step === 1 ? DETECTED_NODES.slice(0, 4) : DETECTED_NODES.slice(4);
        let i = 0;
        const interval = setInterval(() => {
          if (i < batch.length) {
            const node = batch[i];
            setRevealedNodes(prev => [...prev, node]);
            i++;
          } else {
            clearInterval(interval);
          }
        }, dur / (batch.length + 1));
      }

      step++;
      setTimeout(advance, dur);
    };

    setTimeout(advance, 300);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "40px 60px", gap: 32, overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>
        {/* File card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: 42, height: 42, background: "var(--accent-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="file" size={20} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>{filename}</div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>Ingesting and extracting accessibility nodes…</div>
          </div>
          {finished
            ? <Icon name="checkCircle" size={20} color="#16a34a" />
            : <div style={{ width: 18, height: 18, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          }
        </div>

        {/* Pipeline steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
          {INGESTION_STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i > stepIdx ? 0.35 : 1, transition: "opacity 300ms" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#f0fdf4" : active ? "var(--accent-light)" : "var(--hover-bg)",
                  border: `1.5px solid ${done ? "#bbf7d0" : active ? "var(--accent)" : "var(--border)"}`,
                }}>
                  {done
                    ? <Icon name="check" size={10} color="#16a34a" />
                    : active
                      ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                      : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-strong)" }} />
                  }
                </div>
                <span style={{ fontSize: 13, color: done ? "#16a34a" : active ? "var(--fg)" : "var(--fg-subtle)", fontWeight: active ? 500 : 400 }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Detected nodes */}
        {revealedNodes.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--hover-bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Detected Nodes</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{revealedNodes.length} found</span>
            </div>
            {revealedNodes.map((node, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: i < revealedNodes.length - 1 ? "1px solid var(--border)" : "none", animation: "fadeIn 300ms ease" }}>
                <TypeChip type={node.type} />
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</span>
                <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--fg-subtle)", background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px" }}>{node.model}</span>
                <Badge stage="ingested" />
              </div>
            ))}
          </div>
        )}

        {finished && (
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
            <Button variant="secondary" size="md" onClick={onDone}>Upload Another</Button>
            <Button variant="primary" size="md" icon="inbox" onClick={onDone}>Go to Review Queue</Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const UploadScreen = ({ activeCourse, setActiveCourse, courses, onIngestDone }) => {
  const [dragging, setDragging] = useState(false);
  const [ingesting, setIngesting] = useState(null);
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const toast = useToast();

  const startIngestion = (name) => setIngesting(name);

  const handleFileUpload = async (file) => {
    if (!activeCourse) { toast.error("Select a course first — use the dropdown below."); return; }
    const supported = [".pdf",".html",".htm",".png",".jpg",".jpeg",".gif",".webp",".pptx",".docx"];
    const ext = "." + file.name.toLowerCase().split(".").pop();
    if (!supported.includes(ext)) {
      toast.error(`Unsupported file type. Supported: ${supported.join(", ")}`);
      return;
    }
    setIngesting(file.name);
    try {
      const res = await api.uploadFile(activeCourse, file);
      setResult(res);
      toast.success(`Uploaded "${file.name}" — ${res.elements_created} elements created!`);
      if (onIngestDone) onIngestDone();
    } catch (e) {
      toast.error("Upload failed: " + (e.message || "unknown error"));
    } finally {
      setIngesting(null);
    }
  };

  const handleIngestURL = async () => {
    if (!url.trim()) return;
    if (!activeCourse) { toast.error("Select a course first from the sidebar."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await api.ingestURL(activeCourse, url.trim());
      setResult(res);
      toast.success(`Ingested ${res.elements_created} elements from ${res.pdfs_found || 0} PDFs!`);
      if (onIngestDone) onIngestDone();
    } catch (e) {
      setError(e.message || "Ingestion failed.");
    } finally {
      setLoading(false);
    }
  };

  if (ingesting) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PageHeader title="Processing File" subtitle={`Extracting content from "${ingesting}" and running Claude on images…`} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--accent-border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>This takes 15–60 seconds depending on the PDF size…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader
        title="Upload Course Materials"
        subtitle="Upload a zip file, individual documents, or paste a URL to a public course site"
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ width: "100%", maxWidth: 580 }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 0, background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 7, padding: 3, marginBottom: 20, width: "fit-content" }}>
            {[["files","Files / ZIP"], ["url","Course URL"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "5px 18px", borderRadius: 5, fontSize: 13, fontWeight: tab === id ? 600 : 400,
                background: tab === id ? "var(--surface)" : "transparent",
                color: tab === id ? "var(--fg)" : "var(--fg-muted)",
                border: tab === id ? "1px solid var(--border)" : "1px solid transparent",
                cursor: "pointer", fontFamily: "inherit", boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 150ms",
              }}>{lbl}</button>
            ))}
          </div>

          {tab === "files" && (
            <>
              {/* Course picker */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)", marginBottom: 6 }}>Select course</div>
                <select
                  value={activeCourse || ""}
                  onChange={e => setActiveCourse(e.target.value || null)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1.5px solid ${activeCourse ? "var(--accent)" : "var(--border)"}`, background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
                >
                  <option value="">— pick a course —</option>
                  {(courses || []).map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.term})</option>
                  ))}
                </select>
                {!activeCourse && <div style={{ fontSize: 11.5, color: "#b45309", marginTop: 5 }}>Select a course before uploading.</div>}
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); }}
                style={{
                  border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                  borderRadius: 10, padding: "48px 32px", textAlign: "center", cursor: "pointer",
                  background: dragging ? "var(--accent-light)" : "var(--surface)",
                  transition: "all 200ms",
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.html,.htm,.png,.jpg,.jpeg,.gif,.webp,.pptx,.docx" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }} />
                <div style={{ width: 52, height: 52, background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon name="upload" size={24} color="var(--fg-muted)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>Drop files here, or click to browse</div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 12 }}>PDF, PowerPoint, Word, HTML, PNG, JPG, GIF, WebP</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  {["PDF", "PPTX slides", "Word doc", "HTML page", "PNG / JPG / GIF screenshot"].map(t => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>

              {/* Quick demos */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Try a demo upload</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { name: "Lecture 5 — Impulse & Momentum.pdf", size: "3.1 MB", nodes: "~8 nodes" },
                    { name: "Problem Set 4.zip", size: "12.4 MB", nodes: "~15 nodes" },
                    { name: "course-site-export.zip", size: "48.2 MB", nodes: "~80 nodes" },
                  ].map(f => (
                    <div key={f.name} onClick={() => startIngestion(f.name)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer",
                      transition: "background 120ms",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
                    >
                      <div style={{ width: 32, height: 32, background: "var(--accent-light)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name="file" size={15} color="var(--accent)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{f.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{f.size} · Expected {f.nodes}</div>
                      </div>
                      <Icon name="chevronRight" size={14} color="var(--fg-subtle)" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "url" && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>Paste a public course URL</div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 20, lineHeight: 1.5 }}>
                AccessPath will crawl the site and extract all accessible content elements — slides, PDFs, embedded videos, equations, and figures.
              </div>

              {/* Course picker */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)", marginBottom: 6 }}>Select course</div>
                <select
                  value={activeCourse || ""}
                  onChange={e => setActiveCourse(e.target.value || null)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1.5px solid ${activeCourse ? "var(--accent)" : "var(--border)"}`, background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none", cursor: "pointer" }}
                >
                  <option value="">— pick a course —</option>
                  {(courses || []).map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.term})</option>
                  ))}
                </select>
                {!activeCourse && <div style={{ fontSize: 11.5, color: "#b45309", marginTop: 5 }}>A course must be selected before ingesting.</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)", marginBottom: 6 }}>Course website URL</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", background: "var(--surface)" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-light)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <Icon name="link" size={14} color="var(--fg-muted)" />
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.purdue.edu/courses/me274/"
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, fontFamily: "inherit", color: "var(--fg)", background: "transparent", padding: "10px 0" }} />
                  </div>
                  <Button variant="primary" size="md" icon="zap" onClick={handleIngestURL} disabled={!url.trim() || loading}>
                    {loading ? "Ingesting…" : "Ingest"}
                  </Button>
                </div>
              </div>

              {loading && (
                <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--accent-light)", borderRadius: 8, border: "1px solid var(--accent-border)", fontSize: 13, color: "var(--accent)" }}>
                  Fetching page and running Claude on images — this takes 15–60 seconds…
                </div>
              )}

              {error && (
                <div style={{ marginTop: 14, padding: "12px 16px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", fontSize: 13, color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              {result && (
                <div style={{ marginTop: 14, padding: "14px 16px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#15803d", marginBottom: 4 }}>✓ Ingestion complete</div>
                  <div style={{ fontSize: 12.5, color: "#166534" }}>{result.elements_created} elements created from {result.pdfs_found || 0} PDFs — go to the Dashboard to review them.</div>
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", background: "var(--hover-bg)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <Icon name="alertTriangle" size={13} color="var(--fg-subtle)" />
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>URL must be publicly accessible. Password-protected sites require a ZIP export instead.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.UploadScreen = UploadScreen;
