import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { getLocalRVI } from "@/services/localStorageRVIService";

interface RecentlyViewedItem {
  equipment_id: string;
  viewed_at: string;
}

// Helper function to fetch equipment details by IDs
const fetchEquipmentDetailsByIds = async (equipmentIds: string[]): Promise<Equipment[]> => {
  if (equipmentIds.length === 0) return [];

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
    .in('id', equipmentIds)
    .eq('status', 'available');

  if (equipmentError || !equipmentData) {
    console.error('Error fetching equipment:', equipmentError);
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

  // Return equipment in original view order (filter out missing items)
  return equipmentIds
    .map(id => equipmentMap.get(id))
    .filter((item): item is Equipment => item !== undefined);
};

export const useRecentlyViewedEquipment = (userId?: string) => {
  return useQuery({
    queryKey: ['recentlyViewedEquipment', userId],
    queryFn: async (): Promise<Equipment[]> => {
      if (userId) {
        // Fetch from database for logged-in users
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
        const recentIds = recentlyViewed.slice(0, 5).map(item => item.equipment_id);

        return fetchEquipmentDetailsByIds(recentIds);
      } else {
        // Fetch from localStorage for logged-out users
        const localRVI = getLocalRVI();
        const recentIds = localRVI.slice(0, 5).map(item => item.equipment_id);

        return fetchEquipmentDetailsByIds(recentIds);
      }
    },
    staleTime: userId ? 0 : 1000 * 60 * 5, // No stale time for logged-in users, 5 min for logged-out
    refetchOnMount: 'always', // Always fetch fresh data when component mounts
  });
};
