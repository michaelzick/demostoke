import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const clientDist = path.join(__dirname, '../dist/client');
const serverDist = path.join(__dirname, '../dist/server');

// Supabase client for fetching blog metadata on the server
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qtlhqsqanbxgfbcjigrl.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0bGhxc3FhbmJ4Z2ZiY2ppZ3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODg2MzUsImV4cCI6MjA2MTg2NDYzNX0.wTjmLkZPG2xo3eqwBo1jnLWsXxNmil_1-u_7ojTDY2g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getBlogPostMeta(slug) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, thumbnail, hero_image, author, slug, id')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (error || !data) return null;

    return {
      title: data.title,
      description: data.excerpt,
      image: data.thumbnail || data.hero_image || '',
      author: data.author
    };
  } catch (e) {
    console.error('Error fetching blog meta', e);
    return null;
  }
}

const app = express();
app.use(compression());
app.use(sirv(clientDist, { extensions: [] }));

app.get('*', async (req, res) => {
  try {
    const template = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8');
    const { render } = await import(path.join(serverDist, 'entry-server.js'));
    const appHtml = await render(req.url);
    let html = template.replace(`<!--app-html-->`, appHtml);

    // Inject Open Graph metadata for blog posts
    if (req.path.startsWith('/blog/')) {
      const slug = req.path.split('/blog/')[1];
      const meta = await getBlogPostMeta(slug);
      if (meta) {
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${meta.title} | DemoStoke<\/title>`)
          .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}" />`)
          .replace(/<meta name="author"[^>]*>/, `<meta name="author" content="${meta.author}" />`)
          .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${meta.title} | DemoStoke" />`)
          .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${meta.description}" />`)
          .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${meta.image}" />`)
          .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${meta.image}" />`);
      }
    }

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
