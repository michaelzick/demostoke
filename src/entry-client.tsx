
import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root')!;

// Hydrate when server rendered markup is present. In development the app is
// often served without SSR, leaving the container empty. Trying to hydrate an
// empty container triggers React's mismatch warning, so fall back to a normal
// client render in that case.
if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
} else {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
