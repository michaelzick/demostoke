
/**
 * Utility functions for safe server-side rendering operations
 */

/**
 * Safely access localStorage with SSR support
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }
};

/**
 * Check if code is running in browser environment
 */
export const isBrowser = () => typeof window !== "undefined";

/**
 * Safely access window object
 */
export const safeWindow = () => {
  if (typeof window === "undefined") return null;
  return window;
};
