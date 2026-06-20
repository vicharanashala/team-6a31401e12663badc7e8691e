import { useState, useEffect, useRef } from "react";
import { Search, ChevronUp, ChevronDown, MessageSquare, Sparkles, ArrowRight, Users, BookOpen, HelpCircle } from "lucide-react";
import ChatBot from "../components/chatSidebar";
import ThemeToggle from "../components/ThemeToggle";
import { FAQS } from "../data/faqs";
import { TAGS } from "../data/tags";
import "../styles/HomePage.css";

function highlightText(text, query) {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="home-page__highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function smoothScrollTo(element, duration = 2000) {
  if (!element) return;

  const targetY = element.getBoundingClientRect().top + window.pageYOffset - 160;

  const startY = window.pageYOffset;
  const distance = targetY - startY;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startY + distance * ease);

    if (elapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

function FAQItem({ faq, search, innerRef }) {
  const [open, setOpen] = useState(false);

  return (
    <div ref={innerRef} className={`vins-faq-item ${open ? "expanded" : ""}`}>
      <button
        className="vins-faq-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <div className="vins-faq-q-meta">
          <span className={`vins-tag vins-tag-${faq.tag}`}>
            {faq.tag}
          </span>

          <span className="vins-faq-question">
            {highlightText(faq.question, search)}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`vins-faq-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="vins-faq-answer">
          {highlightText(faq.answer, search)}
        </div>
      )}
    </div>
  );
}

export default function HomePage({ onNavigate, onRequestLogin, user, dark, onToggleTheme }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [chatOpen, setChatOpen] = useState(false);

  const faqRefs = useRef({});
  const allTags = TAGS;

  const visibleFaqs = FAQS.filter(
    (faq) => activeTag === "All" || faq.tag === activeTag
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!search.trim()) return;

      const firstMatch = visibleFaqs.find(
        (faq) => faq.question.toLowerCase().includes(search.toLowerCase()) 
      );

      if (!firstMatch) return;

      const element = faqRefs.current[firstMatch.id];
      smoothScrollTo(element, 800);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, activeTag, visibleFaqs]);

  return (
    <div className="vins-page">
      {/* Navbar */}
      <nav className="vins-nav">
        <div className="vins-nav-inner">
          <span className="vins-nav-logo">
            VINS <span>FAQ SERVER</span>
          </span>

          <div className="vins-nav-search">
            <span className="vins-nav-search-icon">
              <Search size={14} />
            </span>

            <input
              placeholder="Search FAQs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="vins-nav-actions">
            <button
              className="vins-btn vins-btn-primary"
              onClick={() => onNavigate("discussion")}
            >
              <MessageSquare size={14} />
              Ask Question
            </button>

            <ThemeToggle dark={dark} onToggle={onToggleTheme} />

            {user ? (
              <div
                className="vins-btn vins-btn-ghost"
                style={{ background: user.avatarColor }}
                onClick={() =>
                  onNavigate(user.role === "admin" ? "admin" : "profile")
                }
                title={user.name}
              >
                <Users size={14} />
              </div>
            ) : (
              <button
                className="vins-btn vins-btn-ghost"
                onClick={onRequestLogin}
              >
                Login
              </button>
            )}

            <button
              className="vins-btn vins-btn-ghost"
              onClick={() => setChatOpen(true)}
              style={{ gap: 6 }}
            >
              <Sparkles size={14} />
              VINS Assistant
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--vins-border)" }}>
        <div className="vins-hero">
          <div className="vins-hero-eyebrow">
            <BookOpen size={10} />
            CROWD-SOURCED KNOWLEDGE
          </div>

          <h3>
            Every answer you need,
            <br />
            <em>built by the community</em>
          </h3>
        </div>
      </section>

      {/* FAQ Section */}
      <main className="vins-container" style={{ flex: 1 }}>
        <div className="vins-section">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.4px",
              }}
            >
              <HelpCircle
                size={18}
                style={{
                  display: "inline",
                  marginRight: 8,
                  color: "var(--vins-primary)",
                  verticalAlign: "middle",
                }}
              />
              Frequently Asked Questions
            </h2>

            <span
              style={{
                fontFamily: "var(--vins-font-mono)",
                fontSize: 12,
                color: "var(--vins-fg-muted)",
              }}
            >
              {visibleFaqs.length} of {FAQS.length} shown
            </span>
          </div>

          {/* Tag Filters */}
          <div className="vins-tag-bar">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`vins-tag-filter-btn ${
                  activeTag === tag ? "active" : ""
                }`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {visibleFaqs.length > 0 ? (
            <div className="vins-faq-stack">
              {visibleFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  search={search}
                  innerRef={(el) => (faqRefs.current[faq.id] = el)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "var(--vins-fg-muted)",
                fontSize: 14,
              }}
            >
              No FAQs available.
            </div>
          )}

          {/* CTA */}
          <div className="vins-cta-strip">
            <div>
              <h3>Can't find what you're looking for?</h3>
              <p>
                Post your question in the community discussion — someone will
                answer within hours.
              </p>
            </div>

            <button
              className="vins-btn vins-btn-primary"
              style={{ height: 40, padding: "0 18px", flexShrink: 0 }}
              onClick={() => onNavigate("discussion")}
            >
              Go to Discussion
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  );
}