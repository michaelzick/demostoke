import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";

// Smart deduplication that handles same content with different URLs (original vs WebP)
const deduplicateImages = (imageUrls: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of imageUrls) {
    // Extract meaningful parts of the URL for comparison
    // This handles cases where the same image exists as original and WebP converted versions
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    // Create a key based on the base filename (without extension) and equipment ID
    // This will match both original and converted versions of the same image
    const baseFileName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    const equipmentIdMatch = url.match(/equipment(?:_images)?\/([^\/]+)/);
    const equipmentId = equipmentIdMatch ? equipmentIdMatch[1] : "";

    // Create a composite key that identifies the same image regardless of format
    const imageKey = `${equipmentId}-${baseFileName}`;

    // For WebP images, also check if there's a timestamp-based pattern that might indicate conversion
    let isDuplicate = false;

    // Check if this image is a duplicate based on our smart logic
    for (const seenKey of seen) {
      // If we have the same equipment ID and similar base filename, it's likely a duplicate
      if (seenKey.startsWith(equipmentId) && imageKey.startsWith(equipmentId)) {
        // Additional check: if one URL contains 'webp-images' and another doesn't,
        // and they have similar timestamps or patterns, they're likely the same image
        const isCurrentWebP = url.includes("/webp-images/");
        const seenUrl = result.find((u) => {
          const seenParts = u.split("/");
          const seenFileName = seenParts[seenParts.length - 1];
          const seenBaseFileName = seenFileName.replace(
            /\.(jpg|jpeg|png|webp)$/i,
            "",
          );
          return seenKey.includes(seenBaseFileName);
        });

        if (seenUrl) {
          const isSeenWebP = seenUrl.includes("/webp-images/");

          // If one is WebP and the other isn't, they might be the same image
          if (isCurrentWebP !== isSeenWebP) {
            // Prefer the WebP version (better compression)
            if (isCurrentWebP) {
              // Replace the non-WebP version with the WebP version
              const indexToReplace = result.findIndex((u) => u === seenUrl);
              if (indexToReplace !== -1) {
                result[indexToReplace] = url;
              }
            }
            isDuplicate = true;
            break;
          }
        }
      }
    }

    if (!isDuplicate && !seen.has(imageKey)) {
      seen.add(imageKey);
      result.push(url);
    }
  }

  return result;
};

export const fetchEquipmentFromSupabase = async (): Promise<Equipment[]> => {
  console.log("🔍 Fetching equipment from Supabase...");

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
    console.log("📭 No equipment found in Supabase");
    return [];
  }

  console.log(`📦 Found ${data.length} equipment items in Supabase`);

  // Convert each item and fetch additional images
  const convertedEquipment = await Promise.all(
    data.map(async (item) => {
      // Fetch additional images from equipment_images table
      const additionalImages = await fetchEquipmentImages(item.id);

      // Create the flat item using images from the equipment_images table only
      const flatItem = {
        ...item,
        profile_name: item.profiles?.name,
        profile_avatar_url: item.profiles?.avatar_url,
        // Only use additional images from equipment_images
        all_images: deduplicateImages([...additionalImages]),
      };

      return await convertSupabaseToEquipment(flatItem);
    }),
  );

  console.log(
    `✅ Successfully converted ${convertedEquipment.length} equipment items`,
  );
  return convertedEquipment;
};

// Export getEquipmentData function that was missing
export const getEquipmentData = async (): Promise<Equipment[]> => {
  // This function should determine whether to use mock data or real data
  // For now, let's use the Supabase data
  return await fetchEquipmentFromSupabase();
};
