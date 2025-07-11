import React from 'react';
import { renderToString } from 'react-dom/server';
import AppServer from './AppServer';

export function render(url: string) {
  const appHtml = renderToString(<AppServer url={url} />);
  return { appHtml };
}
