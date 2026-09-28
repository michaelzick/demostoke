import { createServer } from 'node:http';
import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app.js';
import template from '../dist/client/index.html';
import { render } from '../dist/server/entry-server.js';

// Both hosts use the same routes, SEO policy, headers, and visibility checks.
const app = createApp({
  getTemplate: () => template,
  loadRenderer: async () => ({ render }),
  compress: false, // Cloudflare negotiates response compression at the edge.
});
const server = createServer(app);
server.listen(8080);
export default httpServerHandler({ port: 8080 });
