import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  buildDemoEventDescription,
  buildDemoEventTitle,
  PUBLIC_ROUTE_META,
  buildBlogPostTitle,
  buildGearDetailTitle,
  buildUserProfileDescription,
  buildUserProfileTitle,
  humanizeSlug,
} from '../src/lib/seo/publicMetadata.js';
import {
  buildGearMetaDescription,
  buildGearProductSchema,
  buildGearSummaryText,
  buildLegacyGearNamePattern,
  parseLegacyGearRoute,
} from '../src/lib/seo/gearSeo.js';
import {
  SUPABASE_PUBLISHABLE_KEY as DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL as DEFAULT_SUPABASE_URL,
} from '../src/integrations/supabase/config.js';

const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const clientDist = path.join(__dirname, '../dist/client');
const serverDist = path.join(__dirname, '../dist/server');

// Supabase client for fetching blog metadata on the server
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_URL_SOURCE = process.env.VITE_SUPABASE_URL
  ? 'VITE_SUPABASE_URL'
  : DEFAULT_SUPABASE_URL
    ? 'default config'
    : 'missing';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_KEY_SOURCE = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
  : process.env.VITE_SUPABASE_ANON_KEY
    ? 'VITE_SUPABASE_ANON_KEY'
    : DEFAULT_SUPABASE_PUBLISHABLE_KEY
      ? 'default config'
      : 'missing';

