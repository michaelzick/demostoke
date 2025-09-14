
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from '@/theme/ThemeProvider'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
