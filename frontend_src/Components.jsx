// AccessPath — Shared UI Components
// Adapted from Clear Course UI Kit

const { useState } = React;

// ── Icons ────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => {
  const paths = {
    home:         <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    file:         <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    clock:        <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    check:        <polyline points="20 6 9 17 4 12"/>,
    x:            <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    upload:       <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>,
    layers:       <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    chevronLeft:  <polyline points="15 18 9 12 15 6"/>,
    chevronDown:  <polyline points="6 9 12 15 18 9"/>,
    plus:         <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    activity:     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></>,
    checkCircle:  <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    xCircle:      <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    eye:          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    flag:         <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    refreshCw:    <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
    edit:         <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    sparkles:     <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/></>,
    arrowLeft:    <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    book:         <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    sun:          <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:         <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
    bell:         <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    users:        <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    video:        <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    hash:         <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
    image:        <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    messageSquare:<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    gitCommit:    <><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></>,
    link:         <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    alertTriangle:<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    inbox:        <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></>,
    zap:          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}>
      {paths[name] || null}
    </svg>
  );
};

// ── Status / Stage Badge ─────────────────────────────────
const stageConfig = {
  "ingested":     { label: "Ingested",     bg: "#f8fafc", fg: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  "ai-generated": { label: "AI Generated", bg: "#f5f3ff", fg: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed" },
  "in-review":    { label: "In Review",    bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  "approved":     { label: "Approved",     bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
  "flagged":      { label: "Flagged",      bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
  "pending":      { label: "Pending",      bg: "#fffbeb", fg: "#b45309", border: "#fde68a", dot: "#d97706" },
};

const Badge = ({ stage, label, size = "sm" }) => {
  const cfg = stageConfig[stage] || stageConfig["pending"];
  const fs = size === "sm" ? 11 : 12;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      borderRadius: 9999, fontSize: fs, fontWeight: 500,
      padding: size === "sm" ? "2px 8px" : "3px 10px",
      border: `1px solid ${cfg.border}`,
      background: cfg.bg, color: cfg.fg, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }}></span>
      {label || cfg.label}
    </span>
  );
};

// ── Confidence Pill ──────────────────────────────────────
const ConfidencePill = ({ value }) => {
  if (value === null || value === undefined) return (
    <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--mono)" }}>—</span>
  );
  const color = value >= 90 ? "#15803d" : value >= 70 ? "#b45309" : "#b91c1c";
  const bg    = value >= 90 ? "#f0fdf4"  : value >= 70 ? "#fffbeb"  : "#fef2f2";
  const border= value >= 90 ? "#bbf7d0"  : value >= 70 ? "#fde68a"  : "#fecaca";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, border: `1px solid ${border}`, borderRadius: 4, padding: "1px 6px", fontFamily: "var(--mono)" }}>
      {value}%
    </span>
  );
};

// ── Type Icon chip ───────────────────────────────────────
const typeConfig = {
  "Figure":   { icon: "image",   color: "#0369a1", bg: "#e0f2fe" },
  "Equation": { icon: "hash",    color: "#6d28d9", bg: "#f5f3ff" },
  "Video":    { icon: "video",   color: "#be185d", bg: "#fdf2f8" },
  "Text":     { icon: "file",    color: "#374151", bg: "#f3f4f6" },
  "Problem":  { icon: "book",    color: "#b45309", bg: "#fffbeb" },
};

const TypeChip = ({ type }) => {
  const cfg = typeConfig[type] || { icon: "file", color: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, borderRadius: 4, fontSize: 11, fontWeight: 500, padding: "2px 7px" }}>
      <Icon name={cfg.icon} size={11} color={cfg.color} />
      {type}
    </span>
  );
};

// ── Tag ─────────────────────────────────────────────────
const Tag = ({ children }) => (
  <span style={{
    background: "var(--hover-bg)", color: "var(--fg-muted)", borderRadius: 3,
    fontSize: 11, fontWeight: 500, padding: "1px 6px",
    border: "1px solid var(--border)", whiteSpace: "nowrap",
  }}>{children}</span>
);