let supabase = null;
if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    console.info(
      `Server metadata enrichment enabled. Supabase URL source: ${SUPABASE_URL_SOURCE}; key source: ${SUPABASE_KEY_SOURCE}.`,
    );
    if (SUPABASE_KEY_SOURCE === 'VITE_SUPABASE_ANON_KEY') {
      console.warn(
        'Server metadata enrichment is using VITE_SUPABASE_ANON_KEY. Prefer VITE_SUPABASE_PUBLISHABLE_KEY in production runtime config.',
      );
    }
  } catch (error) {
    console.warn('Supabase client init failed. Server metadata enrichment is disabled.', error);
  }
} else {
  console.warn(
    `Supabase config is incomplete. Server metadata enrichment is disabled. URL source: ${SUPABASE_URL_SOURCE}; key source: ${SUPABASE_KEY_SOURCE}.`,
  );
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

const buildDemoEventTimeSlug = (value) => (value ? String(value).replace(/[^0-9]/g, '') : 'tbd');
const buildLegacyDemoEventTimeSlug = (value) => (value ? String(value).replace(':', '') : 'tbd');

const generateDemoEventSlug = (event) => {
  const titlePart = slugify(event.title);
  const datePart = event.event_date
    ? new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
      .format(new Date(`${event.event_date}T00:00:00`))
      .replace(/\//g, '-')
    : 'tbd';
  const timePart = buildDemoEventTimeSlug(event.event_time);

  return `${titlePart}-${datePart}-${timePart}`;
};

const generateLegacyDemoEventSlug = (event) => {
  const titlePart = slugify(event.title);
  const datePart = event.event_date
    ? new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
      .format(new Date(`${event.event_date}T00:00:00`))
      .replace(/\//g, '-')
    : 'tbd';
  const timePart = buildLegacyDemoEventTimeSlug(event.event_time);

  return `${titlePart}-${datePart}-${timePart}`;
};

const buildDemoEventPath = (event) => `/demo-calendar/event/${generateDemoEventSlug(event)}`;

const buildDemoEventStartDate = (event) => {
  if (!event.event_date) {
    return undefined;
  }

  return event.event_time ? `${event.event_date}T${event.event_time}` : event.event_date;
};

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

const appendOriginalSearch = (baseUrl, originalUrl) => {
  const queryIndex = originalUrl.indexOf('?');
  if (queryIndex === -1) {
    return baseUrl;
  }
  return `${baseUrl}${originalUrl.slice(queryIndex)}`;
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

async function getUserProfileMeta(profileSlug, protocol, host) {
  if (!supabase || !profileSlug) {
    return null;
  }

  const canonicalUrl = `${protocol}://${host}/user-profile/${profileSlug}`;
  const pattern = `%${profileSlug.split('-').filter(Boolean).join('%')}%`;

  const fetchPublicProfileById = async (profileId) => {
    if (!profileId) return null;

    const { data, error } = await supabase
      .from('public_profiles')
      .select('id, name, about, address, website')
      .eq('id', profileId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching public profile by id for metadata', error);
      return null;
    }

    return data || null;
  };

  try {
    const { data: profileMatches, error: profileError } = await supabase
      .from('public_profiles')
      .select('id, name, about, address, website')
      .ilike('name', pattern)
      .limit(10);

    if (profileError) {
      console.error('Error fetching public profile metadata by slug', profileError);
    }

    const exactProfileMatch =
      profileMatches?.find((profile) => slugify(profile.name || '') === profileSlug) || null;

    let profile = exactProfileMatch;
    let resolvedName = exactProfileMatch?.name?.trim() || '';

    if (!profile) {
      const { data: exactMapping, error: exactMappingError } = await supabase
        .from('shop_gear_feed_mappings')
        .select('profile_id, shop_slug')
        .eq('provider', 'demostoke_widget')
        .eq('is_active', true)
        .eq('shop_slug', profileSlug)
        .limit(1)
        .maybeSingle();

      if (exactMappingError) {
        console.error('Error fetching exact shop metadata mapping', exactMappingError);
      }

      let mapping = exactMapping;

      if (!mapping) {
        const { data: prefixMapping, error: prefixMappingError } = await supabase
          .from('shop_gear_feed_mappings')
          .select('profile_id, shop_slug')
          .eq('provider', 'demostoke_widget')
          .eq('is_active', true)
          .like('shop_slug', `${profileSlug}-%`)
          .limit(1)
          .maybeSingle();

        if (prefixMappingError) {
          console.error('Error fetching prefix shop metadata mapping', prefixMappingError);
        }

        mapping = prefixMapping;
      }

      if (mapping?.profile_id) {
        profile = await fetchPublicProfileById(mapping.profile_id);
      }

      if (mapping?.shop_slug && !resolvedName) {
        resolvedName = humanizeSlug(mapping.shop_slug);
      }

      if (profile?.name?.trim()) {
        resolvedName = profile.name.trim();
      }
    }

    if (!profile) {
      const { data: syncedEquipment, error: syncedEquipmentError } = await supabase
        .from('equipment')
        .select('user_id')
        .eq('external_source_provider', 'demostoke_widget')
        .eq('external_source_shop_slug', profileSlug)
        .limit(1)
        .maybeSingle();

      if (syncedEquipmentError) {
        console.error('Error fetching synced equipment metadata fallback', syncedEquipmentError);
      }

      if (syncedEquipment?.user_id) {
        profile = await fetchPublicProfileById(syncedEquipment.user_id);
        if (profile?.name?.trim()) {
          resolvedName = profile.name.trim();
        }
      }
    }

    if (!resolvedName) {
      return null;
    }

    const detailSuffix = profile?.about || profile?.address || profile?.website || '';
    const description = buildUserProfileDescription(resolvedName, detailSuffix);

    return {
      title: buildUserProfileTitle(resolvedName),
      description,
      canonicalUrl,
    };
  } catch (error) {
    console.error('Error fetching user profile meta', error);
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
    const summaryText = buildGearSummaryText({
      displayName,
      locationText,
      lastVerified,
    });
    const descriptionText = buildGearMetaDescription({
      summaryText,
      rawDescription: gear.description,
    });
    const schema = buildGearProductSchema({
      canonicalUrl,
      category: gear.category,
      displayName,
      imageUrls,
      isAvailable: gear.status === 'available',
      lastVerified,
      pricePerHour: gear.price_per_hour,
      pricePerDay: gear.price_per_day,
      pricePerWeek: gear.price_per_week,
      rating: gear.rating,
      reviewCount: gear.review_count,
      summaryText,
    });

    const noscriptSummary = [
      '<noscript><section id="gear-crawl-summary" style="padding:16px;max-width:720px;margin:0 auto;">',
      `<h1>${escapeContent(displayName)}</h1>`,
      `<p>${escapeContent(summaryText)}</p>`,
      `<p>${escapeContent(descriptionText)}</p>`,
      `<p>Canonical: <a href="${escapeContent(canonicalUrl)}">${escapeContent(canonicalUrl)}</a></p>`,
      '</section></noscript>',
    ].join('');

    return {
      title: buildGearDetailTitle(displayName),
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

async function resolveLegacyGearCanonicalUrl(req, protocol, host) {
  if (!supabase) {
    return null;
  }

  const legacyRoute = parseLegacyGearRoute(req.path);
  if (!legacyRoute) {
    return null;
  }

  const namePattern = buildLegacyGearNamePattern(legacyRoute.slug);
  if (!namePattern) {
    return null;
  }

  try {
    const { data: rows, error } = await supabase
      .from('equipment')
      .select(
        `
        id,
        name,
        size,
        status,
        visible_on_map,
        profiles!equipment_user_id_fkey (
          name,
          is_hidden
        )
      `,
      )
      .eq('category', legacyRoute.category)
      .ilike('name', namePattern)
      .limit(25);

    if (error) {
      console.error('Error resolving legacy gear URL', error);
      return null;
    }

    const match = (rows || []).find((row) => {
      const ownerName = row.profiles?.name || '';
      const ownerMatches = slugify(ownerName) === legacyRoute.ownerSlug;
      return ownerMatches && row.status === 'available' && row.visible_on_map && row.profiles?.is_hidden !== true;
    });

    if (!match) {
      return null;
    }

    const canonicalPath = `/gear/${buildGearSlug({
      id: match.id,
      name: match.name,
      size: match.size,
    })}`;

    return appendOriginalSearch(`${protocol}://${host}${canonicalPath}`, req.originalUrl);
  } catch (error) {
    console.error('Error resolving legacy gear URL', error);
    return null;
  }
}

async function getDemoEventPageMeta(eventSlug, protocol, host) {
  if (!supabase || !eventSlug) {
    return null;
  }

  try {
    const { data: events, error } = await supabase
      .from('demo_calendar')
      .select(
        `
        id,
        title,
        gear_category,
        event_date,
        event_time,
        location,
        equipment_available,
        thumbnail_url,
        company,
        source_primary_url,
        updated_at
      `,
      )
      .order('event_date', { ascending: true, nullsFirst: false });

    if (error || !events) {
      return null;
    }

    const event = events.find((item) => {
      const canonicalSlug = generateDemoEventSlug(item);
      const legacySlug = generateLegacyDemoEventSlug(item);
      return canonicalSlug === eventSlug || legacySlug === eventSlug;
    });
    if (!event) {
      return null;
    }

    const canonicalPath = buildDemoEventPath(event);
    const canonicalUrl = `${protocol}://${host}${canonicalPath}`;
    const description = buildDemoEventDescription({
      title: event.title,
      company: event.company,
      gearCategory: event.gear_category,
      eventDate: event.event_date,
      eventTime: event.event_time,
      location: event.location,
      equipmentAvailable: event.equipment_available,
    });
    const schema = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${protocol}://${host}/` },
          { '@type': 'ListItem', position: 2, name: 'Demo Calendar', item: `${protocol}://${host}/demo-calendar` },
          { '@type': 'ListItem', position: 3, name: event.title, item: canonicalUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description,
        startDate: buildDemoEventStartDate(event),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: event.thumbnail_url || `${protocol}://${host}/img/demostoke-square-transparent.webp`,
        url: canonicalUrl,
        location: event.location
          ? {
            '@type': 'Place',
            name: event.location,
            address: event.location,
          }
          : undefined,
        organizer: event.company
          ? {
            '@type': 'Organization',
            name: event.company,
          }
          : undefined,
      },
    ];

    const summaryParts = [
      event.company ? `Hosted by ${event.company}.` : '',
      event.event_date ? `Date: ${event.event_date}.` : 'Date TBD.',
      event.event_time ? `Time: ${event.event_time}.` : 'Time TBD.',
      event.location ? `Location: ${event.location}.` : 'Location TBD.',
      event.equipment_available ? `Gear: ${event.equipment_available}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const noscriptSummary = [
      '<noscript><section id="demo-event-crawl-summary" style="padding:16px;max-width:720px;margin:0 auto;">',
      `<nav aria-label="Breadcrumb"><a href="${escapeContent(`${protocol}://${host}/`)}">Home</a> / <a href="${escapeContent(`${protocol}://${host}/demo-calendar`)}">Demo Calendar</a> / ${escapeContent(event.title)}</nav>`,
      `<h1>${escapeContent(event.title)}</h1>`,
      `<p>${escapeContent(description)}</p>`,
      summaryParts ? `<p>${escapeContent(summaryParts)}</p>` : '',
      event.source_primary_url
        ? `<p>Source: <a href="${escapeContent(event.source_primary_url)}">${escapeContent(event.source_primary_url)}</a></p>`
        : '',
      `<p>Canonical: <a href="${escapeContent(canonicalUrl)}">${escapeContent(canonicalUrl)}</a></p>`,
      '</section></noscript>',
    ].join('');

    return {
      title: buildDemoEventTitle(event.title),
      description,
      image: event.thumbnail_url || `${protocol}://${host}/img/demostoke-square-transparent.webp`,
      canonicalUrl,
      schema,
      noscriptSummary,
    };
  } catch (error) {
    console.error('Error fetching demo event meta', error);
    return null;
  }
}

const STATIC_ROUTE_META = PUBLIC_ROUTE_META;

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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.amplitude.com https://api2.amplitude.com https://*.amplitude.com https://cdn.gpteng.co https://*.mapbox.com https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com https://static.cloudflareinsights.com blob:;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.amplitude.com;
      font-src 'self' https://fonts.gstatic.com https://*.amplitude.com;
      img-src 'self' data: https: http: https://*.mapbox.com https://*.amplitude.com;
      media-src 'self' https: http:;
      connect-src 'self' https://qtlhqsqanbxgfbcjigrl.supabase.co https://api2.amplitude.com https://sr-client-cfg.amplitude.com https://cdn.amplitude.com https://api-sr.amplitude.com https://*.amplitude.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com https://cdn.gpteng.co https://hcaptcha.com https://*.hcaptcha.com https://js.hcaptcha.com https://cloudflareinsights.com;
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
        eventUrls = eventRes.data.map(ev => {
          return {
            path: buildDemoEventPath(ev),
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

app.get('/:category/:ownerSlug/:slug', async (req, res, next) => {
  try {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host') || 'www.demostoke.com';
    const canonicalUrl = await resolveLegacyGearCanonicalUrl(req, protocol, host);

    if (!canonicalUrl) {
      return next();
    }

    return res.redirect(301, canonicalUrl);
  } catch (error) {
    console.error('Error handling legacy gear redirect', error);
    return next();
  }
});

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
        const fullTitle = buildBlogPostTitle(meta.title);
        const escapedFullTitle = escapeContent(fullTitle);
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
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapedFullTitle}</title>`)
          .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
          .replace(/<meta\s+name="author"\s+content="[^"]*"\s*\/?>/i, `<meta name="author" content="${escapedAuthor}" />`)
          .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedFullTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="article" />`)
          .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapedImage}" />`)
          .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${ogUrl}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedFullTitle}" />`)
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

    if (req.path.startsWith('/demo-events/')) {
      const eventSlug = req.path.split('/demo-events/')[1];
      const meta = await getDemoEventPageMeta(eventSlug, protocol, host);

      if (meta) {
        const canonicalPathname = new URL(meta.canonicalUrl).pathname;
        if (req.path !== canonicalPathname) {
          return res.redirect(301, meta.canonicalUrl);
        }

        const escapedTitle = escapeContent(meta.title);
        const escapedDescription = escapeContent(meta.description);
        const escapedImage = escapeContent(meta.image);

        html = html
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle}</title>`)
          .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="website" />`)
          .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapedImage}" />`)
          .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeContent(meta.canonicalUrl)}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${escapedImage}" />`)
          .replace(/<script\s+id="structured-data"[^>]*>.*?<\/script>/i, '')
          .replace('</head>', `<script id="structured-data" type="application/ld+json">${JSON.stringify(meta.schema)}</script></head>`)
          .replace('<div id="root">', `${meta.noscriptSummary}<div id="root">`);

        html = upsertCanonical(html, meta.canonicalUrl);
      }
    }

    if (req.path.startsWith('/user-profile/')) {
      const profileSlug = req.path.split('/user-profile/')[1];
      const meta = await getUserProfileMeta(profileSlug, protocol, host);

      if (meta) {
        const escapedTitle = escapeContent(meta.title);
        const escapedDescription = escapeContent(meta.description);

        html = html
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle}</title>`)
          .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`)
          .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="profile" />`)
          .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapeContent(meta.canonicalUrl)}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapedTitle}" />`)
          .replace(/<meta\s+(?:name|property)="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapedDescription}" />`);

        html = upsertCanonical(html, meta.canonicalUrl);
      }
    }

    if (req.path.startsWith('/gear/')) {
      const gearSlug = req.path.split('/gear/')[1];
      const meta = await getGearPageMeta(gearSlug, protocol, host);

      if (meta) {
        const canonicalPathname = new URL(meta.canonicalUrl).pathname;
        if (req.path !== canonicalPathname) {
          return res.redirect(301, appendOriginalSearch(meta.canonicalUrl, req.originalUrl));
        }

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
