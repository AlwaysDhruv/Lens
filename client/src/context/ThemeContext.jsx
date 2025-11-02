import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const VALID = ["light", "dark"];

export const ThemeProvider = ({ children }) => {
  const initial = (() => {
    try {
      const t = localStorage.getItem("theme");
      return VALID.includes(t) ? t : "dark";
    } catch {
      return "dark";
    }
  })();

  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    // remove any prior theme classes we control, then add the current one
    document.body.classList.remove(...VALID);
    document.body.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore storage errors (e.g. privacy mode)
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
