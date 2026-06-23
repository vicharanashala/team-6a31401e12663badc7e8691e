import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import "../styles/chatSidebar.css";
import { faqAPI } from "../services/api.js";

const BOT_GREET = "Hi! I'm VINS Assistant 🤖 I can help with internship FAQs, phases, certificates, badges, discussions, and platform usage.";


export default function ChatBot({ onClose, onNavigate }) {
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

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: "user", text: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const results = await faqAPI.search(trimmed, null);
      let botText;
      let showRedirect = false;

      if(results && results.length > 0) {
        const best = results[0];
        botText = `I found this answer:\n\n**Question:**${best.question}\n\n**Answer:**${best.answer}`;
      } else {
        botText = "I couldn't find an exact answer in the FAQ database. Would you like to post your question in the Discussion board so the community can help?";
        showRedirect = true;
      }

      const botMsg = {
        id : Date.now() + 1,
        from : "bot",
        text : botText,
        showRedirect,
        redirectQuery : trimmed
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const botMsg = {
        id : Date.now() + 1,
        from : "bot",
        text : "Sorry, I'm having trouble connecting. Please try again later.",
        showRedirect : false
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      send(); 
    }
  };

  const handleRedirect = () => {
    if(onNavigate) onNavigate("discussion");
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
          {messages.map((msg) => (
            <div key={msg.id} className={`vins-chat-msg ${msg.from}`}>
              {msg.text}
              {msg.showRedirect && (
                <button
                  onClick={handleRedirect}
                  style = {{
                    display : "inline-block",
                    marginTop : "8px",
                    padding : "4px 12px",
                    background : "var(--vins-primary)",
                    color : "#fff",
                    border : "none",
                    borderRadius : "4px",
                    cursor : "pointer",
                    fontSize : "12px"
                  }}
                >
                  Post in Discussion →
                </button>
              )}
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
          <button 
            className="vins-btn vins-btn-primary" 
            onClick={send} 
            style={{ width: 38, padding: 0, justifyContent: "center" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
