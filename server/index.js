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
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getBlogPostMeta(slug) {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, thumbnail, hero_image, author, slug, id, published_at')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      // Try by ID if slug doesn't work
      const { data: dataById, error: errorById } = await supabase
        .from('blog_posts')
        .select('title, excerpt, thumbnail, hero_image, author, slug, id, published_at')
        .eq('id', slug)
        .single();

      if (errorById || !dataById) return null;
      return {
        title: dataById.title,
        description: dataById.excerpt,
        image: dataById.thumbnail || dataById.hero_image || '',
        author: dataById.author,
        publishedAt: dataById.published_at
      };
    }

    return {
      title: data.title,
      description: data.excerpt,
      image: data.thumbnail || data.hero_image || '',
      author: data.author,
      publishedAt: data.published_at
    };
  } catch (e) {
    console.error('Error fetching blog meta', e);
    return null;
  }
}

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.amplitude.com https://api2.amplitude.com https://cdn.gpteng.co https://*.mapbox.com https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: http: https://*.mapbox.com;
      media-src 'self' https: http:;
      connect-src 'self' https://qtlhqsqanbxgfbcjigrl.supabase.co https://api2.amplitude.com https://sr-client-cfg.amplitude.com https://cdn.amplitude.com https://api-sr.amplitude.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com https://cdn.gpteng.co https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com;
      worker-src 'self' blob:;
      child-src 'self' blob: https://hcaptcha.com https://*.hcaptcha.com;
      frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com;
      frame-ancestors 'none';
    `.replace(/\s+/g, ' ').trim(),
  });
  next();
});

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

app.use(sirv(clientDist, { 
  extensions: [],
  maxAge: 31536000, // 1 year for static assets
  immutable: true,
}));

app.get('*', async (req, res) => {
  try {
    const template = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf-8');
    const { render } = await import(path.join(serverDist, 'entry-server.js'));
    const appHtml = await render(req.url);
    let html = template.replace(`<!--app-html-->`, appHtml);

    // Inject Open Graph and structured metadata for blog posts
    if (req.path.startsWith('/blog/')) {
      const slug = req.path.split('/blog/')[1];
      console.log('Processing blog post with slug:', slug);

      const meta = await getBlogPostMeta(slug);
      if (meta) {
        console.log('Found blog meta:', {
          title: meta.title,
          author: meta.author,
          image: meta.image,
          description: meta.description?.substring(0, 100) + '...'
        });

        // Use HTTPS and ensure proper URL construction
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
        const host = req.get('host');
        const ogUrl = `${protocol}://${host}${req.originalUrl}`;

        // Escape quotes and special characters in content
        const escapeContent = (str) => str ? str.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';

        const escapedTitle = escapeContent(meta.title);
        const escapedDescription = escapeContent(meta.description);
        const escapedAuthor = escapeContent(meta.author);
        const escapedImage = escapeContent(meta.image);

        console.log('Image being used for meta tags:', escapedImage);

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: meta.title,
          description: meta.description,
          image: meta.image,
          datePublished: meta.publishedAt,
          author: { '@type': 'Person', name: meta.author },
          url: ogUrl
        };

        console.log('Using author for replacements:', meta.author);

        // More robust replacement with better regex patterns
        html = html
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle} | DemoStoke</title>`)
          .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
          .replace(/<meta\s+name="author"\s+content="[^"]*"\s*\/?>/i, `<meta name="author" content="${escapedAuthor}" />`)
          .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle} | DemoStoke" />`)
          .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="article" />`)
          .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapedImage}" />`)
          .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${ogUrl}" />`)
          .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapedTitle} | DemoStoke" />`)
          .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escapedImage}" />`)
          .replace(/<script\s+id="structured-data"[^>]*>.*?<\/script>/i, '') // Remove existing structured data
          .replace('</head>', `<script id="structured-data" type="application/ld+json">${JSON.stringify(schema)}</script></head>`);

        console.log('Replaced meta tags for blog post. Author used:', escapedAuthor);

        // Verify the replacement worked by checking if the author is in the HTML
        if (html.includes(`content="${escapedAuthor}"`)) {
          console.log('✅ Author replacement successful');
        } else {
          console.log('❌ Author replacement failed');
        }
      } else {
        console.log('No meta found for slug:', slug);
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
