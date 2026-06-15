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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// FUNCTION THAT HIGHLIGHTS SEARCH TERMS INSIDE TEXT
function highlightText(text, query) {
  if (!query.trim()) {
    return text;
  }
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="home-page__highlight">{part}</mark>
    ) : (
      part
    ),
  );
}

// CAPITALISE FIRST LETTER OF A TAG
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function HomePage({ onNavigate, onRequestLogin, user, dark, onToggleTheme }) {

  // STATE MANAGEMENT
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [availableTags, setAvailableTags] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // FETCH AVAILABLE TAGS FROM BACKEND
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tags`);
        const data = await response.json();

        if(response.ok && data.success) {
          const tagNames = data.data.map(tag => tag.tag_name);
          setAvailableTags(["All", ...tagNames]);
        } else {
          console.warn("Failed to fetch tags");
          setAvailableTags(["All Test", "General Test", "Account Test"]);
        }
      } catch (err) {
        console.err("Error Fetching tags : ", err);
        setAvailableTags(["All Test", "General Test", "Account Test"]);
      }
    };
    fetchTags();
  }, []);

  // FILTER FAQs BASED ON SELECTED TAG AND SEARCH QUERY
  const fetchFAQs = async () => {
    setLoading(true);
    setError(null);

    try {
      let url;
      const hasSearch = query.trim() !== "";
      const hasTag = selectedTag !== "All";

      if(hasSearch || hasTag) {
        const params = new URLSearchParams();
        if(hasSearch) {
          params.append('q', query.trim());
        }
        if(hasTag) {
          params.append('tag', selectedTag);
        }

        url = `${API_BASE_URL}/search?${params.toString()}`;
      } else {
        url = `${API_BASE_URL}/faqs`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if(!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load FAQs');
      }

      const mappedFaqs = data.data.map(item => ({
        id : item._id,
        question : item.question,
        answer : item.answer,
        tag : item.tag || 'general',
        votes : item.helpful?.yes || 0,
        answers : 0
      }));

      setFaqs(mappedFaqs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REFETCH WHEN SEARCH QUERY OR SELECTED TAG CHANGES
  useEffect(() => {
    fetchFAQs();
  }, [query, selectedTag]);

  // SCROLL PROGRESS BAR
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // LOADING STATE 
  if(loading && faqs.length === 0) {
    return (
      <div className="home-page">
        <div className="loading-spinner">Loading FAQs...</div>
      </div>
    );
  }

  // ERROR STATE 
  if(error && faqs.length === 0) {
    return (
      <div className="home-page">
        <div className="error-message">Error : {error}</div>
      </div>
    );
  }

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
          {availableTags.map((tag) => {
            const displayTag = tag === "All" ? "All" : capitalise(tag);
            const isActive = selectedTag === tag;

            const additionalClass = tag === "All" ? "home-page__filter-btn--all" : `home-page__filter-btn--${tag}`; 
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`home-page__filter-btn ${additionalClass} ${isActive ? "home-page__filter-btn--active" : ""}`}
              >
                {displayTag.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN SECTION WITH FAQ LIST OR EMPTY STATE */}

      <main className="home-page__main">
        {faqs.length === 0 ? (

          // EMPTY STATE - NO FAQ MATCH SEARCH

          <div className="home-page__empty">
            <p className="home-page__empty-message">
              No FAQs found. {query && `No matches for "${query}". `}
              Try a different search or post a new question.
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
            {faqs.map((faq, index) => {
              const isOpen = expandedId === faq.id;
              const slug = faq.tag;
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
                          {capitalise(faq.tag).toUpperCase()}
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