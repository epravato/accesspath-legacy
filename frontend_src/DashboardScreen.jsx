// AccessPath — Dashboard Screen
const { useState, useMemo } = React;

const MetricsBar = ({ nodes }) => {
  const total    = nodes.length;
  const approved = nodes.filter(n => n.stage === "approved").length;
  const inReview = nodes.filter(n => n.stage === "in-review").length;
  const flagged  = nodes.filter(n => n.stage === "flagged").length;
  const aiNodes  = nodes.filter(n => n.confidence !== null);
  const avgConf  = aiNodes.length ? Math.round(aiNodes.reduce((s, n) => s + n.confidence, 0) / aiNodes.length) : null;

  const cards = [
    { label: "Total Nodes",    value: total,              icon: "layers",       color: "var(--fg-muted)" },
    { label: "Approved",       value: approved,           icon: "checkCircle",  color: "#16a34a" },
    { label: "In Review",      value: inReview,           icon: "clock",        color: "var(--accent)" },
    { label: "Flagged",        value: flagged,            icon: "flag",         color: "#dc2626" },
    { label: "Avg Confidence", value: avgConf ? `${avgConf}%` : "—", icon: "sparkles", color: "#7c3aed" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, padding: "16px 20px", flexShrink: 0 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", transition: "background 200ms" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 500 }}>{c.label}</div>
            <Icon name={c.icon} size={14} color={c.color} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
};

const LectureList = ({ lectures, nodes, selectedId, onSelect, onDeleteArtifact }) => (
  <div style={{ width: 248, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", transition: "background 200ms" }}>
    <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Lectures</div>
    </div>
    <div style={{ overflowY: "auto", flex: 1 }}>
      {/* All row */}
      {(() => {
        const total = nodes.length;
        const approved = nodes.filter(n => n.stage === "approved").length;
        const isActive = selectedId === null;
        return (
          <div key="all" onClick={() => onSelect(null)} style={{
            padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)",
            background: isActive ? "var(--accent-light)" : "transparent",
            borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
            transition: "background 100ms",
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--hover-bg)"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--accent)" : "var(--fg)", marginBottom: 6 }}>All Content</div>
            <ProgressBar approved={approved} total={total} showLabel={true} />
          </div>
        );
      })()}

      {lectures.map(lec => {
        const lecNodes = nodes.filter(n => n.lectureId === lec.id);
        const total    = lecNodes.length;
        const approved = lecNodes.filter(n => n.stage === "approved").length;
        const flagged  = lecNodes.filter(n => n.stage === "flagged").length;
        const isActive = selectedId === lec.id;
        return (
          <div key={lec.id} onClick={() => onSelect(lec.id)} style={{
            padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)",
            background: isActive ? "var(--accent-light)" : "transparent",
            borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
            transition: "background 100ms", position: "relative",
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--hover-bg)"; const b = e.currentTarget.querySelector(".lec-del"); if (b) b.style.opacity = "1"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; const b = e.currentTarget.querySelector(".lec-del"); if (b) b.style.opacity = "0"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--accent)" : "var(--fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 6 }}>{lec.name}</div>
              {flagged > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 9999, padding: "0 5px", whiteSpace: "nowrap" }}>⚑ {flagged}</span>
              )}
              <button className="lec-del" onClick={e => { e.stopPropagation(); onDeleteArtifact && onDeleteArtifact(lec.id); }} style={{
                opacity: 0, background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
                borderRadius: 3, flexShrink: 0, transition: "opacity 100ms", marginLeft: 4,
              }}>
                <Icon name="trash2" size={11} color="#dc2626" />
              </button>
            </div>
            <ProgressBar approved={approved} total={total} showLabel={true} />
          </div>
        );
      })}
    </div>
  </div>
);

const NodeRow = ({ node, isSelected, onClick, onDelete }) => (
  <div onClick={onClick} style={{
    display: "grid", gridTemplateColumns: "1fr 96px 110px 72px 96px 96px 36px",
    alignItems: "center", padding: "0 8px 0 16px", height: 42, cursor: "pointer",
    borderBottom: "1px solid var(--border)",
    background: isSelected ? "var(--accent-light)" : "transparent",
    borderLeft: `3px solid ${isSelected ? "var(--accent)" : "transparent"}`,
    transition: "background 100ms",
  }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--hover-bg)"; const b = e.currentTarget.querySelector(".node-del"); if (b) b.style.opacity = "1"; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? "var(--accent-light)" : "transparent"; const b = e.currentTarget.querySelector(".node-del"); if (b) b.style.opacity = "0"; }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
      <div style={{ width: 28, height: 28, borderRadius: 4, background: "var(--hover-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={node.type === "Figure" ? "image" : node.type === "Equation" ? "hash" : node.type === "Video" ? "video" : node.type === "Table" ? "grid" : node.type === "Problem" ? "book" : "file"} size={13} color="var(--fg-muted)" />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</span>
    </div>
    <div><TypeChip type={node.type} /></div>
    <div><Badge stage={node.stage} /></div>
    <div><ConfidencePill value={node.confidence} /></div>
    <div><ModelTag model={node.model} /></div>
    <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", fontFamily: "var(--mono)" }}>{node.updatedAt}</div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button className="node-del" onClick={e => { e.stopPropagation(); onDelete && onDelete(node.id); }} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "4px 5px", borderRadius: 4, opacity: 0.4,
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "#fee2e2"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.4"; e.currentTarget.style.background = "none"; }}
      >
        <Icon name="trash2" size={13} color="#dc2626" />
      </button>
    </div>
  </div>
);

const TableHeader = () => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr 96px 110px 72px 96px 96px 36px",
    padding: "0 8px 0 16px", height: 34, background: "var(--hover-bg)", borderBottom: "1px solid var(--border)",
    alignItems: "center", flexShrink: 0, position: "sticky", top: 0, zIndex: 2,
  }}>
    {["Node", "Type", "Stage", "Confidence", "Model", "Updated", ""].map(h => (
      <div key={h} style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
    ))}
  </div>
);

