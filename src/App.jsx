import { useState, useEffect, useRef } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DiscussionPage from "./pages/DiscussionPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { useTheme } from "./hooks/useTheme";

const PROTECTED_PAGES = ["discussion", "profile", "admin"];

function resolvePostLoginPage(page) {
  return PROTECTED_PAGES.includes(page) ? page : "home";
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loginIntent, setLoginIntent] = useState(false);
  const authTargetRef = useRef("home");
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ role: "user", ...parsed });
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (page === "admin" && user && user.role !== "admin") {
      setPage("home");
    }
  }, [page, user]);

  const showAuth =
    !user && (PROTECTED_PAGES.includes(page) || loginIntent);

  const completeLogin = (userData) => {
    const destination = authTargetRef.current;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setLoginIntent(false);
    setPage(destination);
    authTargetRef.current = "home";
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setLoginIntent(false);
    authTargetRef.current = "home";
    setPage("home");
  };

  const handleNavigate = (nextPage) => {
    setLoginIntent(false);
    authTargetRef.current = resolvePostLoginPage(nextPage);
    setPage(nextPage);
  };

  const handleRequestLogin = () => {
    authTargetRef.current = "home";
    setLoginIntent(true);
  };

  const handleAuthNavigate = (nextPage) => {
    setLoginIntent(false);
    authTargetRef.current = "home";
    setPage(nextPage);
  };

  const themeProps = { dark, onToggleTheme: toggleTheme };

  if (showAuth) {
    return (
      <div className="app-root">
        <div key="auth" className="page-enter">
          <AuthPage
            onNavigate={handleAuthNavigate}
            onLogin={completeLogin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
        {page === "home" && (
          <HomePage
            onNavigate={handleNavigate}
            onRequestLogin={handleRequestLogin}
            user={user}
            {...themeProps}
          />
        )}
        {page === "discussion" && (
          <DiscussionPage onNavigate={handleNavigate} {...themeProps} />
        )}
        {page === "profile" && (
          <ProfilePage
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
            {...themeProps}
          />
        )}
        {page === "admin" && user?.role === "admin" && (
          <AdminPage
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
            {...themeProps}
          />
        )}
    </div>
  );
}
