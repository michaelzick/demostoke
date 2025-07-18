import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const clientDist = path.join(__dirname, '../dist/client');
const serverDist = path.join(__dirname, '../dist/server');

const app = express();
app.use(compression());
app.use(sirv(clientDist, { extensions: [] }));

app.get('*', async (req, res) => {
  try {
    const template = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8');
    const { render } = await import(path.join(serverDist, 'entry-server.js'));
    const appHtml = await render(req.url);
    const html = template.replace(`<!--app-html-->`, appHtml);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (err) {
    console.error(err);
    res.status(500).end('Internal Server Error');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
