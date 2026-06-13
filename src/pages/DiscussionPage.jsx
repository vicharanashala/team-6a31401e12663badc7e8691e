/**
 * DISCUSSION PAGE COMPONENT - COMMUNITY DISCUSSION PAGE WHERE USERS CAN ASK QUESTIONS, POST ANSWERS AND VOTE.
 * 
 * Features:
 * - View list of questions.
 * - Expand a question to see its body, answers, and a form to add your own answer.
 * - Vote on questions and individual answers.
 * - Create a new question with title, body, and tags.
 */

import { useState } from "react";
import { ChevronUp, ChevronDown, MessageSquare, ArrowLeft, Plus, X } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/DiscussionPage.css";

// HELPER FUNCTION - RETURN A CSS CLASS NAME BASED ON UPVOTE COUNT
function getHeatClass(upvotes) {
  if (upvotes >= 20) return "question-card--hot";
  if (upvotes >= 10) return "question-card--warm";
  return "";
}

const AVAILABLE_TAGS = ["account", "security", "general", "meta", "feature", "notifications", "voting", "moderation", "bug", "help"];

const INITIAL_QUESTIONS = [
  {
    id: 1,
    author: "amara_k",
    avatar: "AK",
    title: "How do I reset my password if I no longer have access to my email?",
    body: "My old email was deactivated and now I can't receive the reset link. I still remember my username. Is there any other way to recover the account?",
    tags: ["account", "security"],
    time: "2h ago",
    upvotes: 14,
    downvotes: 2,
    userVote: null,
    expanded: false,
    answers: [
      {
        id: 1,
        author: "devmod",
        avatar: "DM",
        text: "Contact support directly with your username and any previous billing info if applicable. They can verify ownership through alternative means.",
        votes: 34,
        hasVoted: false,
        time: "1h ago",
      },
      {
        id: 2,
        author: "rishi_p",
        avatar: "RP",
        text: "If you linked a phone number during signup, there might be an SMS recovery option on the login page. Check for a 'Try another way' link.",
        votes: 18,
        hasVoted: false,
        time: "45m ago",
      },
    ],
  },
  {
    id: 2,
    author: "leon_wd",
    avatar: "LW",
    title: "What's the difference between a FAQ post and a discussion post?",
    body: "I see both types on the platform but I'm not sure which one to use when I have a question. Can someone clarify the intended use case for each?",
    tags: ["general", "meta"],
    time: "5h ago",
    upvotes: 22,
    downvotes: 1,
    userVote: null,
    expanded: false,
    answers: [
      {
        id: 1,
        author: "okonkwo_j",
        avatar: "OJ",
        text: "FAQ posts are curated, evergreen answers for common questions — they go through editorial review. Discussion posts are open-ended threads where the community can debate, refine, and vote on answers in real time.",
        votes: 52,
        hasVoted: false,
        time: "4h ago",
      },
    ],
  },
  {
    id: 3,
    author: "sana_mir",
    avatar: "SM",
    title: "Is there a way to follow specific tags or topics?",
    body: "I want to be notified only about questions in my area of expertise so I can actually contribute useful answers. Does the platform support tag subscriptions?",
    tags: ["feature", "notifications"],
    time: "1d ago",
    upvotes: 8,
    downvotes: 5,
    userVote: null,
    expanded: false,
    answers: [],
  },
];

