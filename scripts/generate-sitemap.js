
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// just a comment

let supabase;
async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase env vars are missing; dynamic sitemap routes will be skipped.');
    supabase = null;
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('Could not load @supabase/supabase-js, dynamic routes will be skipped.');
    supabase = null;
  }
}

const baseUrl = process.env.SITEMAP_BASE_URL || 'https://www.demostoke.com';

async function fetchBlogPosts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('blog_posts').select('slug, updated_at');
  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
  return (data || []).map(post => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    lastmod: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
  }));
}

async function fetchEquipment() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('equipment')
    .select('id, name, size, updated_at');
  if (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
  return (data || []).map(item => ({
    loc: `${baseUrl}/gear/${buildGearSlug(item)}`,
    lastmod: item.updated_at ? new Date(item.updated_at).toISOString() : undefined,
  }));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeToken(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function hasSizeInName(name, size) {
  const normalizedName = normalizeToken(name);
  const normalizedSize = normalizeToken(size);
  return normalizedSize.length > 0 && normalizedName.includes(normalizedSize);
}

function buildGearDisplayName(name, size) {
  const trimmedName = (name || '').trim();
  const trimmedSize = (size || '').trim();

  if (!trimmedSize || hasSizeInName(trimmedName, trimmedSize)) {
    return trimmedName;
  }

  return `${trimmedName} ${trimmedSize}`;
}

function buildGearSlug(item) {
  const displayName = buildGearDisplayName(item.name, item.size);
  return `${slugify(displayName)}--${item.id}`;
}

function generateEventSlug(event) {
  const titlePart = slugify(event.title);
  const datePart = event.event_date ? format(new Date(event.event_date + 'T00:00:00'), 'MM-dd-yyyy') : 'tbd';
  const timePart = event.event_time ? event.event_time.replace(':', '') : 'tbd';
  return `${titlePart}-${datePart}-${timePart}`;
}

async function fetchDemoEvents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('demo_calendar')
    .select('title, event_date, event_time, updated_at');
  if (error) {
    console.error('Error fetching demo events:', error);
    return [];
  }
  return (data || []).map(ev => ({
    loc: `${baseUrl}/demo-calendar/event/${generateEventSlug(ev)}`,
    lastmod: ev.updated_at ? new Date(ev.updated_at).toISOString() : undefined,
  }));
}

async function generate() {
  await initSupabase();
  const staticUrls = [
    '/',
    '/about',
    '/how-it-works',
    '/privacy-policy',
    '/terms-of-service',
    '/blog',
    '/contact-us',
    '/explore',
    '/list-your-gear',
    '/list-your-gear/add-gear-form',
    '/list-your-gear/lightspeed-pos',
    '/profile',
    '/my-gear',
    '/analytics',
    '/bookings',
    '/admin',
    '/search',
    '/gear',
    '/gear/surfboards',
    '/gear/used-skis',
    '/api/gear/search',
    '/demo-calendar',
  ].map(p => ({ loc: `${baseUrl}${p}` }));

  const [blogUrls, equipmentUrls, demoEventUrls] = await Promise.all([
    fetchBlogPosts(),
    fetchEquipment(),
    fetchDemoEvents()
  ]);
  const urls = [...staticUrls, ...blogUrls, ...equipmentUrls, ...demoEventUrls];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const url of urls) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${url.loc}</loc>`);
    if (url.lastmod) {
      xmlLines.push(`    <lastmod>${url.lastmod}</lastmod>`);
    }
    xmlLines.push('  </url>');
  }
  xmlLines.push('</urlset>');

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlLines.join('\n'), 'utf8');
  console.log(`Sitemap written to ${sitemapPath}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
