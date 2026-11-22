import { createClient } from '@supabase/supabase-js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/integrations/supabase/config.js';
import type { Database } from '@/integrations/supabase/types';
import { blogPosts } from '@/lib/blog';
import { formatPublishedBlogPost, getPublishedBlogPost } from '@/lib/blog/publishedPost';
import type { DemoEvent } from '@/types/demo-calendar';
import { convertDbEquipmentToFrontend } from '@/services/equipment/equipmentConverter';
import { buildGearPath, extractGearIdFromSlug } from '@/utils/gearUrl';
import { findEventBySlug } from '@/utils/eventSlug';
import { deduplicateImageUrls } from '@/utils/imageDeduplication';
import { isMissingCurrencyCodeColumnError } from '@/utils/supabaseCurrencyCompat';
import { slugify } from '@/utils/slugify';
import { buildLegacyGearNamePattern, parseLegacyGearRoute } from '@/lib/seo/gearSeo';

export const catalog = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        cache: 'no-store',
        signal: AbortSignal.any([AbortSignal.timeout(4000), ...(init?.signal ? [init.signal] : [])]),
      }),
    },
  },
);

export function catalogUnavailable(operation: string): never {
  // The Worker uses this request-local signal to distinguish dependency failures
  // from application exceptions when Next emits its standard 500 response.
  try {
    const env = getCloudflareContext().env as CloudflareEnv & { reportCatalogFailure?: () => void };
    env.reportCatalogFailure?.();
  } catch {
    // next dev and next start can run without Workers bindings.
  }
  console.error('Public catalog unavailable', { operation });
  throw new Error('Public catalog temporarily unavailable');
}

const gearListing = 'id, user_id, name, size, category, updated_at, created_at' as const;
const gearDetail = `${gearListing}, subcategory, description, status, visible_on_map, price_per_day, price_per_hour, price_per_week, damage_deposit, location_lat, location_lng, location_address, weight, material, suitable_skill_level, rating, review_count, is_featured, equipment_images(image_url, is_primary, display_order)` as const;
const uuidPattern = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

const publicGear = () => catalog.from('equipment').select(gearListing)
  .eq('visible_on_map', true).eq('status', 'available');

async function filterPublicOwners<T extends { user_id: string }>(rows: T[]) {
  const ids = [...new Set(rows.map(({ user_id }) => user_id))];
  if (!ids.length) return [];
  const { data, error } = await catalog.from('public_profiles').select('id').in('id', ids);
  if (error) catalogUnavailable('gear owners');
  const publicIds = new Set(data.map(({ id }) => id));
  return rows.filter(({ user_id }) => publicIds.has(user_id));
}

export async function loadGearLinks({ category, ownerId, all = false }:
  { category?: string; ownerId?: string; all?: boolean } = {}) {
  const pageSize = all ? 300 : 60;
  const links: { href: string; name: string; updatedAt: string }[] = [];
  for (let offset = 0; ; offset += pageSize) {
    let query = publicGear().order('updated_at', { ascending: false }).order('id')
      .range(offset, offset + pageSize - 1);
    if (category) query = query.eq('category', category);
    if (ownerId) query = query.eq('user_id', ownerId);
    const { data, error } = await query;
    if (error) catalogUnavailable('gear index');
    const rows = ownerId ? data : await filterPublicOwners(data);
    links.push(...rows.map((row) => ({
      href: buildGearPath(row),
      name: row.name,
      updatedAt: row.updated_at || row.created_at,
    })));
    if (!all || data.length < pageSize) return links;
  }
}

export const loadGear = cache(async (slug: string) => {
  const id = extractGearIdFromSlug(slug);
  if (!id || !uuidPattern.test(id)) return null;
  const query = (withCurrency: boolean) => {
    const table = catalog.from('equipment');
    return (withCurrency ? table.select(`${gearDetail}, currency_code`) : table.select(gearDetail))
      .eq('id', id).eq('visible_on_map', true).eq('status', 'available').maybeSingle();
  };

  let { data: gear, error } = await query(true);
  if (isMissingCurrencyCodeColumnError(error)) ({ data: gear, error } = await query(false));
  if (error) catalogUnavailable('gear detail');
  if (!gear) return null;

  const { data: profile, error: profileError } = await catalog.from('public_profiles')
    .select('name, avatar_url').eq('id', gear.user_id).maybeSingle();
  if (profileError) catalogUnavailable('gear owner');
  if (!profile) return null;

  const images = [...(gear.equipment_images ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
    .map(({ image_url }) => image_url);
  return convertDbEquipmentToFrontend({
    ...gear,
    profiles: profile,
    all_images: deduplicateImageUrls(images),
  });
});

export async function resolveOldGear(path: string) {
  const route = parseLegacyGearRoute(path);
  const pattern = route && buildLegacyGearNamePattern(route.slug);
  if (!route || !pattern || !/^[a-z0-9-]+$/i.test(route.slug)) return null;
  const { data, error } = await publicGear().eq('category', route.category).ilike('name', pattern).limit(25);
  if (error) catalogUnavailable('legacy gear');
  const ownerIds = [...new Set(data.map(({ user_id }) => user_id))];
  if (!ownerIds.length) return null;
  const { data: owners, error: ownerError } = await catalog.from('public_profiles')
    .select('id, name').in('id', ownerIds);
  if (ownerError) catalogUnavailable('legacy gear owner');
  const matchingOwners = new Set(owners.filter(({ name }) => slugify(name || '') === route.ownerSlug).map(({ id }) => id));
  const match = data.find(({ user_id }) => matchingOwners.has(user_id));
  return match ? buildGearPath(match) : null;
}

export const loadBlogPost = cache(async (slug: string) => {
  try {
    return await getPublishedBlogPost(catalog, slug, AbortSignal.timeout(4000));
  } catch {
    return catalogUnavailable('blog article');
  }
});

const blogListColumns = 'id, slug, title, excerpt, category, author, author_id, published_at, read_time, hero_image, thumbnail, video_embed, tags';
export const loadBlogIndex = cache(async () => {
  const { data, error } = await catalog.from('blog_posts').select(blogListColumns)
    .eq('status', 'published').order('published_at', { ascending: false });
  if (error) catalogUnavailable('blog index');
  const posts = new Map(blogPosts.map((post) => [post.id, { ...post, content: '' }]));
  for (const row of data) {
    const post = formatPublishedBlogPost({ ...row, content: '' });
    posts.set(post.id, post);
  }
  return [...posts.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
});

export const loadEvents = cache(async () => {
  const { data, error } = await catalog.from('demo_calendar')
    .select('id, title, gear_category, event_date, event_time, location, location_lat, location_lng, equipment_available, thumbnail_url, is_featured, company, source_primary_url, created_at, updated_at')
    .order('event_date', { ascending: true, nullsFirst: false }).order('id');
  if (error) catalogUnavailable('demo calendar');
  return data.map((row): DemoEvent => ({
    ...row,
    gear_category: row.gear_category as DemoEvent['gear_category'],
    external_event_id: null,
    created_by: '',
  }));
});

export const loadEvent = cache(async (slug: string) => findEventBySlug(await loadEvents(), slug));
