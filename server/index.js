import fs from 'node:fs';
import path from 'node:path';
import sirv from 'sirv';
import { createApp } from './app.js';

const clientDist = path.join(path.dirname(new URL(import.meta.url).pathname), '../dist/client');
let cachedTemplate;
export const app = createApp({
  getTemplate: () => (cachedTemplate ??= fs.readFileSync(path.join(clientDist, 'index.html'), 'utf8')),
  loadRenderer: () => import('../dist/server/entry-server.js'),
  staticMiddleware: sirv(clientDist, { extensions: [], maxAge: 31536000, immutable: true }),
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}
