// AccessPath — Node Detail Panel (redesigned)
const { useState: useStateN, useEffect: useEffectN } = React;

const REVIEWERS = [
  { email: "prof@example.com", name: "Prof. Doubert", role: "Instructor" },
  { email: "ta@example.com",   name: "Riya Patel",    role: "TA" },
  { email: "observer@example.com", name: "Dean Office", role: "Observer" },
];

// ── Word diff ────────────────────────────────────────────────────
function wordDiff(a, b) {
  const aw = (a || "").split(/(\s+)/);
  const bw = (b || "").split(/(\s+)/);
  const m = aw.length, n = bw.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    dp[i][j] = aw[i] === bw[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
  const out = []; let i = 0, j = 0;
  while (i < m && j < n) {
    if (aw[i] === bw[j]) { out.push({ t: "eq", s: aw[i] }); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]) { out.push({ t: "del", s: aw[i] }); i++; }
    else { out.push({ t: "add", s: bw[j] }); j++; }
  }
  while (i < m) out.push({ t: "del", s: aw[i++] });
  while (j < n) out.push({ t: "add", s: bw[j++] });
  return out;
}

const DiffView = ({ from, to }) => (
  <div style={{ fontSize: 13, lineHeight: 1.7, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", maxHeight: 180, overflow: "auto" }}>
    {wordDiff(from, to).map((d, i) => (
      <span key={i} style={{
        background: d.t === "add" ? "#dcfce7" : d.t === "del" ? "#fee2e2" : "transparent",
        color: d.t === "add" ? "#14532d" : d.t === "del" ? "#7f1d1d" : "var(--fg)",
        textDecoration: d.t === "del" ? "line-through" : "none",
        padding: d.t !== "eq" ? "0 2px" : 0, borderRadius: 2,
      }}>{d.s}</span>
    ))}
  </div>
);

// ── Assignee picker ──────────────────────────────────────────────
const AssigneePicker = ({ current, onPick, onClose }) => (
  <div style={{
    position: "absolute", top: "calc(100% + 4px)", right: 0,
    background: "var(--surface)", border: "1px solid var(--border-strong)",
    borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", minWidth: 220, zIndex: 30,
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: "6px 12px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Assign to</div>
    </div>
    {REVIEWERS.map(r => (
      <div key={r.email} onClick={() => { onPick(r.email); onClose(); }} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer",
        background: current === r.email ? "var(--accent-light)" : "transparent",
      }}
        onMouseEnter={e => { if (current !== r.email) e.currentTarget.style.background = "var(--hover-bg)"; }}
        onMouseLeave={e => { if (current !== r.email) e.currentTarget.style.background = "transparent"; }}
      >
        <Avatar email={r.email} size={22} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>{r.name}</div>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{r.role}</div>
        </div>
        {current === r.email && <Icon name="check" size={14} color="var(--accent)" />}
      </div>
    ))}
    <div style={{ borderTop: "1px solid var(--border)", padding: 6 }}>
      <div onClick={() => { onPick(null); onClose(); }}
        style={{ padding: "6px 8px", fontSize: 12, color: "var(--fg-muted)", cursor: "pointer", borderRadius: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >Unassign</div>
    </div>
  </div>
);

// ── Tabs ─────────────────────────────────────────────────────────
const EditHistoryTab = ({ history }) => (
  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
    {history.length === 0
      ? <EmptyState icon="gitCommit" title="No history yet" body="Actions like approve and flag will appear here." />
      : history.map((entry, i) => (
        <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          {i < history.length - 1 && <div style={{ position: "absolute", left: 10, top: 22, width: 1, bottom: -14, background: "var(--border)" }} />}
          <div style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0, zIndex: 1,
            background: entry.by === "ai" ? "var(--status-ai-bg)" : "var(--accent-light)",
            border: `1px solid ${entry.by === "ai" ? "var(--status-ai-border)" : "var(--accent)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={entry.by === "ai" ? "sparkles" : "gitCommit"} size={10} color={entry.by === "ai" ? "#7c3aed" : "var(--accent)"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>{entry.label}</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>{entry.note || <em style={{ color: "var(--fg-subtle)" }}>No note</em>}</div>
            <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", fontFamily: "var(--mono)", marginTop: 2 }}>{entry.at}</div>
          </div>
        </div>
      ))
    }
  </div>
);

const CommentsTab = ({ comments, onAddComment }) => {
  const [text, setText] = useStateN("");
  const submit = () => { if (text.trim()) { onAddComment(text.trim()); setText(""); } };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {comments.length === 0 && <EmptyState icon="messageSquare" title="No comments yet" body="Start a thread when you flag a node or request revisions." />}
        {comments.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <Avatar email={c.author} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)" }}>{c.author.split("@")[0]}</span>
                <span style={{ fontSize: 10.5, color: "var(--fg-subtle)", fontFamily: "var(--mono)" }}>{c.at}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.6, background: "var(--hover-bg)", borderRadius: "0 8px 8px 8px", padding: "8px 12px", border: "1px solid var(--border)" }}>{c.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment…"
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          style={{ flex: 1, resize: "none", height: 60, border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "var(--fg)", background: "var(--surface)", outline: "none", lineHeight: 1.5 }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-light)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
        <Button variant="primary" size="sm" onClick={submit} disabled={!text.trim()} icon="messageSquare">Send</Button>
      </div>
    </div>
  );
};

const ApprovalTab = ({ chain }) => (
  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
    {chain.length === 0 && <EmptyState icon="checkCircle" title="Not yet approved" body="When a reviewer approves this node, the chain shows here." />}
    {chain.map((step, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--hover-bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <Avatar email={step.email} size={28} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{step.email.split("@")[0]}</div>
          <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{step.role}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Badge stage="approved" label={step.action} size="sm" />
          <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", marginTop: 3, fontFamily: "var(--mono)" }}>{step.at}</div>
        </div>
      </div>
    ))}
  </div>
);

// ── Output Tab ────────────────────────────────────────────────────
const OutputTab = ({ node, draft, setDraft, isDirty, showDiff, setShowDiff, onSaveEdit }) => {
  const toast = useToast();
  const isImage = node.type === "Figure";
  const API_BASE = "http://localhost:8000";

  const saveAsNewVersion = () => {
    onSaveEdit(node.id, draft);
    toast.success("Saved as new version", { title: node.title });
  };

  if (!node.aiOutput) return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef9c3", border: "1px solid #fde047", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="clock" size={22} color="#b45309" />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#b45309" }}>Awaiting Processing</div>
      <div style={{ fontSize: 12.5, color: "#b45309", opacity: 0.8 }}>This node is queued. AI will generate output shortly.</div>
    </div>
  );

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Actual image preview for Figure nodes */}
      {isImage && node.fileUrl && (
        <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", background: "var(--hover-bg)" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="image" size={12} color="var(--fg-subtle)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Original file</span>
          </div>
          <div style={{ padding: 12, display: "flex", justifyContent: "center", background: "#f8fafc" }}>
            <img
              src={`${API_BASE}${node.fileUrl}`}
              alt="Uploaded file"
              style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 4 }}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <div style={{ display: "none", flexDirection: "column", alignItems: "center", gap: 6, padding: 20, color: "var(--fg-subtle)" }}>
              <Icon name="image" size={24} color="var(--border-strong)" />
              <span style={{ fontSize: 12 }}>Image not available</span>
            </div>
          </div>
        </div>
      )}

      {/* Table display */}
      {node.type === "Table" && node.tableData ? (
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6, background: "var(--hover-bg)" }}>
            <Icon name="grid" size={12} color="var(--fg-subtle)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Extracted table</span>
          </div>
          <div style={{ overflowX: "auto", maxHeight: 300 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              {node.tableData.headers.length > 0 && (
                <thead>
                  <tr>
                    {node.tableData.headers.map((h, i) => (
                      <th key={i} style={{ padding: "7px 12px", textAlign: "left", fontWeight: 600, color: "var(--fg)", background: "var(--hover-bg)", borderBottom: "2px solid var(--border)", whiteSpace: "nowrap" }}>{h || "—"}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {node.tableData.rows.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: "6px 12px", color: "var(--fg-muted)", verticalAlign: "top" }}>{cell || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      /* Alt text / extracted text editor */
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name={isImage ? "sparkles" : node.isCode ? "hash" : "file"} size={13} color={isImage ? "#7c3aed" : "var(--fg-muted)"} />
            <span style={{ fontSize: 12, fontWeight: 600, color: isImage ? "#7c3aed" : "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isImage ? "AI alt text" : node.isCode ? "Code block" : node.isHeading ? `Heading ${node.headingLevel || ""}`.trim() : "Extracted text"}
            </span>
            {isDirty && <span style={{ fontSize: 11, color: "#b45309", fontWeight: 600 }}>● Unsaved edits</span>}
          </div>
          {isDirty && (
            <button onClick={() => setShowDiff(v => !v)} style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: "var(--accent)", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
            }}>{showDiff ? "Hide diff" : "Show diff"}</button>
          )}
        </div>

        {showDiff && isDirty
          ? <DiffView from={node.aiOutput} to={draft} />
          : <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", resize: "vertical",
                minHeight: isImage ? 100 : 140, maxHeight: 280,
                border: `1px solid ${isDirty ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8, padding: "10px 14px",
                fontSize: node.isCode ? 12.5 : 13.5,
                fontFamily: node.isCode ? "var(--mono)" : "inherit",
                color: "var(--fg)", background: "var(--surface)", outline: "none", lineHeight: 1.75,
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-light)"; }}
              onBlur={e => { e.target.style.boxShadow = "none"; if (!isDirty) e.target.style.borderColor = "var(--border)"; }}
            />
        }

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{draft.length} chars</div>
          {isDirty && (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setDraft(node.aiOutput || "")} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: 5,
                padding: "3px 10px", fontSize: 11.5, fontWeight: 500, color: "var(--fg-muted)", cursor: "pointer", fontFamily: "inherit",
              }}>Revert</button>
              <button onClick={saveAsNewVersion} style={{
                background: "var(--accent)", border: "none", borderRadius: 5,
                padding: "3px 12px", fontSize: 11.5, fontWeight: 600, color: "var(--accent-fg)", cursor: "pointer", fontFamily: "inherit",
              }}>Save version</button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Screen reader preview */}
      <div style={{ background: "#0f1117", borderRadius: 8, padding: "12px 16px", border: "1px solid #1e2535" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Screen reader preview</div>
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, fontFamily: "var(--mono)" }}>
          <span style={{ color: "#60a5fa" }}>
            {node.type === "Video" ? "Video, " : node.type === "Equation" ? "Math, " : node.type === "Figure" ? "Image, " : "Text, "}
          </span>
          <span style={{ color: "#e2e8f0" }}>{draft || "…"}</span>
        </div>
      </div>

    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────
const NodeDetailPanel = ({ node, onClose, onApprove, onFlag, onRegenerate, onAddComment, onSaveEdit, onAssign, onDelete }) => {
  const [tab, setTab] = useStateN("output");
  const [draft, setDraft] = useStateN(node.aiOutput || "");
  const [showAssignee, setShowAssignee] = useStateN(false);
  const [showDiff, setShowDiff] = useStateN(false);
  const toast = useToast();

  useEffectN(() => { setDraft(node.aiOutput || ""); setShowDiff(false); setTab("output"); }, [node.id]);

  const isDirty = draft !== (node.aiOutput || "");

  const tabs = [
    { id: "output",    label: "Output",    icon: "sparkles" },
    { id: "history",   label: "History",   icon: "gitCommit" },
    { id: "comments",  label: "Comments",  icon: "messageSquare", count: (node.comments || []).length },
    { id: "approvals", label: "Approvals", icon: "checkCircle",   count: (node.approvalChain || []).length },
  ];

  return (
    <div style={{
      width: 520, borderLeft: "1px solid var(--border)", background: "var(--surface)",
      display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", lineHeight: 1.3, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <TypeChip type={node.type} />
              <Badge stage={node.stage} />
              <ConfidencePill value={node.confidence} />
              {node.model && <ModelTag model={node.model} />}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--mono)" }}>{node.updatedAt}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
              <Icon name="x" size={16} color="var(--fg-muted)" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Flag banner ── */}
      {node.flagReason && (
        <div style={{ padding: "10px 18px", background: "#fef2f2", borderBottom: "1px solid #fecaca", display: "flex", gap: 8 }}>
          <Icon name="alertTriangle" size={14} color="#b91c1c" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#b91c1c", lineHeight: 1.5 }}><strong>Flagged:</strong> {node.flagReason}</div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", fontSize: 12,
            fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? "var(--accent)" : "var(--fg-muted)",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
            marginBottom: -1, transition: "color 100ms",
          }}>
            <Icon name={t.icon} size={12} color={tab === t.id ? "var(--accent)" : "var(--fg-subtle)"} />
            {t.label}
            {t.count > 0 && (
              <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 9999, fontSize: 10, fontWeight: 600, padding: "0 5px" }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab body ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "output"    && <OutputTab node={node} draft={draft} setDraft={setDraft} isDirty={isDirty} showDiff={showDiff} setShowDiff={setShowDiff} onSaveEdit={onSaveEdit} />}
        {tab === "history"   && <EditHistoryTab history={node.editHistory || []} />}
        {tab === "comments"  && <CommentsTab comments={node.comments || []} onAddComment={text => onAddComment(node.id, text)} />}
        {tab === "approvals" && <ApprovalTab chain={node.approvalChain || []} />}
      </div>

      {/* ── Action bar ── */}
      <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--fg-subtle)" }}>
          <Kbd>A</Kbd><span>approve</span>
          <span style={{ margin: "0 4px" }}>·</span>
          <Kbd>F</Kbd><span>flag</span>
        </div>
        <button onClick={() => onDelete && onDelete(node.id)} style={{
          background: "none", border: "1px solid #fecaca", borderRadius: 5,
          padding: "4px 10px", fontSize: 11.5, fontWeight: 500, color: "#dc2626",
          cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5,
        }}>
          <Icon name="trash2" size={12} color="#dc2626" />Delete
        </button>
        <Button variant="warning" size="sm" icon="flag" onClick={() => { onFlag(node.id); toast.warning(`Flagged: ${node.title}`); }} disabled={node.stage === "flagged"}>Flag</Button>
        <Button variant="solidSuccess" size="sm" icon="check" onClick={() => { onApprove(node.id); toast.success(`Approved: ${node.title}`); }} disabled={node.stage === "approved"}>Approve</Button>
      </div>
    </div>
  );
};

window.NodeDetailPanel = NodeDetailPanel;
