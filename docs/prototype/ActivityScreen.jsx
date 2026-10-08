// AccessPath — Activity feed (audit log)

const { useMemo: useMemoA, useState: useStateA } = React;

const ICON_FOR_ACTION = {
  approved:    { icon: "checkCircle", color: "#16a34a", bg: "#f0fdf4", bd: "#bbf7d0" },
  flagged:     { icon: "flag",        color: "#dc2626", bg: "#fef2f2", bd: "#fecaca" },
  edited:      { icon: "edit",        color: "var(--accent)", bg: "var(--accent-light)", bd: "var(--accent-border)" },
  regenerated: { icon: "refreshCw",   color: "#7c3aed", bg: "var(--status-ai-bg)", bd: "var(--status-ai-border)" },
  commented:   { icon: "messageSquare", color: "var(--fg-muted)", bg: "var(--hover-bg)", bd: "var(--border)" },
  ingested:    { icon: "zap",         color: "var(--fg-muted)", bg: "var(--hover-bg)", bd: "var(--border)" },
  assigned:    { icon: "users",       color: "var(--accent)", bg: "var(--accent-light)", bd: "var(--accent-border)" },
};

const ACTION_LABEL = {
  approved:    (n) => `approved ${n.title}`,
  flagged:     (n) => `flagged ${n.title}`,
  edited:      (n) => `edited ${n.title}`,
  regenerated: (n) => `regenerated ${n.title}`,
  commented:   (n) => `commented on ${n.title}`,
  ingested:    (n) => `ingested ${n.title}`,
  assigned:    (n) => `was assigned ${n.title}`,
};

// Derive an activity stream from nodes' edit history + comments
const buildActivity = (nodes) => {
  const items = [];
  nodes.forEach(n => {
    (n.editHistory || []).forEach((h, i) => {
      const action =
        /approve/i.test(h.label) ? "approved" :
        /flag/i.test(h.label)    ? "flagged" :
        /edit/i.test(h.label)    ? "edited" :
        /regen/i.test(h.label)   ? "regenerated" :
        /ingest/i.test(h.label)  ? "ingested" :
        /assign/i.test(h.label)  ? "assigned" :
        "edited";
      items.push({
        id: `${n.id}-h${i}`,
        nodeId: n.id, title: n.title, type: n.type, lectureId: n.lectureId,
        action, actor: h.by, note: h.note, at: h.at, _t: Date.parse(`2026/${h.at}`) || i,
      });
    });
    (n.comments || []).forEach((c, i) => items.push({
      id: `${n.id}-c${i}`,
      nodeId: n.id, title: n.title, type: n.type, lectureId: n.lectureId,
      action: "commented", actor: c.author, note: c.text, at: c.at, _t: Date.parse(`2026/${c.at}`) || i,
    }));
  });
  return items.sort((a, b) => (b._t || 0) - (a._t || 0));
};

const ActivityScreen = ({ nodes, setView, setSelectedNodeId }) => {
  const items = useMemoA(() => buildActivity(nodes), [nodes]);
  const [filter, setFilter] = useStateA("all");
  const [actorFilter, setActorFilter] = useStateA("all");

  const filtered = items.filter(i => {
    if (filter !== "all" && i.action !== filter) return false;
    if (actorFilter !== "all" && i.actor !== actorFilter) return false;
    return true;
  });

  const actors = Array.from(new Set(items.map(i => i.actor)));
  const counts = {
    all: items.length,
    approved: items.filter(i => i.action === "approved").length,
    flagged: items.filter(i => i.action === "flagged").length,
    edited: items.filter(i => i.action === "edited").length,
    regenerated: items.filter(i => i.action === "regenerated").length,
    commented: items.filter(i => i.action === "commented").length,
  };

  // Group by day label
  const groups = [];
  let current = null;
  filtered.forEach(i => {
    const day = (i.at || "").split(",")[0] || "Earlier";
    if (!current || current.day !== day) { current = { day, items: [] }; groups.push(current); }
    current.items.push(i);
  });

  const openNode = (nodeId) => { setSelectedNodeId(nodeId); setView("dashboard"); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader
        title="Activity"
        subtitle={`${items.length} events · audit log of every review action`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>Actor:</span>
            <select value={actorFilter} onChange={e => setActorFilter(e.target.value)} style={{
              fontSize: 12.5, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 5,
              background: "var(--surface)", color: "var(--fg)", fontFamily: "inherit", cursor: "pointer", outline: "none",
            }}>
              <option value="all">All actors</option>
              {actors.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        }
      />

      {/* Action filter pills */}
      <div style={{ display: "flex", gap: 4, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, flexWrap: "wrap" }}>
        {[["all","All"], ["approved","Approvals"], ["flagged","Flags"], ["edited","Edits"], ["regenerated","Regens"], ["commented","Comments"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "4px 12px", borderRadius: 5, fontSize: 12, fontWeight: 500,
            border: "1px solid", cursor: "pointer", fontFamily: "inherit",
            background: filter === v ? "var(--accent)" : "var(--surface)",
            color: filter === v ? "var(--accent-fg)" : "var(--fg-muted)",
            borderColor: filter === v ? "var(--accent)" : "var(--border)",
            transition: "all 120ms",
          }}>{l} ({counts[v] ?? 0})</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          {filtered.length === 0 && (
            <EmptyState icon="activity" title="No activity yet" body="When team members approve, flag, edit, or comment on a node, it'll show up here." />
          )}

          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 10, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>{g.day}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                {g.items.map((i, idx) => {
                  const cfg = ICON_FOR_ACTION[i.action] || ICON_FOR_ACTION.edited;
                  const isAi = i.actor === "ai" || i.actor === "system";
                  return (
                    <div key={i.id} onClick={() => openNode(i.nodeId)} style={{
                      display: "flex", gap: 12, padding: "12px 4px", cursor: "pointer", borderRadius: 6,
                      position: "relative",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Connecting line */}
                      {idx < g.items.length - 1 && (
                        <div style={{ position: "absolute", left: 17, top: 38, bottom: -2, width: 1, background: "var(--border)" }} />
                      )}
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: cfg.bg, border: `1.5px solid ${cfg.bd}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, zIndex: 1,
                      }}>
                        <Icon name={cfg.icon} size={12} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                          {!isAi && <Avatar email={i.actor} size={16} />}
                          <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>
                            {isAi ? (i.actor === "system" ? "System" : "AI") : i.actor.split("@")[0]}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                            {ACTION_LABEL[i.action] ? ACTION_LABEL[i.action](i) : `${i.action} ${i.title}`}
                          </span>
                          <TypeChip type={i.type} />
                        </div>
                        {i.note && (
                          <div style={{ fontSize: 12.5, color: "var(--fg-muted)", background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", lineHeight: 1.5, marginTop: 4 }}>
                            {i.note}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--mono)", marginTop: 4 }}>{i.at}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.ActivityScreen = ActivityScreen;