export default function DiscussionPage({ onNavigate, dark, onToggleTheme }) {

  // STATE MANAGEMENT
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
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

  // HELPER FUNCTIONS

  // FUNCTION THAT RETURN QUESTIONS ARRAY ACCORDING TO CURRENT SORTING SETTING
  function getSorted() {
    const qs = [...questions];
    if (sortBy === "upvotes")
      return qs.sort((a, b) => b.upvotes - a.upvotes);
    if (sortBy === "downvotes")
      return qs.sort((a, b) => b.downvotes - a.downvotes);
    return qs.sort((a, b) => b.id - a.id);
  }

  // FUNCTION THAT TOGGLE EXPANDED STATE OF QUESTION 
  function toggleExpand(id) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, expanded: !q.expanded } : q))
    );
  }

  // FUNCTION THAT SHOWS TEMPORARY +1 BURST ANIMATION
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

  // VOTE ON A QUESTION - WITH CONDITIONS
  function voteQuestion(id, direction) {
    if (direction === "up") {
      const q = questions.find((item) => item.id === id);
      if (!q || q.userVote !== "up") {
        triggerBurst(id);
      }
    }
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;

        // IF USER CLICKS THE SAME DIRECTION AGAIN - REMOVE VOTES

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

        // OTHERWISE, APPLY THE VOTE AND REMOVE THE OPPOSITE VOTE

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

  // UPVOTE AN ANSWER FUNCTION
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

  // SUBMIT A NEW ANSWER FUNCTION 
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

  // TOGGLE A TAG IN NEW QUESTION - ADD OR REMOVE
  function toggleTag(tag) {
    setNewTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  }

  // SUBMIT A NEW QUESTION FUNCTION
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

  // RENDER DOM
  return (
    <div className="discussion-page">

      {/* HEADER SECTION WITH BACK BUTTON, LOGO, THEME TOGGLE AND NEW QUESTION BUTTON */}

      <header className="discussion-page__header">
        <div className="discussion-page__header-container">
          <div className="discussion-page__header-left">

            {/* BACK BUTTON */}

            <button
              onClick={() => onNavigate("home")}
              className="discussion-page__back-btn"
            >
              <ArrowLeft className="discussion-page__back-icon" />
            </button>

            {/* LOGO OF THE PLATFORM */}

            <span className="discussion-page__logo">
              VINS<span className="discussion-page__logo-highlight"> FAQ SERVER</span>
            </span>
            <span className="discussion-page__header-badge">/ DISCUSSION</span>
          </div>

          {/* THEME TOGGLE BUTTON AND ADD NEW QUESTION BUTTON */}

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

        {/* NEW QUESTION FORM - INLINE SECTION */}

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
              
              {/* TITLE FIELD */}
              
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

              {/* BODY FIELD */}

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

              {/* TAG SELECTION */}

              <div className="question-form__field">
                <label className="question-form__label">TAGS</label>
                <div className="tag-selector">
                  {AVAILABLE_TAGS.map((tag) => (
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

              {/* FORM ACTIONS - CANCEL OR POST BUTTONS */}

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

        {/* QUESTIONS HEADER - COUNT AND SORT DROPDOWN */}

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

            {/* SORTING OPTIONS */}

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

        {/* LIST OF QUESTIONS - BASED UPON SORTING SETTING */}

        <div className="discussion-page__questions-list">
          {getSorted().map((q, index) => (
            <div 
              key={q.id} 
              className={`question-card ${getHeatClass(q.upvotes)} ${q.expanded ? "question-card--expanded" : ""}`}
              style={{ animationDelay : `${index * 0.06}s` }}
            >

              {/* QUESTION COLLAPSE BUTTON - CLICK TO EXPAND AND CLOSE */}

              <button
                className="question-card__trigger"
                onClick={() => toggleExpand(q.id)}
              >

                {/* AVATOR OF USER WHO ASKED QUESTION */}

                <div className="question-card__avatar">
                  <span className="question-card__avatar-text">{q.avatar}</span>
                </div>

                {/* TITLE OF THE QUESTION WITH ASSOCIATED TAGS AND USER NAME*/}

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

                    {/* VOTING BUTTONS FOR QUESTIONS - UPVOTE AND DOWNVOTE*/}

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

              {/* EXPANDED VIEW OF QUESTION - SHOWS BODY, ANSWERS AND ANSWER FORM */}

              {q.expanded && (
                <div className="question-card__expanded">

                  {/* QUESTION BODY */}

                  {q.body && (
                    <div className="question-card__body">
                      <p className="question-card__body-text">{q.body}</p>
                    </div>
                  )}

                  {/* LIST OF ASSOCIATED ANSWERS - SORTED BY VOTES DESCENDING */}

                  {q.answers.length > 0 && (
                    <div className="answers-list">
                      {q.answers
                        .slice()
                        .sort((a, b) => b.votes - a.votes)
                        .map((ans) => (
                          <div key={ans.id} className="answer-item">
                            <div className="answer-item__vote">

                              {/* BUTTON TO UPVOTE ANSWER */}

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

                              {/* TOTAL UPVOTES ON ANSWER */}

                              <span
                                className={`answer-item__vote-count ${
                                  ans.hasVoted ? "answer-item__vote-count--voted" : ""
                                }`}
                              >
                                {ans.votes}
                              </span>
                            </div>

                            {/* ANSWER TEXT AND ASSOCIATED AUTHOR */}

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

                  {/* FORM TO ADD A NEW ANSWER */}

                  <div className="answer-form">
                    <p className="answer-form__label">YOUR ANSWER</p>

                    {/* TEXT AREA FOR ANSWER */}

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

                    {/* ANSWER SUBMIT BUTTON */}

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