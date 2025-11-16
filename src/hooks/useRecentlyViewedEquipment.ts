import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";

interface RecentlyViewedItem {
  equipment_id: string;
  viewed_at: string;
}

export const useRecentlyViewedEquipment = (userId?: string) => {
  return useQuery({
    queryKey: ['recentlyViewedEquipment', userId],
    queryFn: async (): Promise<Equipment[]> => {
      if (!userId) {
        return [];
      }

      // Get user's recently viewed equipment IDs
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('recently_viewed_equipment')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return [];
      }

      const recentlyViewed = (profile.recently_viewed_equipment as unknown as RecentlyViewedItem[]) || [];
      
      // Get top 3 equipment IDs
      const recentIds = recentlyViewed.slice(0, 3).map(item => item.equipment_id);

      if (recentIds.length === 0) {
        return [];
      }

      // Fetch full equipment details including owner info
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_images!inner(image_url, is_primary, display_order),
          profiles!equipment_user_id_fkey(
            id,
            name,
            avatar_url
          )
        `)
        .in('id', recentIds)
        .eq('status', 'available');

      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError);
        return [];
      }

      if (!equipmentData) {
        return [];
      }

      // Transform data to Equipment type and maintain view order
      const equipmentMap = new Map<string, Equipment>();
      
      equipmentData.forEach((item: any) => {
        const images = item.equipment_images || [];
        const primaryImage = images.find((img: any) => img.is_primary) || images[0];
        const profile = item.profiles;

        equipmentMap.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          description: item.description,
          price_per_day: item.price_per_day,
          price_per_hour: item.price_per_hour,
          price_per_week: item.price_per_week,
          damage_deposit: item.damage_deposit,
          image_url: primaryImage?.image_url || '',
          images: primaryImage ? [primaryImage.image_url] : [],
          rating: item.rating || 0,
          review_count: item.review_count || 0,
          distance: 0,
          location: {
            address: item.location_address || '',
            lat: item.location_lat || 0,
            lng: item.location_lng || 0,
          },
          specifications: {
            size: item.size || '',
            weight: item.weight || '',
            material: item.material || '',
            suitable: item.suitable_skill_level || '',
          },
          availability: {
            available: item.status === 'available',
            nextAvailableDate: undefined,
          },
          pricing_options: [],
          owner: {
            id: profile?.id || '',
            name: profile?.name || 'Unknown',
            imageUrl: profile?.avatar_url,
            rating: 0,
            reviewCount: 0,
            responseRate: 0,
          },
        });
      });

      // Return equipment in original view order
      return recentIds
        .map(id => equipmentMap.get(id))
        .filter((item): item is Equipment => item !== undefined);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
