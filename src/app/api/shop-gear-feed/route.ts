import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isReadOnlyPreview } from '@/lib/deployment';
import { fetchEquipmentFromShopGearFeed } from '@/services/equipment/shopGearFeedService';

type ShopFeedEnvironment = {
  SHOP_GEAR_FEED_URL?: string;
  SHOP_GEAR_FEED_SHOP_SLUG?: string;
  SHOP_GEAR_FEED_API_KEY?: string;
};

export async function GET(request: Request) {
  if (isReadOnlyPreview) return new Response(null, { status: 404 });

  let env: ShopFeedEnvironment = process.env as ShopFeedEnvironment;
  try {
    env = { ...env, ...getCloudflareContext().env };
  } catch {
    // next dev runs without Workers bindings.
  }

  const endpoint = env.SHOP_GEAR_FEED_URL && URL.parse(env.SHOP_GEAR_FEED_URL);
  const shopSlug = env.SHOP_GEAR_FEED_SHOP_SLUG;
  if (!endpoint || endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || !shopSlug) {
    return new Response(null, { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  // User-provided URL and shop values never select the credential's destination.
  if (query.has('endpoint') && (query.get('endpoint') !== endpoint.origin + endpoint.pathname || query.get('shop') !== shopSlug)) {
    return new Response(null, { status: 404 });
  }

  const start = query.get('start');
  const end = query.get('end');
  if (Boolean(start) !== Boolean(end) || [start, end].some((date) => date && !Number.isFinite(Date.parse(date)))) {
    return Response.json({ message: 'Supply a valid start and end date.' }, { status: 400 });
  }

  const key = env.SHOP_GEAR_FEED_API_KEY;
  try {
    const gear = await fetchEquipmentFromShopGearFeed({
      endpointUrl: endpoint.toString(),
      shopSlug,
      start: start ?? undefined,
      end: end ?? undefined,
      headers: key ? { apikey: key, Authorization: `Bearer ${key}` } : undefined,
      signal: AbortSignal.timeout(5000),
    });
    return Response.json(gear.filter((item) => item.visible_on_map !== false), {
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    });
  } catch {
    return Response.json({ message: 'Equipment feed unavailable.' }, { status: 503 });
  }
}