const DashboardScreen = ({ nodes: allNodes, lectures, selectedNodeId, setSelectedNodeId, onApprove, onFlag, onAddComment, onSaveEdit, onAssign, onDeleteNode, onDeleteArtifact, activeCourse }) => {
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const visibleNodes = useMemo(() => {
    let ns = selectedLectureId ? allNodes.filter(n => n.lectureId === selectedLectureId) : allNodes;
    if (stageFilter !== "all") ns = ns.filter(n => n.stage === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      ns = ns.filter(n => n.title.toLowerCase().includes(q) || n.type.toLowerCase().includes(q) || (n.assignee || "").toLowerCase().includes(q));
    }
    return ns;
  }, [allNodes, selectedLectureId, stageFilter, search]);

  const selectedNode = selectedNodeId ? allNodes.find(n => n.id === selectedNodeId) : null;

  const stageCounts = useMemo(() => {
    const base = selectedLectureId ? allNodes.filter(n => n.lectureId === selectedLectureId) : allNodes;
    return {
      all: base.length,
      "ingested": base.filter(n => n.stage === "ingested").length,
      "ai-generated": base.filter(n => n.stage === "ai-generated").length,
      "in-review": base.filter(n => n.stage === "in-review").length,
      "approved": base.filter(n => n.stage === "approved").length,
      "flagged": base.filter(n => n.stage === "flagged").length,
    };
  }, [allNodes, selectedLectureId]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader
        title="ME 274 — Engineering Dynamics"
        subtitle="Spring 2026 · Prof. Doubert · 4 artifacts"
        meta={<DeadlineChip days={4} />}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {activeCourse && (
              <a href={`http://localhost:8000/courses/${activeCourse}/export`} target="_blank" rel="noreferrer" download style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm" icon="download">Export Accessible HTML</Button>
              </a>
            )}
          </div>
        }
      />

      <MetricsBar nodes={allNodes} />

      {/* Main content: lecture list + node table + detail panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LectureList lectures={lectures} nodes={allNodes} selectedId={selectedLectureId} onSelect={id => { setSelectedLectureId(id); setSelectedNodeId(null); }} onDeleteArtifact={onDeleteArtifact} />

        {/* Node table area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Filter + search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
            {/* Stage filter pills */}
            <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
              {[["all","All"], ["ingested","Ingested"], ["ai-generated","AI Gen."], ["in-review","In Review"], ["approved","Approved"], ["flagged","Flagged"]].map(([val, lbl]) => (
                <button key={val} onClick={() => setStageFilter(val)} style={{
                  padding: "3px 9px", borderRadius: 5, fontSize: 11.5, fontWeight: 500,
                  border: "1px solid", cursor: "pointer", fontFamily: "inherit",
                  background: stageFilter === val ? "var(--accent)" : "var(--surface)",
                  color: stageFilter === val ? "var(--accent-fg)" : "var(--fg-muted)",
                  borderColor: stageFilter === val ? "var(--accent)" : "var(--border)",
                  transition: "all 120ms",
                }}>{lbl} <span style={{ opacity: 0.7 }}>({stageCounts[val] ?? 0})</span></button>
              ))}
            </div>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", minWidth: 180 }}>
              <Icon name="eye" size={13} color="var(--fg-subtle)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search nodes…"
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--fg)", fontFamily: "inherit", width: "100%" }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <TableHeader />
              {visibleNodes.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: "var(--fg-subtle)", fontSize: 13 }}>No nodes match this filter.</div>
              )}
              {visibleNodes.map(node => (
                <NodeRow key={node.id} node={node} isSelected={selectedNodeId === node.id} onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)} onDelete={onDeleteNode} />
              ))}
            </div>

            {/* Detail panel */}
            {selectedNode && (
              <NodeDetailPanel
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
                onApprove={onApprove}
                onFlag={onFlag}
                onAddComment={onAddComment}
                onSaveEdit={onSaveEdit}
                onAssign={onAssign}
                onRegenerate={() => {}}
                onDelete={onDeleteNode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.DashboardScreen = DashboardScreen;
