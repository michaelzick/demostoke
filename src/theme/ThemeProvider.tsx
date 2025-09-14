import React, { useEffect, useMemo, useState } from 'react';
import { THEME_KEY, safeGet, safeSet } from './storage';
import { ThemeContext, ThemeMode } from './context';

const applyHtmlClasses = (mode: ThemeMode, prefersDark: boolean) => {
  const de = typeof document !== 'undefined' ? document.documentElement : null;
  if (!de) return;
  de.classList.remove('light', 'dark');
  const theme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  de.classList.add(theme);
  if (mode === 'system') de.classList.add('system'); else de.classList.remove('system');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const raw = safeGet(THEME_KEY) || 'system';
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
      return 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    // initial apply
    const prefersDark = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    applyHtmlClasses(theme, prefersDark);

    let mql: MediaQueryList | null = null;
    const handleChange = (ev: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyHtmlClasses('system', ev.matches);
      }
    };

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        mql.addEventListener ? mql.addEventListener('change', handleChange) : mql.addListener(handleChange as any);
      } catch {
        try { mql.addListener(handleChange as any); } catch {}
      }
    }

    return () => {
      if (mql) {
        try { mql.removeEventListener ? mql.removeEventListener('change', handleChange) : mql.removeListener(handleChange as any); } catch {}
      }
    };
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    safeSet(THEME_KEY, t);
    setThemeState(t);
    // apply immediately
    const prefersDark = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    applyHtmlClasses(t, prefersDark);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme is exported from a separate file to keep this module component-only for fast refresh
