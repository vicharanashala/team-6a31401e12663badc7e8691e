import { useState, useEffect } from "react";
import { ArrowLeft, ChevronUp, MessageSquare, Award } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useCountUp } from "../hooks/useCountUp";
import { userAPI, questionAPI, answerAPI } from "../services/api";
import "../styles/ProfilePage.css";

const BADGES = [
  { label: "First Answer", icon: "✦", earned: true },
  { label: "Top 10%", icon: "◆", earned: true },
  { label: "Helpful Voice", icon: "▲", earned: true },
  { label: "Century", icon: "●", earned: false }
];

export default function ProfilePage({ onNavigate, user, onLogout, dark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("answers");
  const [profile, setProfile] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.id;

  useEffect(() => {
    if(!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileData, statsData, questionsData, answersData] = await Promise.all([
          userAPI.getById(userId),
          userAPI.getStats(userId),
          questionAPI.getByUser(userId),
          answerAPI.getByUser(userId)
        ]);

        setProfile({
          name : profileData.name,
          handle : profileData.handle || `@${profileData.name.toLowerCase().replace(/\s/g, '_')}`,
          avatar : profileData.avatar || profileData.name?.charAt(0)?.toUpperCase() || "?",
          bio : profileData.bio || "No bio yet.",
          joined : profileData.created_at || "Unknown"
        });

        setStats({
          totalUpvotes : statsData.stats?.upvotes_received || 0,
          totalQuestions : statsData.stats?.questions_asked || 0,
          totalAnswers : statsData.stats?.answers_given || 0
        });

        const mappedQuestions = questionsData.map(q => ({
          id : q._id,
          title : q.question,
          answers : q.answers_count || 0,
          time : q.created_at,
          tags : q.tag_id ? [q.tag_id.tag_name] : []
        }));
        setUserQuestions(mappedQuestions);

        const mappedAnswers =  answersData.map(a => ({
          id : a._id,
          question : a.question_id?.title || "Unknown question",
          excerpt : a.answer?.slice(0, 100) + (a.answer?.length > 100 ? "..." : ""),
          votes : a.up_votes || 0,
          time : a.created_at
        }));
        setUserAnswers(mappedAnswers);
      } catch (err) {
        setError(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if(loading) {
    return (
      <div className="profile-page">
        <header className="profile-page__header">
          <div className="profile-page__header-container">
            <button onClick={() => onNavigate("home")} className="profile-page__back-btn">
              <ArrowLeft className="profile-page__back-icon" />
            </button>
            <span className="profile-page__logo">
              VINS<span className="profile-page__logo-highlight">FAQ SERVER</span>
            </span>
            <span className="profile-page__header-badge">/ PROFILE</span>
            <div className="logout-container">
              <ThemeToggle dark={dark} onToggle={onToggleTheme} />
              <button onClick={onLogout} className="logout-btn">LOGOUT</button>
            </div>
          </div>
        </header>
        <main className="profile-page__main">
          <div className="profile-loading">Loading Profile...</div>
        </main>
      </div>
    );
  }

  if(error) {
    return (
      <div className="profile-page">
        <header className="profile-page__header">...</header>
        <main className="profile-page__main">
          <div className="profile-error">Error : {error}</div>
        </main>
      </div>
    );
  }

  if(!profile) {
    return (
      <div className="profile-page">
        <header className="profile-page__header">...</header>
        <main className="profile-page__main">
          <div className="profile-error">User profile not found.</div>
        </main>
      </div>
    );
  }

  const upvotes = useCountUp(stats?.totalUpvotes || 0);
  const questions = useCountUp(stats?.totalQuestions || 0);
  const answers = useCountUp(stats?.totalAnswers || 0);

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <div className="profile-page__header-container">
          <button
            onClick={() => onNavigate("home")}
            className="profile-page__back-btn"
          >
            <ArrowLeft className="profile-page__back-icon" />
          </button>
          <span className="profile-page__logo">
            VINS<span className="profile-page__logo-highlight"> FAQ SERVER</span>
          </span>
          <span className="profile-page__header-badge">/ PROFILE</span>
          <div className="logout-container">
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
            <button type="button" onClick={onLogout} className="logout-btn">
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="profile-page__main">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-card__avatar">
            <span className="profile-card__avatar-text">{profile.avatar}</span>
          </div>
          <div className="profile-card__info">
            <h1 className="profile-card__name">{profile.name}</h1>
            <p className="profile-card__handle">{profile.handle}</p>
            <p className="profile-card__bio">{profile.bio}</p>
            <p className="profile-card__joined">JOINED {profile.joined.toUpperCase()}</p>
          </div>
        </div>

        {/* Stats row */}
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

        {/* Badges section */}
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

        {/* Tabs */}
        <div className="profile-tabs">
          {["answers", "questions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`profile-tab ${activeTab === tab ? "profile-tab--active" : ""}`}
            >
              {tab} ({tab === "answers" ? userAnswers.length : userQuestions.length})
            </button>
          ))}
        </div>

        {/* Tab content: Answers */}
        {activeTab === "answers" && (
          <div className="answers-list">
            {userAnswers.length === 0 ? (
              <div className="empty-state">No answers yet.</div>
            ) : (
              userAnswers.map((ans) => (
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
              ))
            )}
          </div>
        )}

        {/* Tab content: Questions */}
        {activeTab === "questions" && (
          <div className="questions-list">
            {userQuestions.length === 0 ? (
              <div className="empty-state">No questions asked yet.</div>
            ) : (
              userQuestions.map((q) => (
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
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}