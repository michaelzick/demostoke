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

const STATIC_ROUTE_META = {
  '/': {
    title: 'DemoStoke | Demo & Rent Surfboards, Snowboards, Skis & Mountain Bikes',
    description: 'DemoStoke is the go-to marketplace to demo, rent, and try action sports gear from local shops and riders. Surfboards, snowboards, skis, and mountain bikes — find the right board, try it in real conditions, and buy what you love.',
    type: 'website',
  },
  '/about': {
    title: 'About DemoStoke | The Action Sports Gear Demo Marketplace',
    description: 'DemoStoke connects riders with local shops, indie shapers, and gear owners for surfboard, snowboard, ski, and mountain bike demos and rentals. Built by riders, for riders.',
    type: 'website',
  },
  '/explore': {
    title: 'Explore Gear | Surfboards, Snowboards, Skis & Bikes Near You | DemoStoke',
    description: 'Browse available surfboards, snowboards, skis, and mountain bikes for demo and rental near you. Filter by sport, location, skill level, and price.',
    type: 'website',
  },
  '/how-it-works': {
    title: 'How DemoStoke Works | Try Before You Buy Gear Rentals',
    description: 'Browse gear on the DemoStoke map, connect with local shops or owners, try the gear in real conditions, and buy what you love. No lines, no outdated rentals.',
    type: 'website',
  },
  '/blog': {
    title: 'DemoStoke Blog | Gear Reviews, Surf Culture & Action Sports',
    description: 'Gear reviews, surf and snow culture, demo day calendars, and rider stories from the DemoStoke community.',
    type: 'website',
  },
  '/contact-us': {
    title: 'Contact DemoStoke | Get in Touch',
    description: 'Have questions about DemoStoke? Want to list your shop or gear? Reach out to the DemoStoke team.',
    type: 'website',
  },
  '/list-your-gear': {
    title: 'List Your Gear or Shop on DemoStoke | Partner With Us',
    description: 'List your surf shop, ski rental, or personal gear on DemoStoke. Get discovered by riders looking for demos and rentals in your area. Free to start.',
    type: 'website',
  },
  '/search': {
    title: 'Search Gear | DemoStoke',
    description: 'Search for surfboards, snowboards, skis, and mountain bikes available for demo and rental on DemoStoke.',
    type: 'website',
  },
  '/gear': {
    title: 'Gear Index | DemoStoke',
    description: 'DemoStoke indexes real-world rental, demo, and used action sports gear with model details, location context, and freshness timestamps.',
    type: 'website',
  },
  '/gear/surfboards': {
    title: 'Surfboard Demos & Rentals | DemoStoke',
    description: 'Browse surfboards available for demo and rental from local surf shops and riders. Shortboards, longboards, fish, mid-lengths, and more.',
    type: 'website',
  },
  '/gear/used-skis': {
    title: 'Used Ski Rentals & Demos | DemoStoke',
    description: 'Browse used skis available for rental and demo with current availability, location, and pricing.',
    type: 'website',
  },
  '/demo-calendar': {
    title: 'Demo Day Calendar | Upcoming Gear Demo Events | DemoStoke',
    description: 'Find upcoming surfboard, snowboard, and ski demo days near you. Try new gear from top brands at local shops and events.',
    type: 'website',
  },
  '/gear-quiz': {
    title: 'Gear Quiz | Find Your Perfect Board | DemoStoke',
    description: 'Answer a few questions about your riding style, skill level, and conditions to get personalized gear recommendations from DemoStoke.',
    type: 'website',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | DemoStoke',
    description: 'DemoStoke privacy policy. How we collect, use, and protect your data.',
    type: 'website',
  },
  '/terms-of-service': {
    title: 'Terms of Service | DemoStoke',
    description: 'DemoStoke terms of service for riders, gear owners, and shop partners.',
    type: 'website',
  },
};

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

