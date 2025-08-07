
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qtlhqsqanbxgfbcjigrl.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let supabase;
async function initSupabase() {
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
    .select('slug, category, updated_at, profiles!equipment_user_id_fkey(username)');
  if (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
  return (data || []).map(item => ({
    loc: `${baseUrl}/${item.category}/${item.profiles?.username || 'owner'}/${item.slug}`,
    lastmod: item.updated_at ? new Date(item.updated_at).toISOString() : undefined,
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
    '/demo-calendar',
  ].map(p => ({ loc: `${baseUrl}${p}` }));

  const [blogUrls, equipmentUrls] = await Promise.all([fetchBlogPosts(), fetchEquipment()]);
  const urls = [...staticUrls, ...blogUrls, ...equipmentUrls];

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
