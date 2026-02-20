
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

import { deduplicateImageUrls } from "@/utils/imageDeduplication";
import { getHiddenUserIds, filterHiddenUsers } from "@/services/equipment/hiddenUserFilter";

export const useRecentEquipment = () => {
  return useQuery({
    queryKey: ['recentEquipment'],
    queryFn: async (): Promise<Equipment[]> => {
      console.log('🆕 Fetching recent equipment from database');
      
      try {
        // Get the 3 most recently created equipment items
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select(`
            *,
            profiles!equipment_user_id_fkey (
              name,
              avatar_url
            )
          `)
          .eq('status', 'available')
          .eq('visible_on_map', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (equipmentError) {
          console.error('❌ Error fetching recent equipment:', equipmentError);
          return [];
        }

        if (!equipmentData || equipmentData.length === 0) {
          console.log('📊 No recent equipment found');
          return [];
        }

        // Filter out hidden users
        const hiddenUserIds = await getHiddenUserIds();
        const visibleEquipment = filterHiddenUsers(equipmentData, hiddenUserIds);

        console.log(`📅 Found ${visibleEquipment.length} recent equipment items`);


        // Convert equipment details
        const { convertSupabaseToEquipment } = await import('@/services/equipment/equipmentConverter');
        const { fetchEquipmentImages } = await import('@/utils/multipleImageHandling');

        const equipmentPromises = visibleEquipment.map(async (item) => {
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

        console.log(`✅ Recent equipment loaded: ${convertedEquipment.length} items`);
        return convertedEquipment;

      } catch (error) {
        console.error('❌ Exception fetching recent equipment:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