app.get('/sitemap.xml', async (req, res) => {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('host') || 'www.demostoke.com';
  const baseUrl = `${protocol}://${host}`;

  // Public static routes only — no auth-gated pages
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/explore', priority: '0.9', changefreq: 'daily' },
    { path: '/gear', priority: '0.8', changefreq: 'daily' },
    { path: '/gear/surfboards', priority: '0.8', changefreq: 'daily' },
    { path: '/gear/used-skis', priority: '0.8', changefreq: 'daily' },
    { path: '/blog', priority: '0.7', changefreq: 'daily' },
    { path: '/demo-calendar', priority: '0.7', changefreq: 'weekly' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
    { path: '/how-it-works', priority: '0.5', changefreq: 'monthly' },
    { path: '/list-your-gear', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact-us', priority: '0.4', changefreq: 'monthly' },
    { path: '/search', priority: '0.6', changefreq: 'daily' },
    { path: '/gear-quiz', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
    { path: '/terms-of-service', priority: '0.2', changefreq: 'yearly' },
  ];

  let blogUrls = [];
  let equipmentUrls = [];
  let eventUrls = [];

  if (supabase) {
    try {
      const [blogRes, equipRes, eventRes] = await Promise.all([
        supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
        supabase.from('equipment').select('id, name, size, updated_at'),
        supabase.from('demo_calendar').select('title, event_date, event_time, updated_at'),
      ]);

      if (blogRes.data) {
        blogUrls = blogRes.data.map(post => ({
          path: `/blog/${post.slug}`,
          lastmod: post.updated_at ? new Date(post.updated_at).toISOString().slice(0, 10) : null,
          priority: '0.6',
          changefreq: 'monthly',
        }));
      }

      if (equipRes.data) {
        equipmentUrls = equipRes.data.map(item => ({
          path: `/gear/${buildGearSlug({ id: item.id, name: item.name, size: item.size })}`,
          lastmod: item.updated_at ? new Date(item.updated_at).toISOString().slice(0, 10) : null,
          priority: '0.7',
          changefreq: 'weekly',
        }));
      }

      if (eventRes.data) {
        const { format } = await import('date-fns');
        eventUrls = eventRes.data.map(ev => {
          const titlePart = slugify(ev.title);
          const datePart = ev.event_date ? format(new Date(ev.event_date + 'T00:00:00'), 'MM-dd-yyyy') : 'tbd';
          const timePart = ev.event_time ? ev.event_time.replace(':', '') : 'tbd';
          return {
            path: `/demo-calendar/event/${titlePart}-${datePart}-${timePart}`,
            lastmod: ev.updated_at ? new Date(ev.updated_at).toISOString().slice(0, 10) : null,
            priority: '0.5',
            changefreq: 'weekly',
          };
        });
      }
    } catch (err) {
      console.error('Error generating dynamic sitemap:', err);
    }
  }

  const allUrls = [
    ...staticRoutes,
    ...blogUrls,
    ...equipmentUrls,
    ...eventUrls,
  ];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const url of allUrls) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${baseUrl}${url.path}</loc>`);
    if (url.lastmod) {
      xmlLines.push(`    <lastmod>${url.lastmod}</lastmod>`);
    }
    if (url.changefreq) {
      xmlLines.push(`    <changefreq>${url.changefreq}</changefreq>`);
    }
    if (url.priority) {
      xmlLines.push(`    <priority>${url.priority}</priority>`);
    }
    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(xmlLines.join('\n'));
});

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

    // Static route meta injection
    const staticMeta = STATIC_ROUTE_META[req.path];
    if (staticMeta) {
      const escapedTitle = escapeContent(staticMeta.title);
      const escapedDescription = escapeContent(staticMeta.description);

      html = html
        .replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle}</title>`)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
        .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
        .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
        .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${staticMeta.type || 'website'}" />`)
        .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${ogUrl}" />`)
        .replace(/<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedTitle}" />`)
        .replace(/<meta\s+(?:name|property)="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapedDescription}" />`);
      html = upsertCanonical(html, ogUrl);
    }

    if (req.path === '/') {
      const siteSchema = JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "DemoStoke",
          "url": "https://www.demostoke.com",
          "logo": "https://www.demostoke.com/img/demostoke-square-transparent.webp",
          "description": "DemoStoke is an action sports gear marketplace where riders demo, rent, and try surfboards, snowboards, skis, and mountain bikes from local shops and other riders.",
          "foundingDate": "2024",
          "sameAs": []
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DemoStoke",
          "url": "https://www.demostoke.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.demostoke.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }
      ]);
      html = html
        .replace(/<script\s+id="structured-data"[^>]*>.*?<\/script>/i, '')
        .replace('</head>', `<script id="structured-data" type="application/ld+json">${siteSchema}</script></head>`);
        
      const homepageNoscript = `<noscript><section id="homepage-crawl-summary" style="padding:16px;max-width:720px;margin:0 auto;">
        <h1>DemoStoke — Demo & Rent Action Sports Gear</h1>
        <p>DemoStoke is the go-to marketplace to demo, rent, and try surfboards, snowboards, skis, and mountain bikes from local shops and riders. Try before you buy.</p>
        <h2>How It Works</h2>
        <p>Browse available gear by sport and location. Connect with the shop or owner. Try the gear in real conditions. Buy what you love.</p>
        <h2>Gear Categories</h2>
        <ul>
          <li><a href="/gear/surfboards">Surfboards</a> — shortboards, longboards, fish, mid-lengths</li>
          <li><a href="/gear/used-skis">Skis</a> — all-mountain, powder, park, touring</li>
          <li><a href="/explore?category=snowboards">Snowboards</a> — all-mountain, freestyle, powder</li>
          <li><a href="/explore?category=bikes">Mountain Bikes</a> — trail, enduro, downhill</li>
        </ul>
        <h2>For Shops</h2>
        <p><a href="/list-your-gear">List your shop on DemoStoke</a> — free to start, commission-based.</p>
      </section></noscript>`;
      html = html.replace('<div id="root">', `${homepageNoscript}<div id="root">`);
    }

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

        const schema = [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: meta.title,
            description: meta.description,
            image: meta.image,
            datePublished: meta.publishedAt,
            author: { '@type': 'Person', name: meta.author },
            publisher: {
              '@type': 'Organization',
              name: 'DemoStoke',
              logo: { '@type': 'ImageObject', url: 'https://www.demostoke.com/img/demostoke-square-transparent.webp' }
            },
            url: ogUrl
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${protocol}://${host}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${protocol}://${host}/blog` },
              { '@type': 'ListItem', position: 3, name: meta.title, item: ogUrl },
            ]
          }
        ];

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
