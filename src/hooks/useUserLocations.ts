
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
      console.log('🔍 Fetching user locations with equipment categories...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          role, 
          address, 
          location_lat, 
          location_lng, 
          avatar_url,
          equipment:equipment(category)
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

      const userLocations: UserLocation[] = data
        .filter(profile => profile.location_lat && profile.location_lng)
        .map(profile => {
          // Extract unique categories from user's equipment
          const equipmentCategories = profile.equipment
            ? Array.from(new Set(profile.equipment.map((eq: any) => eq.category)))
            : [];

          return {
            id: profile.id,
            name: profile.name || 'Unknown User',
            role: profile.role,
            address: profile.address,
            location: {
              lat: Number(profile.location_lat),
              lng: Number(profile.location_lng)
            },
            avatar_url: profile.avatar_url,
            equipment_categories: equipmentCategories
          };
        });

      console.log('✅ User locations processed:', userLocations.length, 'locations');
      console.log('📍 User locations with categories:', userLocations);
      return userLocations;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
