import { useState } from "react";
import { COLORS, STATUS_META, MOCK_QUERIES, scoreReply } from "../constants";
import { Avatar, Badge } from "../components";

/** Single reply card with algorithm score display */
function ReplyCard({ reply, onUpvote }) {
  const score = scoreReply(reply).toFixed(1);

  return (
    <div style={{
      border: `0.5px solid ${reply.confirmed ? COLORS.accent : "#e5e5e0"}`,
      borderRadius: 10, padding: "12px 14px",
      background: reply.confirmed ? COLORS.accentLight : "#fff",
    }}>
      {/* Confirmed reference banner */}
      {reply.confirmed && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 8, fontSize: 12, color: COLORS.accentDark, fontWeight: 500,
        }}>
          ✅ Confirmed reference — pinned to top
        </div>
      )}

      {/* Reply header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Avatar initials={reply.authorId.slice(0, 2).toUpperCase()} size={28} />
          <div>
            <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: 13 }}>{reply.authorId}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>
              Exp: {reply.experience}d · SP: {reply.spPoints} · {reply.createdAt}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {!reply.confirmed && (
            <span style={{
              fontSize: 11, color: "#aaa",
              background: "#f4f4f0", padding: "2px 8px", borderRadius: 6,
            }}>
              Score: {score}
            </span>
          )}
          {reply.hasReference && (
            <Badge
              label="📎 Reference"
              style={{ bg: COLORS.amberLight, color: COLORS.amber, border: "#FAC775" }}
            />
          )}
        </div>
      </div>

      {/* Reply body */}
      <p style={{ margin: "10px 0 8px", fontSize: 13, color: "#333", lineHeight: 1.6 }}>
        {reply.body}
      </p>

      {/* Upvote button */}
      <button onClick={onUpvote} style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 7,
        border: "0.5px solid #ddd", background: "#fff",
        cursor: "pointer", fontSize: 12, color: "#555",
      }}>
        👍 {reply.upvotes}
      </button>
    </div>
  );
}

