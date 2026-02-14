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

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.warn('Supabase client init failed. Server metadata enrichment is disabled.', error);
  }
} else {
  console.warn('Supabase env vars are missing. Server metadata enrichment is disabled.');
}

const escapeContent = (str) =>
  str
    ? String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    : '';

const slugify = (value) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeToken = (value) =>
  (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const hasSizeInName = (name, size) => {
  const normalizedName = normalizeToken(name);
  const normalizedSize = normalizeToken(size);
  return normalizedSize.length > 0 && normalizedName.includes(normalizedSize);
};

const buildGearDisplayName = (name, size) => {
  const trimmedName = (name || '').trim();
  const trimmedSize = (size || '').trim();
  if (!trimmedSize || hasSizeInName(trimmedName, trimmedSize)) {
    return trimmedName;
  }
  return `${trimmedName} ${trimmedSize}`;
};

const buildGearSlug = ({ id, name, size }) =>
  `${slugify(buildGearDisplayName(name, size))}--${id}`;

const toISODate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const extractGearIdFromSlug = (gearSlug) => {
  if (!gearSlug) return null;

  const delimiterIndex = gearSlug.lastIndexOf('--');
  if (delimiterIndex > -1) {
    const idPart = gearSlug.slice(delimiterIndex + 2).trim();
    return idPart || null;
  }

  const uuidMatch = gearSlug.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
  );
  if (uuidMatch?.[1]) return uuidMatch[1];

  const lastDashIndex = gearSlug.lastIndexOf('-');
  if (lastDashIndex === -1) return null;
  const fallbackId = gearSlug.slice(lastDashIndex + 1).trim();
  return fallbackId || null;
};

