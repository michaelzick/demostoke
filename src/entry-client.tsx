
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const initialSsrPageData = window.__SSR_PAGE_DATA__ || {};
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element');
}

const app = (
  <BrowserRouter>
    <App initialSsrPageData={initialSsrPageData} />
  </BrowserRouter>
);

// Vite dev serves index.html without SSR markup, so hydrate only when the server
// actually injected an element tree into #root.
if (rootElement.firstElementChild) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
