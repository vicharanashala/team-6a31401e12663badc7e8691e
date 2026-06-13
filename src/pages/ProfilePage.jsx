/**
 * PROFILE PAGE COMPONENT - DISPLAYS THE USER PROFILE WITH BASIC INFO, STATS, BADGES AND THEIR ACTIVITY.
 * 
 * Features:
 * - Shows user avatar, name, handle, bio, and join date.
 * - Animated statistics using `useCountUp` hook.
 * - Badges section showing earned achievements.
 * - Tabbed view: "Answers" and "Questions" lists. 
 */

import { useState } from "react";
import { ArrowLeft, ChevronUp, MessageSquare, Award } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useCountUp } from "../hooks/useCountUp";
import "../styles/ProfilePage.css";

const USER = {
  name: "Aashu Goswami",
  handle: "@aashu_goswami",
  avatar: "AG",
  bio: "Software engineer. Obsessed with clean documentation and helpful communities.",
  joined: "March 2023",
  totalUpvotes: 248,
  totalQuestions: 12,
  totalAnswers: 31,
};

const MY_QUESTIONS = [
  {
    id: 1,
    title: "How do I reset my password if I no longer have access to my email?",
    answers: 2,
    time: "2h ago",
    tags: ["account", "security"],
  },
  {
    id: 2,
    title: "Is there a way to follow specific tags or topics?",
    answers: 0,
    time: "1d ago",
    tags: ["feature", "notifications"],
  },
  {
    id: 3,
    title: "Can I export my answer history as a PDF?",
    answers: 1,
    time: "3d ago",
    tags: ["account", "export"],
  },
  {
    id: 4,
    title: "Why are some answers marked with an orange border?",
    answers: 3,
    time: "1w ago",
    tags: ["general"],
  },
];

const MY_ANSWERS = [
  {
    id: 1,
    question: "What is this platform and how does it work?",
    excerpt:
      "This is a crowd-sourced FAQ platform where the community posts questions and votes on the most helpful responses...",
    votes: 142,
    time: "5d ago",
  },
  {
    id: 2,
    question: "How does the upvote system work?",
    excerpt:
      "Any logged-in user can upvote an answer they find helpful. Upvotes signal quality to other readers...",
    votes: 76,
    time: "1w ago",
  },
  {
    id: 3,
    question: "Can I edit or delete my questions and answers?",
    excerpt:
      "Yes. You can edit your own posts at any time from your profile page. Deletion is available as long as...",
    votes: 54,
    time: "2w ago",
  },
  {
    id: 4,
    question: "How do I report a misleading answer?",
    excerpt:
      "Use the flag icon on any post to report it. The moderation team reviews all flagged content within 24 hours.",
    votes: 21,
    time: "3w ago",
  },
];

const BADGES = [
  { label: "First Answer", icon: "✦", earned: true },
  { label: "Top 10%", icon: "◆", earned: true },
  { label: "Helpful Voice", icon: "▲", earned: true },
  { label: "Century", icon: "●", earned: false },
];

