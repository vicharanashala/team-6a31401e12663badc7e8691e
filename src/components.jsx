import { COLORS } from "./constants";

/** Circular avatar with initials */
export function Avatar({ initials, size = 36, bg = COLORS.accentLight, color = COLORS.accentDark }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 500, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/** Small pill badge */
export function Badge({ label, style = {} }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "3px 8px",
      borderRadius: 99, border: `0.5px solid ${style.border || "#ccc"}`,
      background: style.bg || "#f0f0f0", color: style.color || "#333",
      whiteSpace: "nowrap", ...style,
    }}>
      {label}
    </span>
  );
}

/** Top navigation bar */
export function NavBar({ page, setPage }) {
  const tabs = [
    { id: "faq",     label: "FAQ Page",      icon: "📋" },
    { id: "resolve", label: "Resolve Qs",    icon: "💬" },
    { id: "profile", label: "Profile",       icon: "👤" },
  ];

  return (
    <nav style={{
      display: "flex", alignItems: "center",
      padding: "12px 20px", borderBottom: "0.5px solid #e5e5e0",
      background: "#fff", position: "sticky", top: 0, zIndex: 100,
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: COLORS.accentDark, letterSpacing: -0.5 }}>VINS</span>
        <span style={{ fontSize: 12, color: "#888" }}>FAQ Server</span>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontWeight: page === t.id ? 500 : 400, fontSize: 14,
            background: page === t.id ? COLORS.accentLight : "transparent",
            color:      page === t.id ? COLORS.accentDark  : "#555",
            transition: "all 0.15s",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <Avatar initials="AK" size={34} />
    </nav>
  );
}

/** Modal for raising a new query */
export function RaiseQueryModal({ value, onChange, onClose, onSubmit }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: "24px 28px",
        width: 460, boxSizing: "border-box", border: "0.5px solid #ddd",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Raise a new query</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>Your question</label>
          <textarea
            value={value.title}
            onChange={e => onChange(v => ({ ...v, title: e.target.value }))}
            placeholder="Describe your issue clearly..."
            rows={3}
            style={{ width: "100%", borderRadius: 8, border: "0.5px solid #ddd", padding: "10px 12px", fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>Tag / Category</label>
          <select
            value={value.tag}
            onChange={e => onChange(v => ({ ...v, tag: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #ddd", fontSize: 13, outline: "none" }}
          >
            <option value="">Select a tag</option>
            {["General", "Infrastructure", "Development", "Meetings", "Engagement", "Platform"].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>Upload reference (optional)</label>
          <button style={{
            padding: "8px 14px", borderRadius: 8, border: "0.5px dashed #ccc",
            background: "#fafaf8", cursor: "pointer", fontSize: 13, color: "#666", width: "100%",
          }}>📎 Attach file</button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{
            padding: "8px 18px", borderRadius: 8, border: "0.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13,
          }}>Cancel</button>
          <button onClick={onSubmit} style={{
            padding: "8px 20px", borderRadius: 8, background: COLORS.accent,
            color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
          }}>Post Query</button>
        </div>
      </div>
    </div>
  );
}