async function getBlogPostMeta(slug) {
  if (!supabase) {
    return null;
  }

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

async function getGearPageMeta(gearSlug, protocol, host) {
  if (!supabase) {
    return null;
  }

  const gearId = extractGearIdFromSlug(gearSlug);
  if (!gearId) {
    return null;
  }

  try {
    const { data: gear, error: gearError } = await supabase
      .from('equipment')
      .select(
        `
        id,
        name,
        category,
        description,
        size,
        status,
        price_per_day,
        price_per_hour,
        price_per_week,
        location_address,
        updated_at,
        created_at,
        user_id,
        review_count,
        rating
      `,
      )
      .eq('id', gearId)
      .single();

    if (gearError || !gear) {
      return null;
    }

    const { data: images } = await supabase
      .from('equipment_images')
      .select('image_url, is_primary, display_order')
      .eq('equipment_id', gear.id)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });

    const imageUrls = (images || [])
      .map((item) => item.image_url)
      .filter(Boolean);
    const displayName = buildGearDisplayName(gear.name, gear.size);
    const lastVerified = toISODate(gear.updated_at || gear.created_at);
    const canonicalPath = `/gear/${buildGearSlug({
      id: gear.id,
      name: gear.name,
      size: gear.size,
    })}`;
    const canonicalUrl = `${protocol}://${host}${canonicalPath}`;
    const locationText = gear.location_address || 'United States';
    const summaryText = `${displayName} is available in ${locationText}. Last verified ${lastVerified}.`;
    const descriptionText =
      `${summaryText} ${gear.description || ''}`.trim().slice(0, 350);

    const offers = [];
    const baseOffer = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability:
        gear.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      availabilityStarts: lastVerified,
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      url: canonicalUrl,
    };

    if (Number(gear.price_per_hour) > 0) {
      offers.push({
        ...baseOffer,
        name: 'Hourly rental',
        price: String(Number(gear.price_per_hour)),
      });
    }

    if (Number(gear.price_per_day) > 0) {
      offers.push({
        ...baseOffer,
        name: 'Daily rental',
        price: String(Number(gear.price_per_day)),
      });
    }

    if (Number(gear.price_per_week) > 0) {
      offers.push({
        ...baseOffer,
        name: 'Weekly rental',
        price: String(Number(gear.price_per_week)),
      });
    }

    const offerPrices = offers.map((offer) => Number(offer.price));
    const offerSchema =
      offers.length > 1
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: String(Math.min(...offerPrices)),
            highPrice: String(Math.max(...offerPrices)),
            offerCount: String(offers.length),
            offers,
          }
        : offers[0];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: displayName,
      description: summaryText,
      image: imageUrls,
      url: canonicalUrl,
      category: gear.category,
      offers: offerSchema,
      aggregateRating:
        Number(gear.review_count) > 0 && Number(gear.rating) > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: Number(gear.rating),
              reviewCount: Number(gear.review_count),
            }
          : undefined,
    };

    const noscriptSummary = [
      '<noscript><section id="gear-crawl-summary" style="padding:16px;max-width:720px;margin:0 auto;">',
      `<h1>${escapeContent(displayName)}</h1>`,
      `<p>${escapeContent(summaryText)}</p>`,
      `<p>${escapeContent(descriptionText)}</p>`,
      `<p>Canonical: <a href="${escapeContent(canonicalUrl)}">${escapeContent(canonicalUrl)}</a></p>`,
      '</section></noscript>',
    ].join('');

    return {
      title: `${displayName} | DemoStoke Gear`,
      description: descriptionText,
      image: imageUrls[0] || '',
      canonicalUrl,
      schema,
      noscriptSummary,
    };
  } catch (error) {
    console.error('Error fetching gear meta', error);
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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.amplitude.com https://api2.amplitude.com https://*.amplitude.com https://cdn.gpteng.co https://*.mapbox.com https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.amplitude.com;
      font-src 'self' https://fonts.gstatic.com https://*.amplitude.com;
      img-src 'self' data: https: http: https://*.mapbox.com https://*.amplitude.com;
      media-src 'self' https: http:;
      connect-src 'self' https://qtlhqsqanbxgfbcjigrl.supabase.co https://api2.amplitude.com https://sr-client-cfg.amplitude.com https://cdn.amplitude.com https://api-sr.amplitude.com https://*.amplitude.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com https://cdn.gpteng.co https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com;
      worker-src 'self' blob:;
      child-src 'self' blob: https://hcaptcha.com https://*.hcaptcha.com https://www.youtube.com;
      frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://www.youtube.com;
      frame-ancestors 'none';
    `.replace(/\s+/g, ' ').trim(),
  });
  next();
});

// Redirect non-www to www subdomain
app.use((req, res, next) => {
  const host = req.get('host');

  // Check if the host is exactly 'demostoke.com' (without www)
  if (host === 'demostoke.com') {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const redirectUrl = `${protocol}://www.demostoke.com${req.originalUrl}`;

    // 301 permanent redirect to signal this is the canonical URL
    return res.redirect(301, redirectUrl);
  }

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
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    const ogUrl = `${protocol}://${host}${req.originalUrl}`;

    const upsertCanonical = (inputHtml, canonicalUrl) => {
      const canonicalTag = `<link rel="canonical" href="${escapeContent(canonicalUrl)}" />`;
      if (/<link\s+rel=["']canonical["'][^>]*>/i.test(inputHtml)) {
        return inputHtml.replace(
          /<link\s+rel=["']canonical["'][^>]*>/i,
          canonicalTag,
        );
      }
      return inputHtml.replace('</head>', `${canonicalTag}</head>`);
    };

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
          .replace(/<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedTitle} | DemoStoke" />`)
          .replace(/<meta\s+(?:name|property)="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${escapedImage}" />`)
          .replace(/<script\s+id="structured-data"[^>]*>.*?<\/script>/i, '') // Remove existing structured data
          .replace('</head>', `<script id="structured-data" type="application/ld+json">${JSON.stringify(schema)}</script></head>`);
        html = upsertCanonical(html, ogUrl);

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

    if (req.path.startsWith('/gear/')) {
      const gearSlug = req.path.split('/gear/')[1];
      const meta = await getGearPageMeta(gearSlug, protocol, host);

      if (meta) {
        const escapedTitle = escapeContent(meta.title);
        const escapedDescription = escapeContent(meta.description);
        const escapedImage = escapeContent(meta.image);

        html = html
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle}</title>`)
          .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="product" />`)
          .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapedImage}" />`)
          .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeContent(meta.canonicalUrl)}" />`)
          .replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${escapedImage}" />`)
          .replace(/<script\s+id="structured-data"[^>]*>.*?<\/script>/i, '')
          .replace('</head>', `<script id="structured-data" type="application/ld+json">${JSON.stringify(meta.schema)}</script></head>`)
          .replace('<div id="root">', `${meta.noscriptSummary}<div id="root">`);

        html = upsertCanonical(html, meta.canonicalUrl);
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