export default function ProfilePage({ onNavigate, user, onLogout, dark, onToggleTheme }) {

  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState("answers");
  const displayUser = user ? { ...USER, ...user } : USER;
  const upvotes = useCountUp(USER.totalUpvotes);
  const questions = useCountUp(USER.totalQuestions);
  const answers = useCountUp(USER.totalAnswers);

  // RENDER DOM
  return (
    <div className="profile-page">

      {/* HEADER SECTION WITH BACK BUTTON, LOGO, THEME TOGGLE BUTTON AND LOGOUT BUTTON */}

      <header className="profile-page__header">
        <div className="profile-page__header-container">

          {/* BACK BUTTON */}

          <button
            onClick={() => onNavigate("home")}
            className="profile-page__back-btn"
          >
            <ArrowLeft className="profile-page__back-icon" />
          </button>

          {/* LOGO OF THE PLATFORM */}

          <span className="profile-page__logo">
            VINS<span className="profile-page__logo-highlight"> FAQ SERVER</span>
          </span>
          <span className="profile-page__header-badge">/ PROFILE</span>
          
          {/* THEME TOGGLE BUTTON AND LOGOUT BUTTON */}
          
          <div className="logout-container">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
            <button type="button" onClick={onLogout} className="logout-btn">
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="profile-page__main">
        
        {/* MAIN PROFILE CARD - AVATAR, NAME, USER HANDLE, BIO AND JOIN DATE */}
        
        <div className="profile-card">
          <div className="profile-card__avatar">
            <span className="profile-card__avatar-text">{displayUser.avatar}</span>
          </div>
          <div className="profile-card__info">
            <h1 className="profile-card__name">{displayUser.name}</h1>
            <p className="profile-card__handle">{displayUser.handle}</p>
            <p className="profile-card__bio">{displayUser.bio}</p>
            <p className="profile-card__joined">JOINED {displayUser.joined.toUpperCase()}</p>
          </div>
        </div>

        {/* STATISTICS ROW - TOTAL UPVOTES, TOTAL QUESTIONS AND TOTAL ANSWERS */}
        
        <div className="profile-stats">
          <div className="profile-stats__item">
            <div className="profile-stats__icon-wrapper">
              <ChevronUp className="profile-stats__icon profile-stats__icon--primary" />
              <span className="profile-stats__value">{upvotes}</span>
            </div>
            <p className="profile-stats__label">TOTAL UPVOTES</p>
          </div>
          <div className="profile-stats__item">
            <div className="profile-stats__icon-wrapper">
              <MessageSquare className="profile-stats__icon" />
              <span className="profile-stats__value">{questions}</span>
            </div>
            <p className="profile-stats__label">QUESTIONS</p>
          </div>
          <div className="profile-stats__item">
            <div className="profile-stats__icon-wrapper">
              <Award className="profile-stats__icon" />
              <span className="profile-stats__value">{answers}</span>
            </div>
            <p className="profile-stats__label">ANSWERS</p>
          </div>
        </div>

        {/* BADGES SECTION - UNLOCKED FIRST THEN LOCKED */}
        <div className="badges-section">
          <p className="badges-section__title">BADGES</p>
          <div className="badges-section__list">
            {BADGES.map((b) => (
              <div
                key={b.label}
                className={`badge ${b.earned ? "badge--earned" : "badge--locked"}`}
              >
                <span className="badge__icon">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* TABS - ANSWERS AND QUESTIONS */}
        <div className="profile-tabs">
          {["answers", "questions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`profile-tab ${activeTab === tab ? "profile-tab--active" : ""}`}
            >
              {tab} ({tab === "answers" ? MY_ANSWERS.length : MY_QUESTIONS.length})
            </button>
          ))}
        </div>

        {/* ANSWER TAB - SHOWS USER POSTED ANSWERS */}
        {activeTab === "answers" && (
          <div className="answers-list">
            {MY_ANSWERS.map((ans) => (
              <div key={ans.id} className="answer-item">
                <div className="answer-item__votes">
                  <ChevronUp className="answer-item__upvote-icon" />
                  <span className="answer-item__votes-count">{ans.votes}</span>
                </div>
                <div className="answer-item__content">
                  <p className="answer-item__question">{ans.question}</p>
                  <p className="answer-item__excerpt">{ans.excerpt}</p>
                  <p className="answer-item__time">{ans.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUESTION TAB - SHOWS USER ASKED QUESTIONS */}
        {activeTab === "questions" && (
          <div className="questions-list">
            {MY_QUESTIONS.map((q) => (
              <div key={q.id} className="question-item">
                <p className="question-item__title">{q.title}</p>
                <div className="question-item__meta">
                  {q.tags.map((tag) => (
                    <span key={tag} className="question-item__tag">{tag}</span>
                  ))}
                  <span className="question-item__answers-count">
                    <MessageSquare className="question-item__icon" />
                    {q.answers} answers
                  </span>
                  <span className="question-item__time">{q.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}