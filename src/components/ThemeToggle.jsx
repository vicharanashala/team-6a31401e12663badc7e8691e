import { Sun, Moon } from "lucide-react";

/**
 * A BUTTON THAT SWITCHES BETWEEN LIGHT AND DARK THEMES.
 * 
 * How it works:
 * 1. Receives current theme state (`dark`) and toggle function from parent (App).
 * 2. Displays Sun icon when dark mode is active (clicking will switch to light).
 * 3. Displays Moon icon when light mode is active (clicking will switch to dark).
 * 4. Updates the `dark` class on the root element via the parent hook.
 */

export default function ThemeToggle({ dark, onToggle, className = "theme-toggle"}) {
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