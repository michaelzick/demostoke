
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserLocation {
  id: string;
  name: string;
  role: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  avatar_url: string | null;
  equipment_categories: string[];
}

export const useUserLocations = () => {
  return useQuery({
    queryKey: ['userLocations'],
    queryFn: async (): Promise<UserLocation[]> => {
      // Query 1: equipment with embedded profiles (single join, uses FK index).
      // Replaces the old 3-query chain: public_profiles → user_roles → equipment.
      const { data: equipmentWithProfiles, error: eqError } = await supabase
        .from('equipment')
        .select(`
          user_id,
          category,
          profiles!equipment_user_id_fkey (
            id, name, address, location_lat, location_lng, avatar_url, is_hidden
          )
        `)
        .eq('visible_on_map', true)
        .eq('status', 'available');

      if (eqError) throw eqError;

      // Filter to profiles with coordinates and non-hidden owners
      const validItems = (equipmentWithProfiles ?? []).filter(
        (eq) =>
          eq.profiles &&
          !eq.profiles.is_hidden &&
          eq.profiles.location_lat &&
          eq.profiles.location_lng &&
          eq.profiles.address,
      );

      const userIds = [...new Set(validItems.map((eq) => eq.user_id))];
      if (userIds.length === 0) return [];

      // Query 2: fetch display roles for those users
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, display_role')
        .in('user_id', userIds);

      if (roleError) throw roleError;

      const roleMap = new Map((roleData ?? []).map((r) => [r.user_id, r.display_role]));

      // Group equipment categories by user_id
      const equipmentByUser = new Map<string, string[]>();
      validItems.forEach((eq) => {
        const cats = equipmentByUser.get(eq.user_id) ?? [];
        if (!cats.includes(eq.category)) cats.push(eq.category);
        equipmentByUser.set(eq.user_id, cats);
      });

      // Build one UserLocation per unique user that has visible equipment
      const seen = new Set<string>();
      const userLocations: UserLocation[] = [];

      for (const eq of validItems) {
        if (seen.has(eq.user_id)) continue;
        seen.add(eq.user_id);

        const p = eq.profiles!;
        const equipmentCategories = equipmentByUser.get(eq.user_id) ?? [];
        if (equipmentCategories.length === 0) continue;

        userLocations.push({
          id: p.id,
          name: p.name || 'Unknown User',
          role: roleMap.get(eq.user_id) || 'retail-store',
          address: p.address || '',
          location: {
            lat: Number(p.location_lat),
            lng: Number(p.location_lng),
          },
          avatar_url: p.avatar_url,
          equipment_categories: equipmentCategories,
        });
      }

      return userLocations;
    },
    staleTime: 5 * 60 * 1000,
  });
};
