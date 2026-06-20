import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ dark, onToggle, className = "theme-toggle" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="theme-toggle__icon" /> : <Moon className="theme-toggle__icon" />}
    </button>
  );
}