// ── Button ───────────────────────────────────────────────
const Button = ({ children, variant = "primary", size = "md", onClick, disabled, icon, title }) => {
  const variants = {
    primary:     { bg: "var(--accent)",  hov: "var(--accent-dark)", color: "var(--accent-fg)", border: "transparent" },
    secondary:   { bg: "var(--surface)", hov: "var(--hover-bg)",    color: "var(--fg)",        border: "var(--border-strong)" },
    ghost:       { bg: "transparent",   hov: "var(--hover-bg)",    color: "var(--fg-muted)",  border: "transparent" },
    destructive: { bg: "transparent",   hov: "#fef2f2",            color: "#b91c1c",           border: "#fecaca" },
    success:     { bg: "transparent",   hov: "#f0fdf4",            color: "#15803d",           border: "#bbf7d0" },
    warning:     { bg: "transparent",   hov: "#fffbeb",            color: "#b45309",           border: "#fde68a" },
    solidSuccess:{ bg: "#16a34a",       hov: "#15803d",            color: "#fff",              border: "transparent" },
    solidDanger: { bg: "#dc2626",       hov: "#b91c1c",            color: "#fff",              border: "transparent" },
  };
  const sizes = { xs: { h: 24, px: 8, fs: 11 }, sm: { h: 28, px: 10, fs: 12 }, md: { h: 32, px: 12, fs: 13 }, lg: { h: 38, px: 16, fs: 14 } };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        height: s.h, padding: `0 ${s.px}px`,
        background: hov ? v.hov : v.bg, color: v.color,
        border: `1px solid ${v.border}`, borderRadius: 5,
        fontSize: s.fs, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, fontFamily: "inherit",
        transition: "background 120ms, border-color 120ms", whiteSpace: "nowrap",
        userSelect: "none",
      }}>
      {icon && <Icon name={icon} size={s.fs} color={v.color} />}
      {children}
    </button>
  );
};

// ── Assignee Avatar ──────────────────────────────────────
const Avatar = ({ email, size = 20 }) => {
  if (!email) return <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>—</span>;
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();
  const colors = { "ta": "#dbeafe:#1d4ed8", "pr": "#dcfce7:#15803d", "ob": "#fef3c7:#b45309" };
  const key = email.slice(0, 2);
  const [bg, fg] = (colors[key] || "#f3f4f6:#374151").split(":");
  return (
    <span title={email} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: "50%", background: bg, color: fg, fontSize: size * 0.42, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </span>
  );
};

// ── Sidebar ──────────────────────────────────────────────
const SIDEBAR_COURSES = [
  { id: "me274",   code: "ME 274",   name: "Engineering Dynamics",  pct: 67, chipBg: "#dbeafe", chipFg: "#1d4ed8" },
  { id: "cs180",   code: "CS 180",   name: "Problem Solving & OOP", pct: 94, chipBg: "#dcfce7", chipFg: "#15803d" },
  { id: "phys172", code: "PHYS 172", name: "Modern Mechanics",      pct: 13, chipBg: "#fef9c3", chipFg: "#854d0e" },
];

const SidebarItem = ({ item, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7, padding: "5px 8px",
        borderRadius: 5, marginBottom: 1, cursor: "pointer", fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        background: isActive ? "var(--accent-light)" : hov ? "var(--hover-bg)" : "transparent",
        color: isActive ? "var(--accent)" : hov ? "var(--fg)" : "var(--fg-muted)",
        transition: "background 100ms, color 100ms",
      }}>
      <Icon name={item.icon} size={14} color={isActive ? "var(--accent)" : hov ? "var(--fg)" : "var(--fg-subtle)"} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.count != null && (
        <span style={{ fontSize: 10.5, fontWeight: 600, background: "var(--accent-light)", color: "var(--accent)", padding: "0 5px", borderRadius: 9999, minWidth: 18, textAlign: "center" }}>{item.count}</span>
      )}
    </div>
  );
};

