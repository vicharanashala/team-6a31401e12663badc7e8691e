import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authAPI } from "../services/api";
import "../styles/AuthPage.css";

export default function AuthPage({ onNavigate, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login({ email, password });
      const { token, user} = result;
      localStorage.setItem("token", token);

      onLogin({
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role,
        avatar : user.avatar || user.name?.charAt(0)?.toUpperCase() || "?",
        handle : user.handle || `@${user.name.toLowerCase().replace(/\s/g, '_')}`
      });
    } catch (err) {
      setError(err.message || "Login Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    
    try {
      const result = await authAPI.register({ name, email, password });
      const { token, user } = result;
      localStorage.setItem("token", token);

      const handle = user.handle || `@${name.trim().toLowerCase().replace(/\s+/g, "_")}`;
      const avatar = user.avatar || name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

      onLogin({
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role || "user",
        avatar,
        handle
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  }

  return (
    <div className="auth-page">
      {/* Header */}
      <header className="auth-page__header">
        <div className="auth-page__header-container">
          <button
            onClick={() => onNavigate("home")}
            className="auth-page__back-btn"
          >
            <ArrowLeft className="auth-page__back-icon" />
          </button>
          <span className="auth-page__logo">
            VINS<span className="auth-page__logo-highlight"> FAQ SERVER</span>
          </span>
        </div>
      </header>

      {/* Form container */}
      <div className="auth-page__main">
        <div className="auth-page__form-container">
          {/* Mode toggle */}
          <div className="auth-page__mode-toggle">
            <button
              onClick={() => switchMode("login")}
              className={`auth-page__mode-btn ${mode === "login" ? "auth-page__mode-btn--active" : ""}`}
            >
              Login
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`auth-page__mode-btn ${mode === "register" ? "auth-page__mode-btn--active" : ""}`}
            >
              Register
            </button>
          </div>

          <div className="auth-page__heading">
            <p className="auth-page__heading-badge">
              {mode === "login" ? "Welcome back" : "Create account"}
            </p>
            <h1 className="auth-page__heading-title">
              {mode === "login" ? "Sign in to continue" : "Join the community"}
            </h1>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="auth-page__form"
          >
            {mode === "register" && (
              <div className="auth-page__field">
                <label className="auth-page__label">FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Aashu Goswami"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-page__input"
                />
              </div>
            )}

            <div className="auth-page__field">
              <label className="auth-page__label">EMAIL</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-page__input"
              />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">PASSWORD</label>
              <div className="auth-page__password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-page__input auth-page__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="auth-page__password-toggle"
                >
                  {showPassword ? <EyeOff className="auth-page__password-icon" /> : <Eye className="auth-page__password-icon" />}
                </button>
              </div>
            </div>

            {error && (<p className="auth-page__error">{error}</p>)}

            <button
              type="submit"
              className="auth-page__submit-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <p className="auth-page__demo-note">
              Use the demo credentials from your backend or register a new account.
            </p>
          )}

          <p className="auth-page__switch-mode">
            {mode === "login" ? "No account? " : "Already have one? "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="auth-page__switch-link"
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}