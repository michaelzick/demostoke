import type { MetadataRoute } from 'next';
import { loadBlogIndex, loadEvents, loadGearLinks } from '@/lib/server/public-catalog';
import { PUBLIC_ROUTE_META, PUBLIC_SITE_URL } from '@/lib/seo/publicMetadata';
import { isPastDemoEvent } from '@/lib/seo/policy';
import { buildDemoEventPath } from '@/utils/eventSlug';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events, gear] = await Promise.all([
    loadBlogIndex(), loadEvents(), loadGearLinks({ all: true }),
  ]);
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();
  function add(path: string, lastModified?: string) {
    const url = PUBLIC_SITE_URL + path;
    const date = lastModified && Date.parse(lastModified);
    const previous = urls.get(url);
    if (!previous || (date && (!previous.lastModified || date > Date.parse(String(previous.lastModified))))) {
      urls.set(url, { url, lastModified: date ? new Date(date) : undefined });
    }
  }
  Object.keys(PUBLIC_ROUTE_META).forEach((path) => add(path));
  posts.forEach((post) => add(`/blog/${encodeURIComponent(post.id)}`, post.publishedAt));
  events.filter((event) => !isPastDemoEvent(event)).forEach((event) => add(buildDemoEventPath(event), event.updated_at));
  gear.forEach(({ href, updatedAt }) => add(href, updatedAt));
  return [...urls.values()];
}
