import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";
import { getHiddenUserIds, filterHiddenUsers } from "./hiddenUserFilter";

export const fetchEquipmentFromSupabase = async (): Promise<Equipment[]> => {

  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
      *,
      profiles!equipment_user_id_fkey (
        name,
        avatar_url
      )
    `,
    )
    .eq("status", "available")
    .eq("visible_on_map", true);

  if (error) {
    console.error("❌ Supabase query error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Filter out equipment from hidden users
  const hiddenUserIds = await getHiddenUserIds();
  const visibleData = filterHiddenUsers(data, hiddenUserIds);

  // Convert each item and fetch additional images
  const convertedEquipment = await Promise.all(
    visibleData.map(async (item) => {
      // Fetch images from equipment_images table
      const additionalImages = await fetchEquipmentImages(item.id);

      const allImages = deduplicateImageUrls(additionalImages);

      const flatItem = {
        ...item,
        profile_name: item.profiles?.name,
        profile_avatar_url: item.profiles?.avatar_url,
        all_images: allImages,
      };

      return await convertSupabaseToEquipment(flatItem);
    }),
  );

  return convertedEquipment;
};

// Export getEquipmentData function that returns real data from Supabase
export const getEquipmentData = async (): Promise<Equipment[]> => {
  return await fetchEquipmentFromSupabase();
};
