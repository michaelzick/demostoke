
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";

// Deduplicate image URLs, ignoring any query parameters
const deduplicateImages = (imageUrls: string[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const url of imageUrls) {
    // Normalize by removing query string so transformed URLs are treated equally
    const normalized = url.split('?')[0];

    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(url);
    }
  }

  return unique;
};

export const fetchEquipmentFromSupabase = async (): Promise<Equipment[]> => {
  console.log('🔍 Fetching equipment from Supabase...');
  
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
    .eq('visible_on_map', true);

  if (error) {
    console.error('❌ Supabase query error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('📭 No equipment found in Supabase');
    return [];
  }

  console.log(`📦 Found ${data.length} equipment items in Supabase`);

  // Convert each item and fetch additional images
  const convertedEquipment = await Promise.all(
    data.map(async (item) => {
      // Fetch additional images from equipment_images table
      const additionalImages = await fetchEquipmentImages(item.id);
      
      // Create the flat item with all images combined
      const flatItem = {
        ...item,
        profile_name: item.profiles?.name,
        profile_avatar_url: item.profiles?.avatar_url,
        // Combine main image_url with additional images, with smart deduplication
        all_images: deduplicateImages([
          ...(item.image_url ? [item.image_url] : []),
          ...additionalImages
        ])
      };
      
      return await convertSupabaseToEquipment(flatItem);
    })
  );

  console.log(`✅ Successfully converted ${convertedEquipment.length} equipment items`);
  return convertedEquipment;
};

// Export getEquipmentData function that was missing
export const getEquipmentData = async (): Promise<Equipment[]> => {
  // This function should determine whether to use mock data or real data
  // For now, let's use the Supabase data
  return await fetchEquipmentFromSupabase();
};
