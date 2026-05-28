import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, User, HelpCircle } from 'lucide-react'
import '../styles/HomePage.css'

const FAQS = [
    {
        id : 1,
        category : 'General',
        question : 'What is this platform and how does it work?',
        answer : 'This is a crowd-sourced FAQ platform where the community posts questions, provides answers, and upvotes the most helpful responses. Think of it as a living knowedge base - the best answers rise to the top through collective voting.',
    },
    {
        id: 2,
        category: 'Account',
        question: 'How do I create an account and get started?',
        answer: 'Click the Profile button in the top-right corner to set up your account. Once registered, you can post questions, write answers, and start accumulating upvotes from the community.',
    },
    {
        id: 3,
        category: 'Voting',
        question: 'How does the upvote system work?',
        answer: 'Any logged-in user can upvote an answer they find helpful. Upvotes signal quality to other readers and contribute to the answerer reputation score. You cannot upvote your own answers.',
    },
    {
        id: 4,
        category: 'Moderation',
        question: 'What content is not allowed on this platform?',
        answer: 'Spam, duplicate questions, off-topic posts, and abusive content are not permitted. The community can flag posts for moderator review. Repeated violations may result in account restrictions.',
    },
    {
        id: 5,
        category: 'General',
        question: 'Can I edit or delete my questions and answers?',
        answer: 'Yes. You can edit your own posts at any time from your profile page. Deletion is available as long as your answer has not been accepted as the top response, to preserve discussion integrity.',
    },
    {
        id: 6,
        category: 'Account',
        question: 'How is my reputation score calculated?',
        answer: 'Your reputation is the sum of all upvotes received on your answers. Each upvote counts as +1. High-reputation users gain additional privileges such as the ability to close duplicate questions.',
    },
]

const CATEGORIES = ['All','General', 'Account', 'Voting', 'Moderation']

export default function HomePage({ onNavigate }) {
    const [query, setQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [expandedId, setExpandedId] = useState(null)

    const filtered = FAQS.filter((faq) => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
        const matchesQuery = query.trim() === '' || faq.question.toLowerCase().includes(query.toLowerCase()) || faq.answer.toLowerCase().includes(query.toLowerCase())
        return matchesCategory && matchesQuery
    })

    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <div className="header-inner">
                    <span className="logo">
                        FAQ
                    </span>

                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type='text'
                            placeholder='Search existing questions...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input"
                        />                 
                    </div>

                    <button
                        onClick={() => onNavigate('discussion')}
                        className="ask-button"
                    >
                        <HelpCircle className="ask-icon" />
                        Ask Question
                    </button>

                    <button
                        onClick={() => onNavigate('profile')}
                        className="profile-button"
                    >
                        <User className="profile-icon" />
                    </button>
                </div>
            </header>

            <div className="hero-section">
                <p className="hero-badge">
                    Community Knowledge Base
                </p>
                <h1 className="hero-title">
                    Crowd-Sourced FAQ
                </h1>
                <p className="hero-description">
                    Answers written and voted by the community. If your question
                    isn't here, post it in the discussion board.
                </p>
            </div>

            <div className="categories-section">
                <div className="categories-wrapper">
                    {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`category-button ${activeCategory === cat ? 'category-button-active' : ''}`}
                    >
                        {cat.toUpperCase()}
                    </button>
                    ))}
                </div>
            </div>

            <main className="main-content">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-message">
                            No matches found for "{query}"
                        </p>
                        <button
                            onClick={() => onNavigate('discussion')}
                            className="empty-link"
                        >
                            Post this question -
                        </button>
                    </div>
                ) : (
                    <div className="faq-list">
                        {filtered.map((faq) => (
                            <div key={faq.id} className="faq-item">
                                <button
                                    className="faq-question"
                                    onClick={() =>
                                        setExpandedId(expandedId === faq.id ? null : faq.id)
                                    }
                                >
                                    <div className="question-content">
                                        <div className="question-meta">
                                            <span className="category-tag">
                                                {faq.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="question-text">
                                            {faq.question}
                                        </p>
                                    </div>

                                    <div className="chevron-icon">
                                        {expandedId === faq.id ? (
                                            <ChevronUp />
                                        ) : (
                                            <ChevronDown />
                                        )}
                                    </div>
                                </button>

                                {expandedId === faq.id && (
                                    <div className="faq-answer">
                                        <p className="answer-text">
                                            {faq.answer}
                                        </p>   
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="footer-cta">
                            <p className="cta-text">
                                Can't find your answer?
                            </p>
                            <button
                                onClick={() => onNavigate("discussion")}
                                className="cta-button"
                            >
                                Post a New Question
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}