// AccessPath — Additional primitives: Toast, Skeleton, EmptyState, KeyboardKey

const { useState: useStateP, useEffect: useEffectP, useRef: useRefP, useContext, createContext } = React;

// ── Toast system ─────────────────────────────────────────
const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useStateP([]);

  const push = (toast) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, kind: "info", duration: 3200, ...toast };
    setToasts(ts => [...ts, t]);
    if (t.duration > 0) setTimeout(() => dismiss(id), t.duration);
    return id;
  };
  const dismiss = (id) => setToasts(ts => ts.filter(t => t.id !== id));

  const api = {
    info:    (msg, opts) => push({ kind: "info",    message: msg, ...opts }),
    success: (msg, opts) => push({ kind: "success", message: msg, ...opts }),
    error:   (msg, opts) => push({ kind: "error",   message: msg, ...opts, duration: 5200 }),
    warning: (msg, opts) => push({ kind: "warning", message: msg, ...opts }),
    dismiss,
  };

  const tones = {
    info:    { bg: "var(--surface)",   bd: "var(--border-strong)", fg: "var(--fg)",        icon: "messageSquare", iconColor: "var(--accent)"     },
    success: { bg: "var(--surface)",   bd: "#bbf7d0",              fg: "var(--fg)",        icon: "checkCircle",   iconColor: "#16a34a"           },
    error:   { bg: "var(--surface)",   bd: "#fecaca",              fg: "var(--fg)",        icon: "alertTriangle", iconColor: "#dc2626"           },
    warning: { bg: "var(--surface)",   bd: "#fde68a",              fg: "var(--fg)",        icon: "alertTriangle", iconColor: "#d97706"           },
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const tone = tones[t.kind] || tones.info;
          return (
            <div key={t.id} style={{
              minWidth: 280, maxWidth: 420, pointerEvents: "auto",
              background: tone.bg, color: tone.fg,
              border: `1px solid ${tone.bd}`, borderRadius: 8,
              boxShadow: "0 6px 24px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.04)",
              padding: "11px 14px", display: "flex", alignItems: "flex-start", gap: 10,
              animation: "toastIn 200ms cubic-bezier(.2,.9,.3,1.2)",
            }}>
              <Icon name={tone.icon} size={15} color={tone.iconColor} style={{ marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{t.title}</div>}
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--fg-muted)" }}>{t.message}</div>
                {t.action && (
                  <button onClick={() => { t.action.onClick(); api.dismiss(t.id); }} style={{
                    marginTop: 6, background: "none", border: "none", padding: 0,
                    color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>{t.action.label}</button>
                )}
              </div>
              <button onClick={() => api.dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--fg-subtle)" }}>
                <Icon name="x" size={13} color="var(--fg-subtle)" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes skelPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}</style>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext) || { info: ()=>{}, success: ()=>{}, error: ()=>{}, warning: ()=>{}, dismiss: ()=>{} };

// ── Skeleton ─────────────────────────────────────────────
const Skeleton = ({ w = "100%", h = 14, r = 4, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg, var(--hover-bg) 0%, var(--border) 50%, var(--hover-bg) 100%)",
    backgroundSize: "200% 100%",
    animation: "skelPulse 1.4s ease-in-out infinite",
    ...style,
  }} />
);

const SkeletonRows = ({ count = 6 }) => (
  <div style={{ padding: "0 16px" }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <Skeleton w={28} h={28} r={4} />
        <Skeleton w={`${30 + (i % 4) * 8}%`} h={12} />
        <div style={{ flex: 1 }} />
        <Skeleton w={60} h={20} r={9999} />
        <Skeleton w={40} h={16} r={4} />
        <Skeleton w={50} h={12} />
      </div>
    ))}
  </div>
);

// ── EmptyState ───────────────────────────────────────────
const EmptyState = ({ icon = "inbox", title, body, action, tone = "neutral" }) => {
  const toneColors = {
    neutral: { ring: "var(--border)",   bg: "var(--hover-bg)",         fg: "var(--fg-subtle)"   },
    success: { ring: "#bbf7d0",         bg: "#f0fdf4",                 fg: "#16a34a"            },
    info:    { ring: "var(--accent-border)", bg: "var(--accent-light)", fg: "var(--accent)"      },
  };
  const tc = toneColors[tone] || toneColors.neutral;
  return (
    <div style={{ padding: 56, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: tc.bg, border: `1.5px dashed ${tc.ring}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} color={tc.fg} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>{title}</div>
        {body && <div style={{ fontSize: 13, color: "var(--fg-muted)", maxWidth: 360, lineHeight: 1.55, margin: "0 auto" }}>{body}</div>}
      </div>
      {action}
    </div>
  );
};

// ── Keyboard key glyph ───────────────────────────────────
const Kbd = ({ children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 18, height: 18, padding: "0 5px",
    background: "var(--hover-bg)", border: "1px solid var(--border-strong)",
    borderBottomWidth: 2, borderRadius: 4,
    fontSize: 10.5, fontFamily: "var(--mono)", color: "var(--fg-muted)", fontWeight: 600,
    lineHeight: 1,
  }}>{children}</span>
);

// ── Switch / Toggle ──────────────────────────────────────
const Switch = ({ checked, onChange, label, desc }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>{desc}</div>}
    </div>
    <button onClick={() => onChange(!checked)} style={{
      width: 34, height: 20, borderRadius: 9999,
      background: checked ? "var(--accent)" : "var(--border-strong)",
      border: "none", padding: 0, position: "relative", cursor: "pointer",
      transition: "background 150ms", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: checked ? 16 : 2,
        width: 16, height: 16, background: "#fff", borderRadius: "50%",
        transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  </div>
);

Object.assign(window, { ToastProvider, useToast, Skeleton, SkeletonRows, EmptyState, Kbd, Switch });
