// AccessPath — Courses index / picker

const { useState: useStateC } = React;

const CHIP_COLORS = [
  { chipBg: "#dbeafe", chipFg: "#1d4ed8" },
  { chipBg: "#dcfce7", chipFg: "#15803d" },
  { chipBg: "#fef9c3", chipFg: "#854d0e" },
  { chipBg: "#f3e8ff", chipFg: "#6b21a8" },
  { chipBg: "#ffe4e6", chipFg: "#9f1239" },
];

const CoursesScreen = ({ courses, onCreateCourse, setActiveCourse, setView }) => {
  const [query, setQuery] = useStateC("");
  const [showForm, setShowForm] = useStateC(false);
  const [form, setForm] = useStateC({ code: "", name: "", term: "Spring 2026" });
  const [saving, setSaving] = useStateC(false);
  const toast = useToast();

  const visible = (courses || []).filter(c =>
    !query || (c.code + " " + c.name).toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Course code and name are required.");
      return;
    }
    setSaving(true);
    try {
      const created = await api.createCourse(form);
      onCreateCourse(created);
      setForm({ code: "", name: "", term: "Spring 2026" });
      setShowForm(false);
      toast.success(`Course "${created.name}" created.`);
    } catch (e) {
      toast.error("Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <PageHeader
        title="My Courses"
        subtitle="Every course you have access to across this institution"
        actions={
          <Button variant="primary" size="sm" icon="plus" onClick={() => setShowForm(s => !s)}>New course</Button>
        }
      />

      {showForm && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="ME 274"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none", width: 110 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Engineering Dynamics"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none", width: 240 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Term</label>
            <input value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} placeholder="Spring 2026"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none", width: 130 }} />
          </div>
          <Button variant="primary" size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", minWidth: 220 }}>
          <Icon name="eye" size={13} color="var(--fg-subtle)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses…"
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--fg)", fontFamily: "inherit", width: "100%" }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {visible.length === 0 && (
          <EmptyState icon="book" title="No courses yet" body={'Click "New course" above to create your first course.'} />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {visible.map((c, i) => {
            const colors = CHIP_COLORS[i % CHIP_COLORS.length];
            return (
              <div key={c.id} onClick={() => { setActiveCourse(c.id); setView("dashboard"); }} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
                padding: 18, cursor: "pointer", transition: "transform 120ms, box-shadow 120ms, border-color 120ms",
                display: "flex", flexDirection: "column", gap: 14,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: colors.chipBg, color: colors.chipFg, fontFamily: "var(--mono)" }}>{c.code}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 4, lineHeight: 1.3 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.term}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>Created {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CoursesScreen });