/** Resolve Queries Page */
export default function ResolveQsPage() {
  const [queries, setQueries]       = useState(MOCK_QUERIES);
  const [active, setActive]         = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const statuses = ["All", "Pending", "In Review", "Resolved", "Rejected"];
  const filtered = queries.filter(q => filterStatus === "All" || q.status === filterStatus);

  /** Confirmed replies always go first, rest sorted by algorithm score */
  function getSortedReplies(replies) {
    const confirmed = replies.filter(r => r.confirmed);
    const normal    = replies.filter(r => !r.confirmed).sort((a, b) => scoreReply(b) - scoreReply(a));
    return [...confirmed, ...normal];
  }

  function handleVoteQuery(qid, dir) {
    setQueries(qs => qs.map(q =>
      q.id !== qid ? q : {
        ...q,
        upvotes:   q.upvotes   + (dir === "up"   ? 1 : 0),
        downvotes: q.downvotes + (dir === "down"  ? 1 : 0),
      }
    ));
  }

  function handleUpvoteReply(qid, rid) {
    setQueries(qs => qs.map(q =>
      q.id !== qid ? q : {
        ...q,
        replies: q.replies.map(r => r.id !== rid ? r : { ...r, upvotes: r.upvotes + 1 }),
      }
    ));
  }

  function handleSubmitReply(qid) {
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(), authorId: "Arjun_K", experience: 20, spPoints: 80,
      upvotes: 0, createdAt: "Just now", hasReference: false,
      body: replyText, confirmed: false,
    };
    setQueries(qs => qs.map(q =>
      q.id !== qid ? q : {
        ...q,
        status:  "In Review",
        replies: [...q.replies, newReply],
      }
    ));
    setReplyText("");
  }

  const activeQuery = active != null ? queries.find(q => q.id === active) : null;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>

      {/* ── Left panel: query list ── */}
      <div style={{ width: 380, borderRight: "0.5px solid #eee", overflowY: "auto" }}>

        {/* Header + status filters */}
        <div style={{ padding: "16px 16px 10px", borderBottom: "0.5px solid #eee" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 500, fontSize: 15 }}>Resolve Queries</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "4px 12px", borderRadius: 99,
                border: `0.5px solid ${filterStatus === s ? COLORS.accent : "#ddd"}`,
                background: filterStatus === s ? COLORS.accentLight : "#fff",
                color:      filterStatus === s ? COLORS.accentDark  : "#555",
                fontSize: 12, cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Query rows */}
        {filtered.map(q => (
          <div
            key={q.id}
            onClick={() => setActive(q.id)}
            style={{
              padding: "14px 16px", borderBottom: "0.5px solid #f0f0ec",
              cursor: "pointer",
              background: active === q.id ? COLORS.accentLight : "#fff",
              transition: "background 0.1s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500, color: "#222", lineHeight: 1.4 }}>
                {q.title}
              </p>
              <Badge label={q.status} style={STATUS_META[q.status]} />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Badge label={q.tag} style={{ bg: COLORS.purpleLight, color: COLORS.purple, border: "#AFA9EC" }} />
              <span style={{ fontSize: 11, color: "#aaa" }}>{q.createdAt}</span>
              <span style={{ fontSize: 11, color: "#888" }}>💬 {q.replies.length}</span>
              <span style={{ fontSize: 11, color: "#888" }}>👍 {q.upvotes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Right panel: query detail ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {activeQuery ? (
          <>
            {/* Query header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#111", lineHeight: 1.4 }}>
                  {activeQuery.title}
                </h2>
                <Badge label={activeQuery.status} style={STATUS_META[activeQuery.status]} />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                <Badge label={activeQuery.tag} style={{ bg: COLORS.purpleLight, color: COLORS.purple, border: "#AFA9EC" }} />
                <span style={{ fontSize: 12, color: "#aaa" }}>by {activeQuery.authorId} · {activeQuery.createdAt}</span>
              </div>

              {/* Vote buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleVoteQuery(activeQuery.id, "up")} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  border: "0.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13,
                }}>👍 {activeQuery.upvotes}</button>
                <button onClick={() => handleVoteQuery(activeQuery.id, "down")} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  border: "0.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13,
                }}>👎 {activeQuery.downvotes}</button>
              </div>
            </div>

            {/* Replies */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 10px", color: "#333" }}>
                Replies — sorted by algorithm score
              </p>

              {getSortedReplies(activeQuery.replies).length === 0 && (
                <div style={{
                  padding: "24px", textAlign: "center", color: "#aaa",
                  border: "0.5px dashed #ddd", borderRadius: 10, fontSize: 13,
                }}>
                  No replies yet. Be the first to help!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {getSortedReplies(activeQuery.replies).map(reply => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    onUpvote={() => handleUpvoteReply(activeQuery.id, reply.id)}
                  />
                ))}
              </div>
            </div>

            {/* Reply composer */}
            <div style={{ border: "0.5px solid #ddd", borderRadius: 12, padding: 16, background: "#fff" }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500 }}>Add your reply</p>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Share what you know..."
                rows={3}
                style={{
                  width: "100%", borderRadius: 8, border: "0.5px solid #ddd",
                  padding: "10px 12px", fontSize: 13, resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <button style={{
                  padding: "6px 14px", borderRadius: 8, border: "0.5px solid #ddd",
                  background: "#fff", cursor: "pointer", fontSize: 13, color: "#555",
                }}>📎 Upload reference</button>
                <button onClick={() => handleSubmitReply(activeQuery.id)} style={{
                  padding: "7px 20px", borderRadius: 8, background: COLORS.accent,
                  color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}>Post Reply</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "60%", color: "#aaa", gap: 10,
          }}>
            <div style={{ fontSize: 36 }}>💬</div>
            <p style={{ margin: 0, fontSize: 14 }}>Select a query to view and reply</p>
          </div>
        )}
      </div>
    </div>
  );
}