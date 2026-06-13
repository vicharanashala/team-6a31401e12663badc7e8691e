/**
 * HOME PAGE COMPONENT -  LANDING PAGE OF PLATFORM WITH LIST OF FAQs
 * 
 * Features:
 * - Search FAQs by text - highlights matching terms.
 * - Filter by tags.
 * - Expand/collapse individual FAQ answers.
 */

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/HomePage.css";

const FAQS = [
  {
    id: 1,
    category: "General",
    question: "What is this platform and how does it work?",
    answer:
      "This is a crowd-sourced FAQ platform where the community posts questions, provides answers, and upvotes the most helpful responses. Think of it as a living knowledge base — the best answers rise to the top through collective voting.",
    votes: 142,
    answers: 3,
  },
  {
    id: 2,
    category: "Account",
    question: "How do I create an account and get started?",
    answer:
      "Click the Profile button in the top-right corner to set up your account. Once registered, you can post questions, write answers, and start accumulating upvotes from the community.",
    votes: 98,
    answers: 5,
  },
  {
    id: 3,
    category: "Voting",
    question: "How does the upvote system work?",
    answer:
      "Any logged-in user can upvote an answer they find helpful. Upvotes signal quality to other readers and contribute to the answerer's reputation score. You cannot upvote your own answers.",
    votes: 76,
    answers: 2,
  },
  {
    id: 4,
    category: "Moderation",
    question: "What content is not allowed on this platform?",
    answer:
      "Spam, duplicate questions, off-topic posts, and abusive content are not permitted. The community can flag posts for moderator review. Repeated violations may result in account restrictions.",
    votes: 61,
    answers: 4,
  },
  {
    id: 5,
    category: "General",
    question: "Can I edit or delete my questions and answers?",
    answer:
      "Yes. You can edit your own posts at any time from your profile page. Deletion is available as long as your answer has not been accepted as the top response, to preserve discussion integrity.",
    votes: 54,
    answers: 1,
  },
  {
    id: 6,
    category: "Account",
    question: "How is my reputation score calculated?",
    answer:
      "Your reputation is the sum of all upvotes received on your answers. Each upvote counts as +1. High-reputation users gain additional privileges such as the ability to close duplicate questions.",
    votes: 49,
    answers: 2,
  },
];

const CATEGORIES = ["All", "General", "Account", "Voting", "Moderation"];

const CATEGORY_SLUG = {
  General: "general",
  Account: "account",
  Voting: "voting",
  Moderation: "moderation",
};

// FUNCTION THAT HIGHLIGHTS SEARCH TERMS INSIDE TEXT
function highlightText(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="home-page__highlight">{part}</mark>
    ) : (
      part
    ),
  );
}

