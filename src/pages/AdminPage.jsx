import { useState } from "react";
import { ArrowLeft, ChevronUp, Check, X, Tag, Users, FileQuestion, Pencil, Trash2, Shield, Plus, TriangleRight } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/AdminPage.css";
import { INITIAL_FAQ_CANDIDATES, INITIAL_TAGS, INITIAL_PLATFORM_USERS } from "../data/admindata";

const FAQ_UPVOTE_THRESHOLD = 25;

const TABS = [
  { id: "faq", label: "FAQ Review", icon: FileQuestion },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "users", label: "Users", icon: Users },
];

export default function AdminPage({ onNavigate, user, onLogout, dark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("faq");
  const [candidates, setCandidates] = useState(INITIAL_FAQ_CANDIDATES);
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [platformUsers, setPlatformUsers] = useState(INITIAL_PLATFORM_USERS);
  const [actionMessage, setActionMessage] = useState("");

  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");

  const eligibleCandidates = candidates.filter(
    (c) => c.upvotes >= FAQ_UPVOTE_THRESHOLD && c.status === "pending",
  );
  const processedCandidates = candidates.filter((c) => c.status !== "pending");

  function showMessage(text) {
    setActionMessage(text);
    setTimeout(() => setActionMessage(""), 3000);
  }

  function handleFaqDecision(id, decision) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: decision } : c)),
    );
    showMessage(
      decision === "approved"
        ? "Question approved and queued for FAQ publication on the home page."
        : "Question rejected and will remain in discussion only.",
    );
  }

  function handleAddTag(e) {
    e.preventDefault();
    const name = newTagName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    if (tags.some((t) => t.name === name)) {
      showMessage("A tag with this name already exists.");
      return;
    }
    setTags((prev) => [...prev, { id: Date.now(), name, questionCount: 0 }]);
    setNewTagName("");
    showMessage(`Tag "${name}" created successfully.`);
  }

  function startEditTag(tag) {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  }

  function saveEditTag() {
    const name = editingTagName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    if (tags.some((t) => t.name === name && t.id !== editingTagId)) {
      showMessage("A tag with this name already exists.");
      return;
    }
    setTags((prev) =>
      prev.map((t) => (t.id === editingTagId ? { ...t, name } : t)),
    );
    setEditingTagId(null);
    setEditingTagName("");
    showMessage("Tag updated successfully.");
  }

  function deleteTag(id) {
    const tag = tags.find((t) => t.id === id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    showMessage(`Tag "${tag?.name}" deleted.`);
  }

  function deleteUser(id) {
    const target = platformUsers.find((u) => u.id === id);
    if(!target) return;

    if(target.id === 1 || target.id === 4) {
      showMessage("Admin's accounts cannot be deleted.");
      return;
    }
    if (target?.email === user?.email) {
      showMessage("You cannot delete your own account.");
      return;
    }
    setPlatformUsers((prev) => prev.filter((u) => u.id !== id));
    showMessage(`User ${target?.name} removed from the platform.`);
  }

  function promoteToAdmin(id) {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u)),
    );
    const target = platformUsers.find((u) => u.id === id);
    showMessage(`${target?.name} is now an admin.`);
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__header-container">
          <button
            onClick={() => onNavigate("home")}
            className="admin-page__back-btn"
            type="button"
          >
            <ArrowLeft className="admin-page__back-icon" />
          </button>
          <span className="admin-page__logo">
            VINS<span className="admin-page__logo-highlight"> FAQ SERVER</span>
          </span>
          <span className="admin-page__header-badge">/ ADMIN</span>
          <div className="admin-page__header-actions">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
            <button onClick={onLogout} className="admin-page__logout-btn" type="button">
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="admin-page__main">
        <div className="admin-page__intro">
          <div className="admin-page__intro-avatar">
            <Shield className="admin-page__intro-icon" />
          </div>
          <div>
            <h1 className="admin-page__title">Admin Dashboard</h1>
            <p className="admin-page__subtitle">
              Signed in as <strong>{user?.name}</strong> · Manage FAQ conversions, tags, and users
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className="admin-page__toast" role="status">
            {actionMessage}
          </div>
        )}

        <div className="admin-page__tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`admin-page__tab ${activeTab === id ? "admin-page__tab--active" : ""}`}
            >
              <Icon className="admin-page__tab-icon" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "faq" && (
          <section className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">FAQ Conversion Queue</h2>
              <p className="admin-section__desc">
                Questions with <strong>{FAQ_UPVOTE_THRESHOLD}+ upvotes</strong> are eligible to become home-page FAQs.
              </p>
            </div>

            {eligibleCandidates.length === 0 ? (
              <p className="admin-section__empty">No pending questions meet the upvote threshold.</p>
            ) : (
              <div className="admin-card-list">
                {eligibleCandidates.map((item) => (
                  <article key={item.id} className="admin-faq-card">
                    <div className="admin-faq-card__header">
                      <h3 className="admin-faq-card__title">{item.title}</h3>
                      <span className="admin-faq-card__votes">
                        <ChevronUp className="admin-faq-card__vote-icon" />
                        {item.upvotes} upvotes
                      </span>
                    </div>
                    <p className="admin-faq-card__body">{item.body}</p>
                    {item.topAnswer && (
                      <div className="admin-faq-card__answer">
                        <p className="admin-faq-card__answer-label">TOP ANSWER</p>
                        <p className="admin-faq-card__answer-text">{item.topAnswer}</p>
                      </div>
                    )}
                    <div className="admin-faq-card__meta">
                      <span>by {item.author}</span>
                      <div className="admin-faq-card__tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="admin-faq-card__tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="admin-faq-card__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--approve"
                        onClick={() => handleFaqDecision(item.id, "approved")}
                      >
                        <Check className="admin-btn__icon" />
                        Approve for FAQ
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--reject"
                        onClick={() => handleFaqDecision(item.id, "rejected")}
                      >
                        <X className="admin-btn__icon" />
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {processedCandidates.length > 0 && (
              <>
                <h3 className="admin-section__subtitle">Recently Processed</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Upvotes</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedCandidates.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>{item.upvotes}</td>
                          <td>
                            <span
                              className={`admin-status admin-status--${item.status}`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "tags" && (
          <section className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">Tag Management</h2>
              <p className="admin-section__desc">
                Create, rename, or remove tags used across discussion questions.
              </p>
            </div>

            <form className="admin-tag-form" onSubmit={handleAddTag}>
              <input
                type="text"
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="admin-input"
              />
              <button type="submit" className="admin-btn admin-btn--primary" disabled={!newTagName.trim()}>
                <Plus className="admin-btn__icon" />
                Create Tag
              </button>
            </form>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Questions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td>
                        {editingTagId === tag.id ? (
                          <input
                            type="text"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            className="admin-input admin-input--inline"
                          />
                        ) : (
                          <span className="admin-tag-name">{tag.name}</span>
                        )}
                      </td>
                      <td>{tag.questionCount}</td>
                      <td>
                        <div className="admin-table__actions">
                          {editingTagId === tag.id ? (
                            <>
                              <button
                                type="button"
                                className="admin-icon-btn admin-icon-btn--save"
                                onClick={saveEditTag}
                                title="Save"
                              >
                                <Check className="admin-icon-btn__icon" />
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => setEditingTagId(null)}
                                title="Cancel"
                              >
                                <X className="admin-icon-btn__icon" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => startEditTag(tag)}
                                title="Edit tag"
                              >
                                <Pencil className="admin-icon-btn__icon" />
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn admin-icon-btn--danger"
                                onClick={() => deleteTag(tag.id)}
                                title="Delete tag"
                              >
                                <Trash2 className="admin-icon-btn__icon" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="admin-section">
            <div className="admin-section__header">
              <h2 className="admin-section__title">User Management</h2>
              <p className="admin-section__desc">
                View all platform users, remove accounts, or promote users to admin.
              </p>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Handle</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {platformUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.handle}</td>
                      <td>
                        <span className={`admin-role admin-role--${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.joined}</td>
                      <td>
                        <div className="admin-table__actions">
                          {u.role === "user" && (
                            <button
                              type="button"
                              className="admin-btn admin-btn--small admin-btn--promote"
                              onClick={() => promoteToAdmin(u.id)}
                            >
                              <Shield className="admin-btn__icon" />
                              Make Admin
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn--small admin-btn--reject"
                            onClick={() => deleteUser(u.id)}
                            disabled={u.email === user?.email || u.role === "admin"}
                          >
                            <Trash2 className="admin-btn__icon" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
