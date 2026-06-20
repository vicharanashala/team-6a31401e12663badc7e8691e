import { useState } from "react";
import { ChevronUp, ChevronDown, MessageSquare, ArrowLeft, Plus, X } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/DiscussionPage.css";
import { MOCK_QUESTIONS } from "../data/discussion";
import { TAGS } from "../data/tags";

function getHeatClass(upvotes) {
  if (upvotes >= 20) return "question-card--hot";
  if (upvotes >= 10) return "question-card--warm";
  return "";
}

export default function DiscussionPage({ onNavigate, dark, onToggleTheme }) {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [voteBursts, setVoteBursts] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [answerText, setAnswerText] = useState({});
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState("recent");

  const SORT_OPTIONS = [
    { value: "recent", label: "Recent" },
    { value: "upvotes", label: "Most Upvotes" },
    { value: "downvotes", label: "Most Downvotes" },
  ];

  function getSorted() {
    const qs = [...questions];
    if (sortBy === "upvotes")
      return qs.sort((a, b) => b.upvotes - a.upvotes);
    if (sortBy === "downvotes")
      return qs.sort((a, b) => b.downvotes - a.downvotes);
    return qs.sort((a, b) => b.id - a.id);
  }

  function toggleExpand(id) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, expanded: !q.expanded } : q))
    );
  }

  function triggerBurst(id) {
    setVoteBursts((prev) => ({ ...prev, [id]: Date.now() }));
    setTimeout(() => {
      setVoteBursts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 700);
  }

  function voteQuestion(id, direction) {
    if (direction === "up") {
      const q = questions.find((item) => item.id === id);
      if (!q || q.userVote !== "up") triggerBurst(id);
    }
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        if (q.userVote === direction) {
          return {
            ...q,
            userVote: null,
            upvotes:
              direction === "up" ? q.upvotes - 1 : q.upvotes,
            downvotes:
              direction === "down"
                ? q.downvotes - 1
                : q.downvotes,
          };
        }
        return {
          ...q,
          userVote: direction,
          upvotes:
            direction === "up"
              ? q.upvotes + 1
              : q.userVote === "up"
                ? q.upvotes - 1
                : q.upvotes,
          downvotes:
            direction === "down"
              ? q.downvotes + 1
              : q.userVote === "down"
                ? q.downvotes - 1
                : q.downvotes,
        };
      }),
    );
  }

  function upvoteAnswer(qId, aId) {
    const question = questions.find((q) => q.id === qId);
    const answer = question?.answers.find((a) => a.id === aId);
    if (answer && !answer.hasVoted) {
      triggerBurst(`ans-${qId}-${aId}`);
    }
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === aId && !a.hasVoted
                  ? { ...a, votes: a.votes + 1, hasVoted: true }
                  : a
              ),
            }
          : q
      )
    );
  }

  function submitAnswer(qId) {
    const text = (answerText[qId] || "").trim();
    if (!text) return;
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: Date.now(),
                  author: "you",
                  avatar: "YU",
                  text,
                  votes: 0,
                  hasVoted: false,
                  time: "just now",
                },
              ],
            }
          : q
      )
    );
    setAnswerText((prev) => ({ ...prev, [qId]: "" }));
  }

  function toggleTag(tag) {
    setNewTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  }

  function submitQuestion() {
    if (!newTitle.trim()) return;
    const q = {
      id: Date.now(),
      author: "you",
      avatar: "YU",
      title: newTitle.trim(),
      body: newBody.trim(),
      tags: newTags,
      time: "just now",
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      expanded: false,
      answers: [],
    };
    setQuestions((prev) => [q, ...prev]);
    setNewTitle("");
    setNewBody("");
    setNewTags([]);
    setShowForm(false);
  }

  return (
    <div className="discussion-page">
      <header className="discussion-page__header">
        <div className="discussion-page__header-container">
          <div className="discussion-page__header-left">
            <button
              onClick={() => onNavigate("home")}
              className="discussion-page__back-btn"
            >
              <ArrowLeft className="discussion-page__back-icon" />
            </button>
            <span className="discussion-page__logo">
              VINS<span className="discussion-page__logo-highlight"> FAQ SERVER</span>
            </span>
            <span className="discussion-page__header-badge">/ DISCUSSION</span>
          </div>
          <div className="discussion-page__header-right">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="discussion-page__new-question-btn"
            >
              <Plus className="discussion-page__new-question-icon" />
              New Question
            </button>
          </div>
        </div>
      </header>

      <main className="discussion-page__main">
        {/* New Question Form */}
        {showForm && (
          <div className="question-form">
            <div className="question-form__header">
              <h2 className="question-form__title">Post a Question</h2>
              <button
                onClick={() => setShowForm(false)}
                className="question-form__close"
              >
                <X className="question-form__close-icon" />
              </button>
            </div>

            <div className="question-form__body">
              <div className="question-form__field">
                <label className="question-form__label">TITLE *</label>
                <input
                  type="text"
                  placeholder="Be specific and clear..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="question-form__input"
                />
              </div>

              <div className="question-form__field">
                <label className="question-form__label">DETAILS</label>
                <textarea
                  rows={4}
                  placeholder="Provide context, what you've already tried, etc..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="question-form__textarea"
                />
              </div>

              <div className="question-form__field">
                <label className="question-form__label">TAGS</label>
                <div className="tag-selector">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`tag-selector__btn ${
                        newTags.includes(tag) ? "tag-selector__btn--selected" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {newTags.length > 0 && (
                  <p className="selected-tags-info">
                    Selected: {newTags.join(", ")}
                  </p>
                )}
              </div>

              <div className="question-form__actions">
                <button
                  onClick={() => setShowForm(false)}
                  className="question-form__cancel-btn"
                >
                  CANCEL
                </button>
                <button
                  onClick={submitQuestion}
                  disabled={!newTitle.trim()}
                  className="question-form__submit-btn"
                >
                  POST
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions header */}
        <div className="discussion-page__questions-header">
          <p className="discussion-page__questions-count">
            {questions.length} QUESTIONS
          </p>
          <div className="discussion-page__sort">
            <button
              className="discussion-page__sort-button"
              onClick={() => setSortOpen(!sortOpen)}
            >
              SORTED BY : <span className="discussion-page__sort-active">{sortLabel.toUpperCase()}</span>
              <ChevronDown
                className={`discussion-page__sort-chevron ${sortOpen ? "discussion-page__sort-chevron--open" : ""}`}
              />
            </button>

            {sortOpen && (
              <div className="discussion-page__sort-dropdown">
                {SORT_OPTIONS.map((opt) => (
                  <button 
                    key={opt.value}
                    className={`discussion-page__sort-option ${
                      sortBy === opt.value ? "discussion-page__sort-option--active" : ""
                    }`}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortLabel(opt.label);
                      setSortOpen(false);
                    }}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Questions list */}
        <div className="discussion-page__questions-list">
          {getSorted().map((q, index) => (
            <div
              key={q.id}
              className={`question-card ${getHeatClass(q.upvotes)} ${q.expanded ? "question-card--expanded" : ""}`}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <button
                className="question-card__trigger"
                onClick={() => toggleExpand(q.id)}
              >
                <div className="question-card__avatar">
                  <span className="question-card__avatar-text">{q.avatar}</span>
                </div>
                <div className="question-card__content">
                  <p className="question-card__title">{q.title}</p>
                  <div className="question-card__meta">
                    {q.tags.map((tag) => (
                      <span key={tag} className="question-card__tag">{tag}</span>
                    ))}
                    <span className="question-card__info">
                      {q.author} · {q.time}
                    </span>
                    <span className="question-card__answers-count">
                      <MessageSquare className="question-card__answers-icon" />
                      {q.answers.length}
                    </span>
                    <span className="question-card__vote-group" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => voteQuestion(q.id, "up")}
                        className={`question-card__vote-btn ${q.userVote === "up" ? "question-card__vote-btn--up-active" : ""}`}
                      >
                        {voteBursts[q.id] && <span className="vote-burst">+1</span>}
                        <ChevronUp className="question-card__vote-icon" />
                        {q.upvotes}
                      </button>
                      <button
                        onClick={() => voteQuestion(q.id, "down")}
                        className={`question-card__vote-btn ${q.userVote === "down" ? "question-card__vote-btn--down-active" : ""}`}
                      >
                        <ChevronDown className="question-card__vote-icon" />
                        {q.downvotes}
                      </button>
                    </span>
                  </div>
                </div>
              </button>

              {q.expanded && (
                <div className="question-card__expanded">
                  {q.body && (
                    <div className="question-card__body">
                      <p className="question-card__body-text">{q.body}</p>
                    </div>
                  )}

                  {q.answers.length > 0 && (
                    <div className="answers-list">
                      {q.answers
                        .slice()
                        .sort((a, b) => b.votes - a.votes)
                        .map((ans) => (
                          <div key={ans.id} className="answer-item">
                            <div className="answer-item__vote">
                              <button
                                type="button"
                                onClick={() => upvoteAnswer(q.id, ans.id)}
                                disabled={ans.hasVoted}
                                className={`answer-item__vote-btn ${
                                  ans.hasVoted ? "answer-item__vote-btn--voted" : ""
                                }`}
                              >
                                {voteBursts[`ans-${q.id}-${ans.id}`] && (
                                  <span className="vote-burst">+1</span>
                                )}
                                <ChevronUp className="answer-item__vote-icon" />
                              </button>
                              <span
                                className={`answer-item__vote-count ${
                                  ans.hasVoted ? "answer-item__vote-count--voted" : ""
                                }`}
                              >
                                {ans.votes}
                              </span>
                            </div>
                            <div className="answer-item__content">
                              <p className="answer-item__text">{ans.text}</p>
                              <p className="answer-item__meta">
                                {ans.author} · {ans.time}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="answer-form">
                    <p className="answer-form__label">YOUR ANSWER</p>
                    <textarea
                      rows={3}
                      placeholder="Write a clear, helpful answer..."
                      value={answerText[q.id] || ""}
                      onChange={(e) =>
                        setAnswerText((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="answer-form__textarea"
                    />
                    <button
                      onClick={() => submitAnswer(q.id)}
                      disabled={!(answerText[q.id] || "").trim()}
                      className="answer-form__submit-btn"
                    >
                      POST ANSWER
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}