
import React, { useEffect, useState } from "react";
import { ThemeContext, Theme } from './context';


const KEY = 'ui-theme';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const safeSetCookie = (key: string, value: string) => {
  try {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    document.cookie = key + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/';
  } catch {}
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("system");

  // Initialize theme from storage or cookie on first client render
  useEffect(() => {
    if (typeof window === "undefined") return;

    // try localStorage first
    let saved: string | null = null;
    try { saved = safeGet(KEY); } catch {}

    // fallback to cookie
    if (!saved) {
      try {
        const m = document.cookie.match('(?:^|; )' + KEY + '=([^;]*)');
        if (m) saved = decodeURIComponent(m[1]);
      } catch {}
    }

    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setThemeState(saved as Theme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;

    const apply = (t: Theme) => {
      try {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const themeToApply = t === 'system' ? (prefersDark ? 'dark' : 'light') : t;
        root.classList.remove('light', 'dark');
        root.classList.add(themeToApply);
        if (t === 'system') root.classList.add('system'); else root.classList.remove('system');
      } catch {}
    };

    apply(theme);

    if (theme === 'system' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => apply('system');
      try { mql.addEventListener('change', onChange); } catch { try { mql.addListener(onChange as any); } catch {} }
      return () => { try { mql.removeEventListener('change', onChange); } catch { try { mql.removeListener(onChange as any); } catch {} } };
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { safeSet(KEY, t); } catch {}
    try { safeSetCookie(KEY, t); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme is exported from a separate file for fast refresh compatibility
