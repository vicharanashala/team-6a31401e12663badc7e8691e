import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, MessageSquare, ArrowLeft, Plus, X } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/DiscussionPage.css";
import { questionAPI, answerAPI, tagAPI } from "../services/api";

function getHeatClass(upvotes) {
  if (upvotes >= 20) return "question-card--hot";
  if (upvotes >= 10) return "question-card--warm";
  return "";
}

export default function DiscussionPage({ onNavigate, dark, onToggleTheme }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [loadingAnswers, setLoadingAnswers] = useState({});

  const [voteBursts, setVoteBursts] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [answerText, setAnswerText] = useState({});
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState("recent");

  const SORT_OPTIONS = [
    { value: "recent", label: "Recent" },
    { value: "upvotes", label: "Most Upvotes" },
    { value: "downvotes", label: "Most Downvotes" },
  ];

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagAPI.getAll();
        const tagNames = data.map(t => t.tag_name);
        setAvailableTags(tagNames);
      } catch (err) {
        console.error("Failed to load Tags : ", err);
        setAvailableTags([]);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try{
        const data = await questionAPI.getAll();
        const mapped = data.map(q => ({
          id : q._id,
          author : q.user_id?.name || "Anonymous",
          avatar : q.user_id?.name?.charAt(0)?.toUpperCase() || "?",
          title : q.question,
          body : q.description || "",
          tags : q.tag_id ? [q.tag_id.tag_name] : [],
          time : q.created_at,
          upvotes : q.up_votes || 0,
          downvotes : q.down_votes || 0,
          uservote : null,
          expanded : false,
          answers : [],
          answersCount : q.answers_count || 0
        }));
        setQuestions(mapped);
      } catch (err) {
        setError(err.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  function getSorted() {
    const qs = [...questions];
    if (sortBy === "upvotes")
      return qs.sort((a, b) => b.upvotes - a.upvotes);
    if (sortBy === "downvotes")
      return qs.sort((a, b) => b.downvotes - a.downvotes);
    return qs.sort((a, b) => b.id < a.id ? 1 : -1);
  }

  async function toggleExpand(id) {
    const question = questions.find(q => q.id === id);
    if(!question) return;

    const newExpanded = !question.expanded;
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, expanded : newExpanded } : q ));

    if(newExpanded && !answersMap[id]) {
      setLoadingAnswers(prev => ({ ...prev, [id] : true }));
      try {
        const data = await answerAPI.getByQuestion(id);
        const mapped = data.map(a => ({
          id : a._id,
          author : a.user_id?.name || "Anonymous",
          avatar : a.user_id?.name?.charAt(0)?.toUpperCase() || "?",
          text : a.answer,
          votes : a.up_votes || 0,
          hasVoted : false,
          time : a.created_at
        }));
        setAnswersMap(prev => ({ ...prev, [id] : mapped })); 
      } catch (err) {
        console.error("Failed to load answers : ", err);
      } finally {
        setLoadingAnswers(prev => ({ ...prev, [id] : false }));
      }
    }
  }

  async function voteQuestion(id, direction) {
    const q = questions.find(item => item.id === id);
    if(!q) return;

    if(direction === "up" && q.userVote === "up") {
      const newUp = q.upvotes - 1;
      setQuestions(prev => prev.map(qq => qq.id === id ? { ...qq, upvotes : newUp, userVote : null} : qq ));

      try {
        await questionAPI.upvote(id);
      } catch (err) {}
      return;
    }

    if(direction === "down" && q.userVote === "down") {
      const newDown = q.downvotes - 1;
      setQuestions(prev => prev.map(qq => qq.id === id ? { ...qq, downvotes : newDown, userVote : null } : qq ));

      try {
        await questionAPI.downvote(id);
      } catch (err) {}
      return;
    }

    triggerBurst(id);
    const newUp = direction === "up" ? q.upvotes + 1 : q.upvotes;
    const newDown = direction === "down" ? q.downvotes + 1 : q.downvotes;
    const newUserVote = direction;

    setQuestions(prev => 
      prev.map(qq => qq.id === id
        ? { ...qq, upvotes : newUp, downvotes : newDown, userVote : newUserVote }
        : qq
      )
    );

    try {
      if(direction === "up") {
        await questionAPI.upvote(id);
      } else {
        await questionAPI.downvote(id);
      }
    } catch (err) {
      setQuestions(prev => 
        prev.map(qq => qq.id === id
          ? { ...qq, upvotes : q.upvotes, downvotes : q.downvotes, userVote : q.userVote }
          : qq
        )
      );
    }
  }

  async function upvoteAnswer(qId, aId) {
    const question = questions.find(q => q.id === qId);
    if(!question) return;

    const answerList = answersMap[qId] || [];
    const answer = answerList.find(a => a.id === aId);
    if(!answer) return;

    if(answer.hasVoted) return;
    triggerBurst(`ans-${qId}-${aId}`);

    const updatedAnswers = answerList.map(a => a.id === aId ? { ...a, votes : a.votes + 1, hasVoted : true } : a);
    setAnswersMap(prev => ({ ...prev, [qId] : updatedAnswers }));

    try{
      await answerAPI.upvote(aId);
    } catch (err) {
      const reverted = answerList.map(a => a.id === aId ? { ...a, votes : a.votes, hasVoted : false} : a);
      setAnswersMap(prev => ({ ...prev, [qId] : reverted }));
    }
  }

  async function submitAnswer(qId) {
    const text = (answerText[qId] || "").trim();
    if(!text) return;

    const newAns = {
      id : `temp-${Date.now()}`,
      author : "you",
      avatar : "YU",
      text,
      votes : 0,
      hasVoted : false,
      time : "just now"
    };

    const currentAnswers = answersMap[qId] || [];
    setAnswersMap(prev => ({ ...prev, [qId] : [...currentAnswers, newAns]}));

    try{
      const data = await answerAPI.create(qId, { answer : text });
      const realAns = {
        id : data._id,
        author : data.user_id?.name || "you",
        avatar : data.user_id?.avatar || "YU",
        text : data.answer,
        votes : data.up_votes || 0,
        hasVoted : false,
        time : data.created_at || "just now"
      };
      const updated = (answersMap[qId] || []).map(a => a.id === newAns.id ? realAns : a);
      setAnswersMap(prev => ({ ...prev, [qId] : updated }));
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answersCount : (q.answersCount || 0) + 1} : q ));
    } catch (err) {
      const withoutTemp = (answersMap[qId] || []).filter(a => a.id !== newAns.id);
      setAnswersMap(prev => ({ ...prev, [qId] : withoutTemp }));
      alert("Failed to post answer : " + err.message);
    }
  }

  async function submitQuestion() {
    if(!newTitle.trim()) return;

    const newQuestion = {
      question : newTitle.trim(),
      description : newBody.trim(),
      tag_id : newTags.length ? newTags[0] : null
    };

    const optimisticQ = {
      id : `temp-${Date.now()}`,
      author : "you",
      avatar : "YU",
      title : newTitle.trim(),
      body : newBody.trim(),
      tags : newTags,
      time : "just now",
      upvotes : 0,
      downvotes : 0,
      userVote : null,
      expanded : false,
      answersCount : 0
    };

    setQuestions(prev => [optimisticQ, ...prev]);
    setShowForm(false);
    setNewTitle("");
    setNewBody("");
    setNewTags([]);

    try{
      const data = await questionAPI.create(newQuestion);
      const realQ = {
        id : data._id,
        author : data.user_id?.name || "you",
        avatar : data.user_id?.avatar || "YU",
        title : data.question,
        body : data.description || "",
        tags : data.tags || [],
        time : data.created_at,
        upvotes : data.up_votes || 0,
        downvotes : data.down_votes || 0,
        userVote : null,
        expanded : false,
        answersCount : 0 
      };
      setQuestions(prev => prev.map(q => q.id === optimisticQ.id ? realQ : q));
    } catch (err) {
      setQuestions(prev => prev.filter(q => q.id !== optimisticQ.id));
      alert("Failed to post question : " + err.message);
    }
  }

  function toggleTag(tag) {
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
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

  const sortedQuestions = getSorted();

   return (
    <div className="discussion-page">
      <header className="discussion-page__header">
        <div className="discussion-page__header-container">
          <div className="discussion-page__header-left">
            <button onClick={() => onNavigate("home")} className="discussion-page__back-btn">
              <ArrowLeft className="discussion-page__back-icon" />
            </button>
            <span className="discussion-page__logo">
              VINS<span className="discussion-page__logo-highlight"> FAQ SERVER</span>
            </span>
            <span className="discussion-page__header-badge">/ DISCUSSION</span>
          </div>
          <div className="discussion-page__header-right">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
            <button type="button" onClick={() => setShowForm(true)} className="discussion-page__new-question-btn">
              <Plus className="discussion-page__new-question-icon" /> New Question
            </button>
          </div>
        </div>
      </header>

      <main className="discussion-page__main">
        {showForm && (
          <div className="question-form">
            <div className="question-form__header">
              <h2 className="question-form__title">Post a Question</h2>
              <button onClick={() => setShowForm(false)} className="question-form__close">
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
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`tag-selector__btn ${newTags.includes(tag) ? "tag-selector__btn--selected" : ""}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {newTags.length > 0 && (
                  <p className="selected-tags-info">Selected: {newTags.join(", ")}</p>
                )}
              </div>
              <div className="question-form__actions">
                <button onClick={() => setShowForm(false)} className="question-form__cancel-btn">CANCEL</button>
                <button onClick={submitQuestion} disabled={!newTitle.trim()} className="question-form__submit-btn">
                  POST
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="discussion-page__questions-header">
          <p className="discussion-page__questions-count">{questions.length} QUESTIONS</p>
          <div className="discussion-page__sort">
            <button className="discussion-page__sort-button" onClick={() => setSortOpen(!sortOpen)}>
              SORTED BY : <span className="discussion-page__sort-active">{sortLabel.toUpperCase()}</span>
              <ChevronDown className={`discussion-page__sort-chevron ${sortOpen ? "discussion-page__sort-chevron--open" : ""}`} />
            </button>
            {sortOpen && (
              <div className="discussion-page__sort-dropdown">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`discussion-page__sort-option ${sortBy === opt.value ? "discussion-page__sort-option--active" : ""}`}
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

        <div className="discussion-page__questions-list">
          {loading ? (
            <div className="loading-state">Loading discussions...</div>
          ) : error ? (
            <div className="error-state">Error: {error}</div>
          ) : sortedQuestions.length === 0 ? (
            <div className="empty-state">No questions yet. Be the first to ask!</div>
          ) : (
            sortedQuestions.map((q, index) => {
              const answers = answersMap[q.id] || [];
              const loadingAns = loadingAnswers[q.id] || false;
              return (
                <div
                  key={q.id}
                  className={`question-card ${getHeatClass(q.upvotes)} ${q.expanded ? "question-card--expanded" : ""}`}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <button className="question-card__trigger" onClick={() => toggleExpand(q.id)}>
                    <div className="question-card__avatar">
                      <span className="question-card__avatar-text">{q.avatar}</span>
                    </div>
                    <div className="question-card__content">
                      <p className="question-card__title">{q.title}</p>
                      <div className="question-card__meta">
                        {q.tags.map((tag) => (
                          <span key={tag} className="question-card__tag">{tag}</span>
                        ))}
                        <span className="question-card__info">{q.author} · {q.time}</span>
                        <span className="question-card__answers-count">
                          <MessageSquare className="question-card__answers-icon" />
                          {q.answersCount || 0}
                        </span>
                        <span className="question-card__vote-group" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => voteQuestion(q.id, "up")}
                            className={`question-card__vote-btn ${q.userVote === "up" ? "question-card__vote-btn--up-active" : ""}`}
                          >
                            {voteBursts[q.id] && <span className="vote-burst">+1</span>}
                            <ChevronUp className="question-card__vote-icon" /> {q.upvotes}
                          </button>
                          <button
                            onClick={() => voteQuestion(q.id, "down")}
                            className={`question-card__vote-btn ${q.userVote === "down" ? "question-card__vote-btn--down-active" : ""}`}
                          >
                            <ChevronDown className="question-card__vote-icon" /> {q.downvotes}
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

                      {loadingAns ? (
                        <div className="loading-answers">Loading answers...</div>
                      ) : (
                        answers.length > 0 && (
                          <div className="answers-list">
                            {answers.map((ans) => (
                              <div key={ans.id} className="answer-item">
                                <div className="answer-item__vote">
                                  <button
                                    type="button"
                                    onClick={() => upvoteAnswer(q.id, ans.id)}
                                    disabled={ans.hasVoted}
                                    className={`answer-item__vote-btn ${ans.hasVoted ? "answer-item__vote-btn--voted" : ""}`}
                                  >
                                    {voteBursts[`ans-${q.id}-${ans.id}`] && <span className="vote-burst">+1</span>}
                                    <ChevronUp className="answer-item__vote-icon" />
                                  </button>
                                  <span className={`answer-item__vote-count ${ans.hasVoted ? "answer-item__vote-count--voted" : ""}`}>
                                    {ans.votes}
                                  </span>
                                </div>
                                <div className="answer-item__content">
                                  <p className="answer-item__text">{ans.text}</p>
                                  <p className="answer-item__meta">{ans.author} · {ans.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      <div className="answer-form">
                        <p className="answer-form__label">YOUR ANSWER</p>
                        <textarea
                          rows={3}
                          placeholder="Write a clear, helpful answer..."
                          value={answerText[q.id] || ""}
                          onChange={(e) =>
                            setAnswerText((prev) => ({ ...prev, [q.id]: e.target.value }))
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
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}