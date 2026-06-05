import { useState } from "react";
import { COLORS, STATUS_META, MOCK_USER } from "../constants";
import { Avatar, Badge } from "../components";

export default function ProfilePage() {
  const [tab, setTab] = useState("activity");
  const u = MOCK_USER;

  const activityIcons = {
    reply:   "💬",
    upvote:  "👍",
    query:   "❓",
    confirm: "✅",
  };

  const tabs = [
    { id: "activity", label: "All Activity"     },
    { id: "pending",  label: "Pending Queries"  },
    { id: "sp",       label: "SP Track"         },
  ];

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "28px 24px" }}>

      {/* ── Profile header card ── */}
      <div style={{
        border: "0.5px solid #e5e5e0", borderRadius: 14,
        padding: "20px 24px", background: "#fff",
        display: "flex", alignItems: "center", gap: 20, marginBottom: 24,
      }}>
        <Avatar initials={u.initials} size={60} bg={COLORS.accentLight} color={COLORS.accentDark} />

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 500 }}>{u.name}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Joined {u.joinDate}</p>
        </div>

        {/* SP Points badge */}
        <div style={{
          background: COLORS.amberLight, borderRadius: 12,
          padding: "10px 18px", textAlign: "center",
          border: "0.5px solid #FAC775",
        }}>
          <p style={{ margin: 0, fontSize: 11, color: COLORS.amber, fontWeight: 500, marginBottom: 2 }}>SP POINTS</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: COLORS.amber }}>{u.spPoints}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Queries raised",    value: u.queriesRaised,    icon: "❓" },
          { label: "Replies given",     value: u.repliesGiven,     icon: "💬" },
          { label: "Confirmed replies", value: u.confirmedReplies, icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#f7f7f4", borderRadius: 10,
            padding: "14px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "#111" }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", gap: 4,
        marginBottom: 16, borderBottom: "0.5px solid #eee",
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
            fontWeight: tab === t.id ? 500 : 400, fontSize: 14,
            color: tab === t.id ? COLORS.accentDark : "#666",
            borderBottom: tab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── All Activity tab ── */}
      {tab === "activity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {u.activity.map((a, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "12px 14px", border: "0.5px solid #eee",
              borderRadius: 10, background: "#fff",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{activityIcons[a.type]}</span>
              <p style={{ margin: 0, flex: 1, fontSize: 13, color: "#222" }}>{a.text}</p>
              <span style={{ fontSize: 12, color: "#aaa", flexShrink: 0 }}>{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Pending Queries tab ── */}
      {tab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {u.pendingQueries.map((q, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 16px", border: "0.5px solid #eee",
              borderRadius: 10, background: "#fff",
            }}>
              <p style={{ margin: 0, fontSize: 14, color: "#222" }}>{q.title}</p>
              <Badge label={q.status} style={STATUS_META[q.status]} />
            </div>
          ))}
        </div>
      )}

      {/* ── SP Track tab ── */}
      {tab === "sp" && (
        <div>
          {/* Balance card */}
          <div style={{
            border: "0.5px solid #eee", borderRadius: 12,
            padding: 20, background: "#fff", marginBottom: 16,
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#888" }}>Current SP balance</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 600, color: COLORS.amber }}>{u.spPoints} SP</p>
          </div>

          {/* SP history */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { action: "Replied to a query",           sp: "+5 SP",  time: "45 mins ago" },
              { action: "Confirmed reference awarded",  sp: "+20 SP", time: "2 days ago"  },
              { action: "Zoom session attendance",      sp: "+10 SP", time: "3 days ago"  },
              { action: "Upvoted reply received",       sp: "+2 SP",  time: "4 days ago"  },
            ].map((e, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 14px", border: "0.5px solid #eee",
                borderRadius: 9, background: "#fff",
              }}>
                <span style={{ fontSize: 13, color: "#333" }}>{e.action}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.accentDark }}>{e.sp}</span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{e.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}