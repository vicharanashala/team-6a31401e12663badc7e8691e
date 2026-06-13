/**
 * CUSTOM HOOK - MANAGES THE APPLICATION'S THEME 
 * 
 * How it works:
 * 1. Reads the user's saved theme preference from localStorage on initial load.
 * 2. Defaults to dark mode if no preference is saved.
 * 3. Applies/removes the "dark" class on the `<html>` element whenever the theme changes.
 * 4. Persists the user's choice in localStorage for future visits.
 * 5. Provides a `toggleTheme` function to switch between light and dark modes.
 */

import { useState, useEffect } from "react";

export function useTheme() {
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem("theme");
        if(saved) {
            return saved === "dark";
        }
        return true;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    const toggleTheme = () => setDark((prev) => !prev);
    return { dark, toggleTheme };
}