import { useContext } from 'react';
import { ThemeContext } from './context';

export const useTheme = () => {
  const ctx = useContext(ThemeContext as any);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx as { theme: 'light' | 'dark' | 'system'; setTheme: (t: any) => void };
};

export default useTheme;