const Sidebar = ({ active, setActive, activeCourse, setActiveCourse, user, flagCount, courses, onDeleteCourse }) => {
  const [coursesOpen, setCoursesOpen] = useState(true);
  return (
    <div style={{
      width: 240, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", flexShrink: 0, userSelect: "none",
    }}>
      {/* Logo */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: "var(--accent)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="layers" size={13} color="var(--accent-fg)" />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.01em" }}>AccessPath</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 8, overflowY: "auto" }}>
        <SidebarItem item={{ id: "dashboard", icon: "home",  label: "Dashboard" }} isActive={active === "dashboard" && !activeCourse} onClick={() => { setActive("dashboard"); setActiveCourse(null); }} />
        <SidebarItem item={{ id: "review",    icon: "inbox", label: "Review Queue", count: flagCount }} isActive={active === "review" && !activeCourse} onClick={() => { setActive("review"); setActiveCourse(null); }} />
        <SidebarItem item={{ id: "upload",    icon: "upload",label: "Upload" }} isActive={active === "upload"} onClick={() => { setActive("upload"); setActiveCourse(null); }} />

        <div style={{ height: 1, background: "var(--border)", margin: "6px 4px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 4px" }}>
          <span onClick={() => { setActive("courses"); setActiveCourse(null); }}
            style={{ fontSize: 10.5, fontWeight: 600, color: active === "courses" ? "var(--accent)" : "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.07em", cursor: "pointer" }}>My Courses</span>
          <Icon name={coursesOpen ? "chevronDown" : "chevronRight"} size={12} color="var(--fg-subtle)"
            style={{ cursor: "pointer" }} onClick={() => setCoursesOpen(o => !o)} /></div>

        {coursesOpen && (courses || SIDEBAR_COURSES).map(course => {
          const isActive = activeCourse === course.id;
          return (
            <div key={course.id}
              onClick={() => { setActiveCourse(course.id); setActive("dashboard"); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                borderRadius: 5, marginBottom: 1, cursor: "pointer", position: "relative",
                background: isActive ? "var(--accent-light)" : "transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.querySelector(".del-btn").style.opacity = "1"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.querySelector(".del-btn").style.opacity = "0"; }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: course.chipBg || "#dbeafe", color: course.chipFg || "#1d4ed8", flexShrink: 0 }}>{course.code}</span>
              <span style={{ fontSize: 12.5, color: isActive ? "var(--accent)" : "var(--fg-muted)", fontWeight: isActive ? 500 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.name}</span>
              <button className="del-btn" onClick={e => { e.stopPropagation(); onDeleteCourse && onDeleteCourse(course.id); }} style={{
                opacity: 0, background: "none", border: "none", cursor: "pointer", padding: "2px 3px",
                borderRadius: 3, display: "flex", alignItems: "center", flexShrink: 0, transition: "opacity 100ms",
              }}>
                <Icon name="trash2" size={12} color="#dc2626" />
              </button>
            </div>
          );
        })}

        <div style={{ height: 1, background: "var(--border)", margin: "6px 4px" }} />
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 8px" }}>System</div>
        <SidebarItem item={{ id: "activity", icon: "activity", label: "Activity" }}   isActive={active === "activity"} onClick={() => setActive("activity")} />
        <SidebarItem item={{ id: "settings", icon: "settings", label: "Settings" }}   isActive={active === "settings"} onClick={() => setActive("settings")} />
      </nav>

      {/* User */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar email={user.email} size={26} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-subtle)", textTransform: "capitalize" }}>{user.role}</div>
        </div>
      </div>
    </div>
  );
};

// ── PageHeader ───────────────────────────────────────────
const PageHeader = ({ title, subtitle, actions, meta }) => (
  <div style={{ padding: "14px 24px 0", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 13 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 3 : 0 }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>{title}</h1>
          {meta && meta}
        </div>
        {subtitle && <p style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  </div>
);

// ── ProgressBar ──────────────────────────────────────────
const ProgressBar = ({ approved, total, showLabel = true }) => {
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const color = pct === 100 ? "#16a34a" : pct >= 60 ? "var(--accent)" : "#d97706";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 4, background: "var(--hover-bg)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 400ms" }} />
      </div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontSize: 10.5, color: "var(--fg-muted)" }}>{approved}/{total} approved</span>
          <span style={{ fontSize: 10.5, color, fontWeight: 500 }}>{pct}%</span>
        </div>
      )}
    </div>
  );
};

// ── Deadline Chip ─────────────────────────────────────────
const DeadlineChip = ({ days }) => {
  const urgent = days <= 3;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600,
      padding: "3px 10px", borderRadius: 9999,
      background: urgent ? "#fef2f2" : "#fffbeb",
      color: urgent ? "#b91c1c" : "#b45309",
      border: `1px solid ${urgent ? "#fecaca" : "#fde68a"}`,
    }}>
      <Icon name="clock" size={12} color={urgent ? "#b91c1c" : "#b45309"} />
      {days}d to deadline · May 1
    </span>
  );
};

// ── Model Tag ─────────────────────────────────────────────
const ModelTag = ({ model }) => {
  if (!model) return <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>—</span>;
  const short = { "claude-3-5-sonnet": "claude-3.5", "gpt-4o": "gpt-4o", "whisper-v3": "whisper-v3", "gemini-1.5-pro": "gemini-1.5" };
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg-muted)", background: "var(--hover-bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px" }}>
      {short[model] || model}
    </span>
  );
};

Object.assign(window, {
  Icon, Badge, Tag, Button, Avatar, TypeChip, ConfidencePill, ModelTag, DeadlineChip,
  Sidebar, SidebarItem, PageHeader, ProgressBar, stageConfig, SIDEBAR_COURSES,
});
