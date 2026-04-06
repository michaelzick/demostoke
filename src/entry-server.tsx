
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { SsrPageData } from './contexts/SsrPageDataContext';

export function render(url: string, initialSsrPageData: SsrPageData = {}) {
  return renderToString(
    <StaticRouter location={url}>
      <App initialSsrPageData={initialSsrPageData} />
    </StaticRouter>
  );
}
