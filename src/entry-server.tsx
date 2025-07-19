import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

// Ensure React Strict Mode is used on the server just like on the client.
// This keeps the component tree consistent between server and client renders,
// preventing hydration mismatches when hooks such as useId generate unique
// identifiers.

export function render(url: string) {
  return renderToString(
    <React.StrictMode>
      <App Router={StaticRouter} routerProps={{ location: url }} />
    </React.StrictMode>
  );
}
