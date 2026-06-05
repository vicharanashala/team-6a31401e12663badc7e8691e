import { useState } from "react";
import { COLORS, MOCK_FAQS } from "../constants";
import { Badge, RaiseQueryModal } from "../components";

/** Single expandable FAQ item */
function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: "0.5px solid #e5e5e0", borderRadius: 10,
      overflow: "hidden", background: "#cd5d5d",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "14px 16px",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#aaa", minWidth: 20 }}>{index}.</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>{faq.question}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Badge
            label={faq.category}
            style={{ bg: COLORS.purpleLight, color: COLORS.purple, border: "#AFA9EC" }}
          />
          <span style={{ color: "#aaa", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 16px 14px 46px", fontSize: 13, color: "#444", lineHeight: 1.6 }}>
          {faq.answer}
        </div>
      )}
    </div>
  );
}

/** Main FAQ Page */
export default function FAQPage({ setPage }) {
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [chatMsg, setChatMsg]         = useState("");
  const [chatLog, setChatLog]         = useState([
    { from: "bot", text: "Hi! I'm the VINS assistant. Ask me anything about your internship 👋" },
  ]);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [newQ, setNewQ]               = useState({ title: "", tag: "" });

  const categories = ["All", ...Array.from(new Set(MOCK_FAQS.map(f => f.category)))];

  const filtered = MOCK_FAQS.filter(f =>
    (category === "All" || f.category === category) &&
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  function sendChat() {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim();
    setChatLog(l => [...l, { from: "user", text: userMsg }]);
    setChatMsg("");

    const match = MOCK_FAQS.find(f =>
      f.question.toLowerCase().includes(userMsg.toLowerCase().slice(0, 10))
    );

    setTimeout(() => {
      setChatLog(l => [...l, {
        from: "bot",
        text: match
          ? `Here's what I found: "${match.question}" — ${match.answer}`
          : "I couldn't find an exact match. Try searching the FAQ list or raise a new query using the + button!",
      }]);
    }, 600);
  }

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 57px)" }}>

      {/* ── Left: FAQ list ── */}
      <div style={{ flex: 1, padding: "24px 28px", maxWidth: 680 }}>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#aaa" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            style={{
              width: "100%", padding: "10px 14px 10px 38px",
              borderRadius: 10, border: "0.5px solid #ddd",
              fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "5px 14px", borderRadius: 99,
              border: `0.5px solid ${category === c ? COLORS.accent : "#ddd"}`,
              background: category === c ? COLORS.accentLight : "#fff",
              color:      category === c ? COLORS.accentDark  : "#555",
              fontSize: 13, cursor: "pointer",
              fontWeight: category === c ? 500 : 400,
            }}>{c}</button>
          ))}
        </div>

        {/* FAQ accordion list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} index={i + 1} />
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ margin: 0 }}>No FAQs found. Try raising this as a query!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Chatbot sidebar ── */}
      <div style={{
        width: 300, borderLeft: "0.5px solid #eee",
        display: "flex", flexDirection: "column",
        background: "#fafaf8",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "0.5px solid #eee",
          fontWeight: 500, fontSize: 14,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          🤖 VINS Assistant
        </div>

        {/* Chat messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: 12,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {chatLog.map((m, i) => (
            <div key={i} style={{
              alignSelf:  m.from === "user" ? "flex-end" : "flex-start",
              background: m.from === "user" ? COLORS.accentLight : "#fff",
              color:      m.from === "user" ? COLORS.accentDark  : "#333",
              border: `0.5px solid ${m.from === "user" ? COLORS.accent : "#e5e5e0"}`,
              borderRadius: 10, padding: "8px 12px",
              maxWidth: "85%", fontSize: 13, lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div style={{ padding: 12, borderTop: "0.5px solid #eee", display: "flex", gap: 6 }}>
          <input
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Ask anything..."
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              border: "0.5px solid #ddd", fontSize: 13, outline: "none",
            }}
          />
          <button onClick={sendChat} style={{
            padding: "8px 12px", borderRadius: 8,
            background: COLORS.accent, color: "#fff",
            border: "none", cursor: "pointer", fontSize: 13,
          }}>Send</button>
        </div>
      </div>

      {/* ── FAB: raise query ── */}
      <button
        onClick={() => setShowRaiseModal(true)}
        style={{
          position: "fixed", bottom: 28, right: 340,
          width: 48, height: 48, borderRadius: "50%",
          background: COLORS.accent, color: "#fff",
          border: "none", fontSize: 24, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}
      >+</button>

      {showRaiseModal && (
        <RaiseQueryModal
          value={newQ}
          onChange={setNewQ}
          onClose={() => setShowRaiseModal(false)}
          onSubmit={() => { setShowRaiseModal(false); setPage("resolve"); }}
        />
      )}
    </div>
  );
}