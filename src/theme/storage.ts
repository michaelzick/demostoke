export const THEME_KEY = 'ui-theme';

export const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

export const safeSetCookie = (key: string, value: string) => {
  try {
    // set cookie for 1 year, path=/ so it's available to the IIFE
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    document.cookie = key + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/';
  } catch {
    // ignore
  }
};
