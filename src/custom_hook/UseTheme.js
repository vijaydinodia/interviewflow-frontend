"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("interviewflow_theme");
    const initialTheme = savedTheme && ["dark", "light"].includes(savedTheme) ? savedTheme : "dark";
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const handleThemeUpdate = () => {
      const currentTheme = localStorage.getItem("interviewflow_theme") || "dark";
      setThemeState(currentTheme);
      document.documentElement.setAttribute("data-theme", currentTheme);
    };

    window.addEventListener("themeChange", handleThemeUpdate);
    window.addEventListener("storage", handleThemeUpdate);

    return () => {
      window.removeEventListener("themeChange", handleThemeUpdate);
      window.removeEventListener("storage", handleThemeUpdate);
    };
  }, []);

  const setTheme = (newTheme) => {
    if (["dark", "light"].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem("interviewflow_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      window.dispatchEvent(new Event("themeChange"));
    }
  };

  const toggleTheme = () => {
    const currentTheme = localStorage.getItem("interviewflow_theme") || theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

export default useTheme;
