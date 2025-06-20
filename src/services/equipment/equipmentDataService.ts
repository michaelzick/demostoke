
import { Equipment } from "@/types";
import { mockEquipment } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { getShowMockDataSetting } from "./appSettingsService";

// Get equipment data based on global app setting
export const getEquipmentData = async (): Promise<Equipment[]> => {
  const useMockData = await getShowMockDataSetting();
  
  if (useMockData) {
    console.log('📦 Using MOCK equipment data');
    return mockEquipment;
  }

  console.log('🗄️ Using REAL equipment data from database');
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select(`
        *,
        profiles!equipment_user_id_fkey (
          name,
          avatar_url
        )
      `)
      .eq('status', 'available')
      .eq('visible_on_map', true); // Only fetch visible equipment

    if (error) {
      console.error('❌ Error fetching equipment from database:', error);
      console.log('🔄 Falling back to empty array (no mock data fallback)');
      return [];
    }

    console.log('✅ Fetched equipment from database:', data?.length, 'items');
    data?.forEach(item => {
      console.log(`Equipment: ${item.name}, Category: ${item.category}, Owner: ${item.profiles?.name || 'Owner'}, Location: ${item.location_lat}, ${item.location_lng}, Visible: ${item.visible_on_map}`);
    });

    // Convert all equipment items and fetch their images
    const equipmentPromises = (data || []).map(item => {
      // Flatten the profile data for easier access in convertSupabaseToEquipment
      const flatItem = {
        ...item,
        profile_name: item.profiles?.name,
        profile_avatar_url: item.profiles?.avatar_url
      };
      return convertSupabaseToEquipment(flatItem);
    });
    return await Promise.all(equipmentPromises);
  } catch (error) {
    console.error('❌ Exception fetching equipment from database:', error);
    console.log('🔄 Falling back to empty array (no mock data fallback)');
    return [];
  }
};
