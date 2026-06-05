import { useState } from "react";
import { NavBar } from "./components";
import FAQPage from "./pages/FAQPage";
import ResolveQsPage from "./pages/ResolveQsPage";
import ProfilePage from "./pages/ProfilePage";
export default function App() {
  const [page, setPage] = useState("faq");

  return (
    <div style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      minHeight: "100vh",
      background: "#fafaf8",
    }}>
      <NavBar page={page} setPage={setPage} />

      {page === "faq"     && <FAQPage setPage={setPage} />}
      {page === "resolve" && <ResolveQsPage />}
      {page === "profile" && <ProfilePage />}
    </div>
  );
}