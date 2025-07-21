
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage only on client side
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", isDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, [theme, mounted]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", t);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
