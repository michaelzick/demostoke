
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

import { deduplicateImageUrls } from "@/utils/imageDeduplication";

export const useTrendingEquipment = () => {
  return useQuery({
    queryKey: ['trendingEquipment'],
    queryFn: async (): Promise<Equipment[]> => {
      console.log('🔥 Fetching trending equipment from database');
      
      try {
        // Get trending equipment IDs with view counts using the optimized function
        const { data: trendingData, error: trendingError } = await supabase
          .rpc('get_trending_equipment', { limit_count: 3 });

        if (trendingError) {
          console.error('❌ Error fetching trending equipment:', trendingError);
          return [];
        }

        if (!trendingData || trendingData.length === 0) {
          console.log('📊 No trending equipment found (no views yet)');
          return [];
        }

        console.log(`📈 Found ${trendingData.length} trending equipment items:`, trendingData);

        // Fetch full equipment details for trending items
        const equipmentIds = trendingData.map(item => item.equipment_id);
        
        const { data: equipmentDetails, error: equipmentError } = await supabase
          .from('equipment')
          .select(`
            *,
            profiles!equipment_user_id_fkey (
              name,
              avatar_url
            )
          `)
          .in('id', equipmentIds);

        if (equipmentError) {
          console.error('❌ Error fetching equipment details:', equipmentError);
          return [];
        }

        if (!equipmentDetails) {
          console.log('📊 No equipment details found');
          return [];
        }

        // Convert and sort equipment to maintain trending order
        const { convertSupabaseToEquipment } = await import('@/services/equipment/equipmentConverter');
        const { fetchEquipmentImages } = await import('@/utils/multipleImageHandling');

        const equipmentPromises = equipmentDetails.map(async (item) => {
          // Fetch gallery images from equipment_images table
          const galleryImages = await fetchEquipmentImages(item.id);
          const allImages = deduplicateImageUrls(galleryImages);

          const flatItem = {
            ...item,
            profile_name: item.profiles?.name,
            profile_avatar_url: item.profiles?.avatar_url,
            all_images: allImages,
          };
          return await convertSupabaseToEquipment(flatItem);
        });

        const convertedEquipment = await Promise.all(equipmentPromises);

        // Sort by the original trending order (view count desc, then name asc)
        const sortedTrending = trendingData.map(trendingItem => {
          return convertedEquipment.find(eq => eq.id === trendingItem.equipment_id);
        }).filter(Boolean) as Equipment[];

        console.log(`✅ Trending equipment loaded: ${sortedTrending.length} items`);
        return sortedTrending;

      } catch (error) {
        console.error('❌ Exception fetching trending equipment:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
