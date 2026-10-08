// AccessPath — Review Queue Screen (with bulk actions + keyboard shortcuts)
const { useState: useStateR, useMemo: useMemoR, useEffect: useEffectR } = React;

const URGENCY_ORDER = { "flagged": 0, "in-review": 1, "ai-generated": 2, "ingested": 3, "approved": 4 };

const ReviewQueueScreen = ({ nodes: allNodes, selectedNodeId, setSelectedNodeId, onApprove, onFlag, onRegenerate, onAddComment, onSaveEdit, onAssign }) => {
  const [typeFilter, setTypeFilter] = useStateR("all");
  const [sortBy, setSortBy] = useStateR("urgency");
  const [selected, setSelected] = useStateR(new Set()); // bulk
  const toast = useToast();

  const queueNodes = useMemoR(() => {
    let ns = allNodes.filter(n => n.stage !== "approved");
    if (typeFilter !== "all") ns = ns.filter(n => n.type === typeFilter);
    if (sortBy === "urgency") {
      ns = [...ns].sort((a, b) => {
        const stageDiff = (URGENCY_ORDER[a.stage] ?? 5) - (URGENCY_ORDER[b.stage] ?? 5);
        if (stageDiff !== 0) return stageDiff;
        return (a.confidence ?? 100) - (b.confidence ?? 100);
      });
    } else if (sortBy === "confidence") {
      ns = [...ns].sort((a, b) => (a.confidence ?? 101) - (b.confidence ?? 101));
    } else if (sortBy === "type") {
      ns = [...ns].sort((a, b) => a.type.localeCompare(b.type));
    }
    return ns;
  }, [allNodes, typeFilter, sortBy]);

  const selectedNode = selectedNodeId ? allNodes.find(n => n.id === selectedNodeId) : null;
  const selectedIndex = selectedNode ? queueNodes.findIndex(n => n.id === selectedNode.id) : -1;

  // Keyboard shortcuts
  useEffectR(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "j" || k === "arrowdown") {
        e.preventDefault();
        if (queueNodes.length === 0) return;
        const next = selectedIndex < 0 ? 0 : Math.min(queueNodes.length - 1, selectedIndex + 1);
        setSelectedNodeId(queueNodes[next].id);
      } else if (k === "k" || k === "arrowup") {
        e.preventDefault();
        if (queueNodes.length === 0) return;
        const prev = selectedIndex < 0 ? 0 : Math.max(0, selectedIndex - 1);
        setSelectedNodeId(queueNodes[prev].id);
      } else if (k === "a" && selectedNode && selectedNode.stage !== "approved") {
        e.preventDefault();
        onApprove(selectedNode.id);
        toast.success(`Approved: ${selectedNode.title}`);
      } else if (k === "f" && selectedNode && selectedNode.stage !== "flagged") {
        e.preventDefault();
        onFlag(selectedNode.id);
        toast.warning(`Flagged: ${selectedNode.title}`);
      } else if (k === "escape") {
        if (selected.size > 0) setSelected(new Set());
        else setSelectedNodeId(null);
      } else if (k === "x" && selectedNode) {
        e.preventDefault();
        setSelected(s => {
          const next = new Set(s);
          if (next.has(selectedNode.id)) next.delete(selectedNode.id); else next.add(selectedNode.id);
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queueNodes, selectedIndex, selectedNode, selected, onApprove, onFlag, setSelectedNodeId]);

  const counts = useMemoR(() => ({
    all:      allNodes.filter(n => n.stage !== "approved").length,
    Figure:   allNodes.filter(n => n.stage !== "approved" && n.type === "Figure").length,
    Equation: allNodes.filter(n => n.stage !== "approved" && n.type === "Equation").length,
    Video:    allNodes.filter(n => n.stage !== "approved" && n.type === "Video").length,
    Text:     allNodes.filter(n => n.stage !== "approved" && n.type === "Text").length,
    Problem:  allNodes.filter(n => n.stage !== "approved" && n.type === "Problem").length,
  }), [allNodes]);

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const toggleAll = () => {
    if (selected.size === queueNodes.length) setSelected(new Set());
    else setSelected(new Set(queueNodes.map(n => n.id)));
  };
  const bulkApprove = () => {
    selected.forEach(id => {
      const n = allNodes.find(x => x.id === id);
      if (n && n.stage !== "approved") onApprove(id);
    });
    toast.success(`Approved ${selected.size} node${selected.size === 1 ? "" : "s"}`);
    setSelected(new Set());
  };
  const bulkFlag = () => {
    selected.forEach(id => {
      const n = allNodes.find(x => x.id === id);
      if (n && n.stage !== "flagged") onFlag(id);
    });
    toast.warning(`Flagged ${selected.size} node${selected.size === 1 ? "" : "s"}`);
    setSelected(new Set());
  };
  const bulkAssign = () => {
    selected.forEach(id => onAssign(id, "ta@example.com"));
    toast.info(`Assigned ${selected.size} to ta`);
    setSelected(new Set());
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader
        title="Review Queue"
        subtitle={`${queueNodes.length} nodes need attention · sorted by urgency`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--fg-subtle)" }}>
              <Kbd>J</Kbd>/<Kbd>K</Kbd><span>nav</span>
              <Kbd>A</Kbd><span>approve</span>
              <Kbd>F</Kbd><span>flag</span>
              <Kbd>X</Kbd><span>select</span>
            </div>
            <div style={{ width: 1, height: 18, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              fontSize: 12.5, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 5,
              background: "var(--surface)", color: "var(--fg)", fontFamily: "inherit", cursor: "pointer", outline: "none",
            }}>
              <option value="urgency">Urgency</option>
              <option value="confidence">AI Confidence ↑</option>
              <option value="type">Content Type</option>
            </select>
          </div>
        }
      />

      {/* Type filter tabs */}
      <div style={{ display: "flex", gap: 4, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
        {[["all","All"], ["Figure","Figures"], ["Equation","Equations"], ["Video","Videos"], ["Text","Text"], ["Problem","Problems"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setTypeFilter(val)} style={{
            padding: "4px 12px", borderRadius: 5, fontSize: 12, fontWeight: 500,
            border: "1px solid", cursor: "pointer", fontFamily: "inherit",
            background: typeFilter === val ? "var(--accent)" : "var(--surface)",
            color: typeFilter === val ? "var(--accent-fg)" : "var(--fg-muted)",
            borderColor: typeFilter === val ? "var(--accent)" : "var(--border)",
            transition: "all 120ms",
          }}>{lbl} ({counts[val] ?? 0})</button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          padding: "8px 20px", background: "var(--accent-light)", borderBottom: "1px solid var(--accent-border)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>
            {selected.size} selected
          </span>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button variant="secondary" size="sm" icon="users" onClick={bulkAssign}>Assign to TA</Button>
          <Button variant="warning" size="sm" icon="flag" onClick={bulkFlag}>Flag all</Button>
          <Button variant="solidSuccess" size="sm" icon="check" onClick={bulkApprove}>Approve all</Button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Queue list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "28px 1fr 90px 110px 72px 120px 90px",
            padding: "0 20px", height: 34, background: "var(--hover-bg)",
            borderBottom: "1px solid var(--border)", alignItems: "center",
            position: "sticky", top: 0, zIndex: 2, gap: 8,
          }}>
            <input type="checkbox"
              checked={queueNodes.length > 0 && selected.size === queueNodes.length}
              ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < queueNodes.length; }}
              onChange={toggleAll}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            {["Node", "Type", "Stage", "Confidence", "Assignee", "Updated"].map(h => (
              <div key={h} style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>

          {queueNodes.length === 0 && (
            <EmptyState icon="checkCircle" tone="success" title="Queue is clear!"
              body="Every node in this view has been reviewed and approved. Time for a coffee." />
          )}

          {queueNodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isChecked = selected.has(node.id);
            const urgencyLabel = node.stage === "flagged" ? "⚑ Flagged" : node.stage === "in-review" ? "Awaiting review" : node.stage === "ai-generated" ? "Needs assignment" : "Queued";
            return (
              <div key={node.id} onClick={() => setSelectedNodeId(isSelected ? null : node.id)} style={{
                display: "grid", gridTemplateColumns: "28px 1fr 90px 110px 72px 120px 90px",
                alignItems: "center", padding: "0 20px", height: 50, cursor: "pointer", gap: 8,
                borderBottom: "1px solid var(--border)",
                background: isSelected ? "var(--accent-light)" : isChecked ? "var(--accent-light)" : node.stage === "flagged" ? "#fff8f8" : "transparent",
                borderLeft: `3px solid ${isSelected ? "var(--accent)" : node.stage === "flagged" ? "#fecaca" : "transparent"}`,
                transition: "background 100ms",
              }}
                onMouseEnter={e => { if (!isSelected && !isChecked) e.currentTarget.style.background = "var(--hover-bg)"; }}
                onMouseLeave={e => { if (!isSelected && !isChecked) e.currentTarget.style.background = node.stage === "flagged" ? "#fff8f8" : "transparent"; }}
              >
                <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(node.id)} onClick={e => e.stopPropagation()}
                  style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{node.title}</div>
                  <div style={{ fontSize: 11, color: node.stage === "flagged" ? "#b91c1c" : "var(--fg-subtle)" }}>{urgencyLabel}</div>
                </div>
                <TypeChip type={node.type} />
                <Badge stage={node.stage} />
                <ConfidencePill value={node.confidence} />
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {node.assignee
                    ? <><Avatar email={node.assignee} size={18} /><span style={{ fontSize: 11.5, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.assignee.split("@")[0]}</span></>
                    : <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>—</span>
                  }
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--mono)" }}>{node.updatedAt}</div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onApprove={onApprove}
            onFlag={onFlag}
            onRegenerate={onRegenerate}
            onAddComment={onAddComment}
            onSaveEdit={onSaveEdit}
            onAssign={onAssign}
          />
        )}
      </div>
    </div>
  );
};

window.ReviewQueueScreen = ReviewQueueScreen;