export default function HomePage({ onNavigate, onRequestLogin, user, dark, onToggleTheme }) {

  // STATE MANAGEMENT
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // FILTER FAQs BASED ON SELECTED TAG AND SEARCH QUERY
  const filtered = FAQS.filter((faq) => {
    const matchesCategory =
      activeCategory === "All" || faq.category === activeCategory;
    const matchesQuery =
      query.trim() === "" ||
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // RENDER DOM
  return (
    <div className="home-page">

      {/* SCROLL PROGRESS INDICATOR - AT TOP BAR */}

      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden />
      
      {/* BACKGROUND ELEMENTS */}
      
      <div className="home-page__grid-bg" aria-hidden />
      <div className="home-page__glow-orb home-page__glow-orb--cyan" aria-hidden />
      <div className="home-page__glow-orb home-page__glow-orb--magenta" aria-hidden />

      {/* HEADER SECTION WITH LOGO, SEARCH BAR, ASK BUTTON, THEME TOGGLE AND USER */}

      <header className="home-page__header">
        <div className="home-page__header-container">

          {/* LOGO OF THE PLATFORM */}

          <span className="home-page__logo">
            VINS<span className="home-page__logo-highlight"> FAQ SERVER</span>
          </span>

          {/* SEARCH BAR */}

          <div className="home-page__search-wrapper">
            <Search className="home-page__search-icon" />
            <input
              type="text"
              placeholder="Search existing questions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`home-page__search-input ${query ? "home-page__search-input--active" : ""}`}
            />
          </div>

          {/* ASK BUTTON - NAVIGATE TO DISCUSSION PAGE */}

          <button
            type="button"
            onClick={() => onNavigate("discussion")}
            className="home-page__ask-btn"
          >
            Ask Question
          </button>

          <ThemeToggle dark={dark} onToggle={onToggleTheme} />

          {/* USER PROFILE OR LOGIN SECTION */}

          {user ? (

            // IF USER IS LOGGED IN - SHOW AVATAR THAT LEADS TO PROFILE OR ADMIN PAGE

            <button
              type="button"
              onClick={() => 
                onNavigate(user.role === "admin" ? "admin" : "profile")
              }
              className="home-page__user-avatar"
              title={user.role === "admin" ? "Admin Dashboard" : "Profile"}
            >
              <span className="home-page__user-avatar-text">{user.avatar}</span>
            </button>
          ) : (

            // IF NOT LOOGED IN - SHOW LOGIN BUTTON

            <button
              type="button"
              onClick={onRequestLogin}
              className="home-page__login-btn"
            >
              LOGIN
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION WITH TITLE AND DESCRIPTION */}

      <div className="home-page__hero">
        <p className="home-page__hero-badge">Community Knowledge Base</p>
        <h1 className="home-page__hero-title">Crowd-Sourced FAQ</h1>
        <p className="home-page__hero-description">
          Answers written and voted on by the community. If your question
          isn't here, post it in the discussion board.
        </p>
      </div>

      {/* TAGS FILTERS */}

      <div className="home-page__filters">
        <div className="home-page__filters-container">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`home-page__filter-btn home-page__filter-btn--${cat.toLowerCase()} ${
                activeCategory === cat ? "home-page__filter-btn--active" : ""
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN SECTION WITH FAQ LIST OR EMPTY STATE */}

      <main className="home-page__main">
        {filtered.length === 0 ? (

          // EMPTY STATE - NO FAQ MATCH SEARCH

          <div className="home-page__empty">
            <p className="home-page__empty-message">
              No matches found for "{query}"
            </p>
            <button
              type="button"
              onClick={() => onNavigate("discussion")}
              className="home-page__empty-action"
            >
              Post this question →
            </button>
          </div>
        ) : (

          // NORMAL STATE - LIST OF FAQ ITEMS

          <div className="home-page__faq-list">
            {filtered.map((faq, index) => {
              const isOpen = expandedId === faq.id;
              const slug = CATEGORY_SLUG[faq.category] || "general";
              return (
                <div 
                  key={faq.id} 
                  className={`faq-item faq-item--${slug} ${isOpen ? "faq-item--expanded" : ""}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                >

                  {/* CLICKABLE HEADER THAT EXPANDS OR COLLAPSES - CONTAINS ANSWER */}

                  <button
                    type="button"
                    className="faq-item__trigger"
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                  >

                    {/* TAG OF FAQ AND META DATA */}

                    <div className="faq-item__content">
                      <div className="faq-item__meta">
                        <span className="faq-item__category">
                          {faq.category.toUpperCase()}
                        </span>
                        <span className="faq-item__votes">
                          <ChevronUp className="faq-item__votes-icon" />
                          {faq.votes}
                        </span>
                      </div>
                      <p className="faq-item__question">
                        {highlightText(faq.question, query)}
                      </p>
                    </div>
                    <div className="faq-item__expand-icon">
                      <ChevronDown
                        className={`faq-item__chevron ${isOpen ? "faq-item__chevron--open" : ""}`}
                      />
                    </div>
                  </button>

                  {/* EXPANDED ANSWER - WHEN IS OPEN IS TRUE */}

                  {isOpen && (
                    <div className="faq-item__answer">
                      <div className="faq-item__answer-inner">
                      <p className="faq-item__answer-prefix">&gt; answer:</p>
                      <p className="faq-item__answer-text">
                        {highlightText(faq.answer, query)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* CALL TO ACTION SECTION - WITH POST QUESTION BUTTON DIRECT TO DISCUSSION PAGE */}

        <div className="home-page__cta">
          <p className="home-page__cta-text">Can't find your answer?</p>
          <button
            type="button"
            onClick={() => onNavigate("discussion")}
            className="home-page__cta-btn"
          >
            Post a New Question
          </button>
        </div>
      </main>
    </div>
  );
}