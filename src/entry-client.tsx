
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const initialSsrPageData = window.__SSR_PAGE_DATA__ || {};

hydrateRoot(document.getElementById('root')!,
  <BrowserRouter>
    <App initialSsrPageData={initialSsrPageData} />
  </BrowserRouter>
);
