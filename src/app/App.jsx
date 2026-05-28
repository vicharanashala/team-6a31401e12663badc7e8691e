import { useState } from "react";
import HomePage from "./HomePage";
//import DiscussionPage from "./DiscussionPage";
//import ProfilePage from "./ProfilePage";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app-container">
      {page === "home" && <HomePage onNavigate={setPage} />}
      {page === "discussion" && <DiscussionPage onNavigate={setPage} />}
      {page === "profile" && <ProfilePage onNavigate={setPage} />}
    </div>
  );
}
