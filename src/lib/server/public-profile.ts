import { cache } from 'react';
import { slugify } from '@/utils/slugify';
import type { PublicProfile } from '@/services/public-profile';
import { catalog, catalogUnavailable } from './public-catalog';

export const loadProfile = cache(async (slug: string): Promise<PublicProfile | null> => {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const pattern = `%${slug.split('-').filter(Boolean).join('%')}%`;
  const { data, error } = await catalog.from('public_profiles').select('*').ilike('name', pattern).limit(40);
  if (error) catalogUnavailable('public profile');
  async function findById(id: string) {
    const { data: owner, error: ownerError } = await catalog.from('public_profiles').select('*')
      .eq('id', id).maybeSingle();
    if (ownerError) catalogUnavailable('shop profile');
    return owner ?? undefined;
  }
  let profile = data.find(({ name }) => slugify(name || '') === slug);
  if (!profile) {
    const mappings = catalog.from('shop_gear_feed_mappings').select('profile_id, shop_slug')
      .eq('provider', 'demostoke_widget').eq('is_active', true);
    const { data: aliases, error: aliasError } = await mappings
      .or(`shop_slug.eq.${slug},shop_slug.like.${slug}-*`).limit(25);
    if (aliasError) catalogUnavailable('shop alias');
    const alias = aliases.find(({ shop_slug }) => shop_slug === slug) ?? aliases[0];
    if (alias) profile = await findById(alias.profile_id);
  }

  if (!profile) {
    const { data: syncedGear, error: syncError } = await catalog.from('equipment').select('user_id')
      .eq('visible_on_map', true).eq('status', 'available')
      .eq('external_source_provider', 'demostoke_widget').eq('external_source_shop_slug', slug)
      .limit(1).maybeSingle();
    if (syncError) catalogUnavailable('synced shop profile');
    if (syncedGear) profile = await findById(syncedGear.user_id);
  }
  if (!profile?.id || !profile.name) return null;
  return {
    ...profile,
    id: profile.id,
    name: profile.name,
    member_since: profile.member_since || profile.created_at || '1970-01-01',
    created_at: profile.created_at || profile.member_since || '1970-01-01',
    displayRole: null,
    is_hidden: false,
  };
});
