import { useState, useEffect, useRef } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DiscussionPage from "./pages/DiscussionPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { useTheme } from "./hooks/useTheme";

// PAGES THAT REQUIRE AUTHENTICATION
const PROTECTED_PAGES = ["discussion", "profile", "admin"];

// FUNTION THAT RESOLVE WHICH PAGE TO NAVIGATE AFTER SUCCESSFUL LOGIN
function resolvePostLoginPage(page) {
  return PROTECTED_PAGES.includes(page) ? page : "home";
}

export default function App() {

  // STATE MANAGEMENT
  const [page, setPage] = useState("home"); // CURRENT PAGE IDENTIFIER
  const [user, setUser] = useState(null); // AUTHENTICATED USER OBJECT
  const [loginIntent, setLoginIntent] = useState(false); // FLAG TO SHOW THE AUTH PAGE
  const authTargetRef = useRef("home"); // REFERENCE TO STORE PAGE USER WANTED TO VISIT
  const { dark, toggleTheme } = useTheme(); // THEME MANAGEMENT

  // CHECK LOCAL STORAGE FOR SAVED USER SESSION
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

  // IF USER IS ON ADMIN PAGE BUT USER ROLE IS NOT ADMIN, REDIRECT TO HOME PAGE
  useEffect(() => {
    if (page === "admin" && user && user.role !== "admin") {
      setPage("home");
    }
  }, [page, user]);

  // DETERMINE WHETHER TO SHOW AUTH PAGE OR NOT
  const showAuth = !user && (PROTECTED_PAGES.includes(page) || loginIntent);

  // CALLED BY AUTH PAGE WHEN LOGIN IS SUCCESSFUL
  const completeLogin = (userData) => {
    const destination = authTargetRef.current;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setLoginIntent(false);
    setPage(destination);
    authTargetRef.current = "home";
  };

  // LOGOUT THE CURRENT USER
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setLoginIntent(false);
    authTargetRef.current = "home";
    setPage("home");
  };

  // NAVIGATE TO A NEW PAGE
  const handleNavigate = (nextPage) => {
    setLoginIntent(false);
    authTargetRef.current = resolvePostLoginPage(nextPage);
    setPage(nextPage);
  };

  // CALLED WHEN A USER CLICKS LOGIN BUTTON
  const handleRequestLogin = () => {
    authTargetRef.current = "home";
    setLoginIntent(true);
  };

  // SPECIAL CALL BY AUTH PAGE 
  const handleAuthNavigate = (nextPage) => {
    setLoginIntent(false);
    authTargetRef.current = "home";
    setPage(nextPage);
  };

  const themeProps = { dark, onToggleTheme: toggleTheme };

  // RENDER DOM

  // IF AUTHENTICATION IS REQUIRED, SHOW AUTH PAGE
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

  // OTHERWISE SHOW THE ACTUAL PAGE CONTENT
  return (
    <div className="app-root">
      <div key={page} className="page-enter">
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
    </div>
  );
}
