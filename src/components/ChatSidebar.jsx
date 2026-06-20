import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import "../styles/chatSidebar.css";
import { BOT_GREET, BOT_RESPONSES } from "../data/chatbot.js";

function getBotReply(input) {
  const lower = input.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const response of BOT_RESPONSES) {
    const score = response.keys.filter(k => lower.includes(k)).length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }

  return bestMatch ? bestMatch.reply : "I couldn't find an exact answer. Post your question in Discussion.";
}

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([{ id: 0, from: "bot", text: BOT_GREET }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        inputRef.current?.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: Date.now(), from: "user", text: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, from: "bot", text: getBotReply(trimmed) };
      setMessages(m => [...m, botMsg]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div className="vins-overlay" onClick={onClose} />
      <div className="vins-chatbot">
        <div className="vins-chatbot-header">
          <div className="vins-chatbot-title">
            <div className="vins-chatbot-dot" />
            <div>
              <h3>VINS Assistant</h3>
              <span>AI-powered FAQ helper</span>
            </div>
          </div>
          <button className="vins-btn-icon" onClick={onClose} aria-label="Close chatbot">
            <X size={16} />
          </button>
        </div>

        <div className="vins-chatbot-messages" ref={messagesRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`vins-chat-msg ${msg.from}`}>
              {msg.text}
            </div>
          ))}
          {typing && (
            <div className="vins-chat-msg bot" style={{ opacity: 0.6, fontStyle: "italic" }}>
              Typing…
            </div>
          )}
        </div>

        <div className="vins-chatbot-input">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything…"
          />
          <button className="vins-btn vins-btn-primary" onClick={send} style={{ width: 38, padding: 0, justifyContent: "center" }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
