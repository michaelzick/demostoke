import type { Equipment } from '@/types';

export async function fetchConfiguredShopGearFeed(params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return null;

  const query = new URLSearchParams(params);
  const response = await fetch(`/api/shop-gear-feed?${query}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The configured shop gear feed is unavailable.');
  return await response.json() as Equipment[];
}
