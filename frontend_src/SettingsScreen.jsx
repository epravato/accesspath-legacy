// AccessPath — Settings screen

const { useState: useStateS } = React;

const SettingsScreen = ({ user, dark, setDark, uni, setUni, activeCourse, onDeleteCourse }) => {
  const [tab, setTab] = useStateS("account");
  const toast = useToast();

  const tabs = [
    { id: "account",       icon: "users",     label: "Account" },
    { id: "team",          icon: "users",     label: "Team & Roles" },
    { id: "notifications", icon: "bell",      label: "Notifications" },
    { id: "ai",            icon: "sparkles",  label: "AI Models" },
    { id: "appearance",    icon: "sun",       label: "Appearance" },
    { id: "danger",        icon: "alertTriangle", label: "Danger Zone" },
  ];

  const [notifApprovals, setNotifApprovals]   = useStateS(true);
  const [notifFlags, setNotifFlags]           = useStateS(true);
  const [notifMentions, setNotifMentions]     = useStateS(true);
  const [notifDigest, setNotifDigest]         = useStateS(false);
  const [autoAssign, setAutoAssign]           = useStateS(true);
  const [autoRegen, setAutoRegen]             = useStateS(false);
  const [modelFigure, setModelFigure]         = useStateS("claude-3-5-sonnet");
  const [modelEquation, setModelEquation]     = useStateS("gpt-4o");
  const [modelVideo, setModelVideo]           = useStateS("whisper-v3");
  const [confThreshold, setConfThreshold]     = useStateS(75);

  const TEAM = [
    { email: "prof@example.com", name: "Prof. Doubert",  role: "instructor", added: "Jan 12, 2026" },
    { email: "ta@example.com",   name: "Riya Patel",     role: "ta",         added: "Jan 14, 2026" },
    { email: "observer@example.com", name: "Dean Office", role: "observer",  added: "Feb 02, 2026" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Settings sidebar */}
      <div style={{ width: 220, borderRight: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, padding: "16px 10px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px 10px" }}>Settings</div>
        {tabs.map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
            borderRadius: 5, cursor: "pointer", marginBottom: 2,
            background: tab === t.id ? "var(--accent-light)" : "transparent",
            color: tab === t.id ? "var(--accent)" : "var(--fg-muted)",
            fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
          }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "var(--hover-bg)"; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={t.icon} size={13} color={tab === t.id ? "var(--accent)" : "var(--fg-subtle)"} />
            {t.label}
          </div>
        ))}
      </div>

      {/* Settings content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 680, padding: "32px 40px" }}>
          {tab === "account" && (
            <>
              <SettingsHeader title="Account" subtitle="Your profile and sign-in details" />
              <Card>
                <Row>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar email={user.email} size={48} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{user.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 2, textTransform: "capitalize" }}>{user.role}</div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Change avatar</Button>
                </Row>
                <Divider />
                <Field label="Display name" value={user.name} />
                <Field label="Email" value={user.email} mono />
                <Field label="Role" value={user.role} mono />
              </Card>
            </>
          )}

          {tab === "team" && (
            <>
              <SettingsHeader title="Team & Roles" subtitle="Who can review accessibility content for this course"
                action={<Button variant="primary" size="sm" icon="plus" onClick={() => toast.info("Invite flow not yet wired")}>Invite</Button>}
              />
              <Card pad={0}>
                {TEAM.map((m, i) => (
                  <div key={m.email} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < TEAM.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <Avatar email={m.email} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{m.email} · added {m.added}</div>
                    </div>
                    <Badge stage={m.role === "instructor" ? "approved" : m.role === "ta" ? "in-review" : "ingested"} label={m.role.toUpperCase()} />
                    <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 8px", color: "var(--fg-muted)", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === "notifications" && (
            <>
              <SettingsHeader title="Notifications" subtitle="Tell us when to ping you" />
              <Card>
                <Switch checked={notifApprovals} onChange={setNotifApprovals}
                  label="Approval requests" desc="When a TA assigns you a node to approve." />
                <Divider />
                <Switch checked={notifFlags} onChange={setNotifFlags}
                  label="Flagged content" desc="When the AI confidence is below threshold or a reviewer flags a node." />
                <Divider />
                <Switch checked={notifMentions} onChange={setNotifMentions}
                  label="@mentions in comments" desc="When someone tags you in a node comment thread." />
                <Divider />
                <Switch checked={notifDigest} onChange={setNotifDigest}
                  label="Weekly digest" desc="Summary of review activity every Monday at 8am." />
              </Card>
            </>
          )}

          {tab === "ai" && (
            <>
              <SettingsHeader title="AI Models" subtitle="Pick which model handles each content type, and tune the automation." />
              <Card>
                <ModelPicker label="Figures & diagrams" value={modelFigure} onChange={setModelFigure}
                  options={["claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]} />
                <Divider />
                <ModelPicker label="Equations & formulas" value={modelEquation} onChange={setModelEquation}
                  options={["gpt-4o", "claude-3-5-sonnet", "mathpix-ocr"]} />
                <Divider />
                <ModelPicker label="Videos (captions)" value={modelVideo} onChange={setModelVideo}
                  options={["whisper-v3", "deepgram-nova-2", "azure-speech"]} />
                <Divider />
                <div style={{ padding: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>Auto-flag threshold</div>
                      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Anything below this confidence is auto-flagged for review.</div>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{confThreshold}%</span>
                  </div>
                  <input type="range" min={50} max={95} step={5} value={confThreshold} onChange={e => setConfThreshold(+e.target.value)}
                    style={{ width: "100%", accentColor: "var(--accent)" }} />
                </div>
                <Divider />
                <Switch checked={autoAssign} onChange={setAutoAssign}
                  label="Auto-assign to last reviewer" desc="When new content is ingested, assign it to whoever last reviewed similar content." />
                <Divider />
                <Switch checked={autoRegen} onChange={setAutoRegen}
                  label="Auto-regenerate flagged" desc="If a TA flags output, automatically request a regeneration before re-queueing." />
              </Card>
            </>
          )}

          {tab === "appearance" && (
            <>
              <SettingsHeader title="Appearance" subtitle="Theme and accent — synced across the demo." />
              <Card>
                <div style={{ padding: "10px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", marginBottom: 8 }}>Theme</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ id: false, label: "Light", icon: "sun" }, { id: true, label: "Dark", icon: "moon" }].map(opt => (
                      <button key={opt.label} onClick={() => setDark(opt.id)} style={{
                        flex: 1, padding: "14px", border: `1.5px solid ${dark === opt.id ? "var(--accent)" : "var(--border)"}`,
                        background: dark === opt.id ? "var(--accent-light)" : "var(--surface)", borderRadius: 8,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit",
                      }}>
                        <Icon name={opt.icon} size={18} color={dark === opt.id ? "var(--accent)" : "var(--fg-muted)"} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: dark === opt.id ? "var(--accent)" : "var(--fg)" }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Divider />
                <div style={{ padding: "10px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", marginBottom: 2 }}>University accent</div>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10 }}>Brand color for this deployment.</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { id: "default", label: "Indigo",    color: "#4f46e5" },
                      { id: "purdue",  label: "Purdue",    color: "#cfb991" },
                      { id: "cornell", label: "Cornell",   color: "#b91c1c" },
                      { id: "msu",     label: "Mich. St.", color: "#18453b" },
                      { id: "nyu",     label: "NYU",       color: "#57068c" },
                      { id: "ut",      label: "UT Austin", color: "#bf5700" },
                    ].map(u => (
                      <button key={u.id} onClick={() => setUni(u.id)} style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "6px 11px",
                        border: `1.5px solid ${uni === u.id ? "var(--fg)" : "var(--border)"}`,
                        borderRadius: 9999, background: "var(--surface)", cursor: "pointer", fontFamily: "inherit",
                      }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: u.color }} />
                        <span style={{ fontSize: 12, color: "var(--fg)" }}>{u.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {tab === "danger" && (
            <>
              <SettingsHeader title="Danger Zone" subtitle="Irreversible actions" />
              <Card>
                <Row>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>Export all course data</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Download every node, version, and review as JSON.</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => toast.success("Export queued — you'll get an email when ready")}>Export</Button>
                </Row>
                <Divider />
                <Row>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#b91c1c" }}>Delete course</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Removes every artifact, node, and version. Cannot be undone.</div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => { if (activeCourse && onDeleteCourse) { onDeleteCourse(activeCourse); } else { toast.error("No active course selected"); } }}>Delete</Button>
                </Row>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsHeader = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>{subtitle}</p>
    </div>
    {action}
  </div>
);

const Card = ({ children, pad = 16 }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: pad, marginBottom: 22 }}>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", gap: 16 }}>{children}</div>
);

const Divider = () => <div style={{ height: 1, background: "var(--border)", margin: "4px -16px" }} />;

const Field = ({ label, value, mono }) => (
  <div style={{ padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>{label}</span>
    <span style={{ fontSize: 13, color: "var(--fg)", fontFamily: mono ? "var(--mono)" : "inherit" }}>{value}</span>
  </div>
);

const ModelPicker = ({ label, value, onChange, options }) => (
  <div style={{ padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Currently using <span style={{ fontFamily: "var(--mono)" }}>{value}</span></div>
    </div>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      fontSize: 12.5, padding: "5px 10px", border: "1px solid var(--border)", borderRadius: 5,
      background: "var(--surface)", color: "var(--fg)", fontFamily: "var(--mono)", cursor: "pointer", outline: "none",
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

window.SettingsScreen = SettingsScreen;
