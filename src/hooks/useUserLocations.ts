
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
      console.log('🔍 Fetching user locations with visible equipment categories...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          address,
          location_lat,
          location_lng,
          avatar_url,
          equipment:equipment!equipment_user_id_fkey(category, visible_on_map)
        `)
        .not('address', 'is', null)
        .not('address', 'eq', '')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      if (error) {
        console.error('❌ Error fetching user locations:', error);
        throw error;
      }

      console.log('📍 Raw profile data with equipment:', data);

      const userIds = data.map(profile => profile.id);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, display_role')
        .in('user_id', userIds);

      if (roleError) {
        console.error('❌ Error fetching user roles:', roleError);
        throw roleError;
      }

      const roleMap = new Map(roleData.map(item => [item.user_id, item.display_role]));

      const userLocations: UserLocation[] = data
        .filter(profile => profile.location_lat && profile.location_lng)
        .map(profile => {
          // Extract unique categories from user's VISIBLE equipment only
          const visibleEquipment = profile.equipment?.filter((eq: { category: string; visible_on_map?: boolean }) => eq.visible_on_map) || [];
          const equipmentCategories = Array.from(new Set(visibleEquipment.map((eq) => eq.category)));

          return {
            id: profile.id,
            name: profile.name || 'Unknown User',
            role: roleMap.get(profile.id) || 'retail-store',
            address: profile.address,
            location: {
              lat: Number(profile.location_lat),
              lng: Number(profile.location_lng)
            },
            avatar_url: profile.avatar_url,
            equipment_categories: equipmentCategories
          };
        })
        // Filter out users who have no visible equipment
        .filter(user => user.equipment_categories.length > 0);

      console.log('✅ User locations processed:', userLocations.length, 'locations with visible equipment');
      console.log('📍 User locations with categories:', userLocations);
      return userLocations;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
