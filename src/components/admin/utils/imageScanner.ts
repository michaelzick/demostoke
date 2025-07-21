import { supabase } from "@/integrations/supabase/client";
import { ImageRecord } from "../ImageConversionSection";

const isProcessableImage = (url: string): boolean => {
  if (!url || url.trim() === "") return false;
  if (url.includes("supabase") || url.includes("dicebear") || url.startsWith("/img/")) return false;
  return /\.(jpg|jpeg|png|gif|bmp|tiff|webp)(\?.*)?$/i.test(url) ||
         url.includes("unsplash") ||
         url.includes("pexels") ||
         url.includes("images") ||
         url.includes("photo");
};

const getFileType = (url: string): string => {
  const match = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)(\?.*)?$/i);
  if (match) return match[1].toUpperCase();
  if (url.includes("unsplash")) return "JPG";
  if (url.includes("pexels")) return "JPG";
  return "UNKNOWN";
};

export const scanImages = async (): Promise<ImageRecord[]> => {
  const foundImages: ImageRecord[] = [];

  // Note: equipment.image_url column was removed, so we only scan equipment_images table

  const { data: equipmentImagesData } = await supabase
    .from("equipment_images")
    .select("id, image_url, equipment_id, equipment(category, name, profiles(name))")
    .not("image_url", "is", null);

  equipmentImagesData?.forEach(item => {
    if (isProcessableImage(item.image_url)) {
      foundImages.push({
        id: `equipment_images-${item.id}`,
        url: item.image_url,
        source_table: "equipment_images",
        source_column: "image_url",
        source_record_id: item.id,
        equipment_id: item.equipment_id,
        category: (item as any).equipment?.category,
        name: (item as any).equipment?.name,
        owner_name: (item as any).equipment?.profiles?.name,
        file_type: getFileType(item.image_url)
      });
    }
  });

  const { data: profileAvatars } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .not("avatar_url", "is", null);

  profileAvatars?.forEach(item => {
    if (item.avatar_url && isProcessableImage(item.avatar_url)) {
      foundImages.push({
        id: `profiles-avatar-${item.id}`,
        url: item.avatar_url,
        source_table: "profiles",
        source_column: "avatar_url",
        source_record_id: item.id,
        file_type: getFileType(item.avatar_url)
      });
    }
  });

  const { data: profileHeros } = await supabase
    .from("profiles")
    .select("id, hero_image_url")
    .not("hero_image_url", "is", null);

  profileHeros?.forEach(item => {
    if (item.hero_image_url && isProcessableImage(item.hero_image_url)) {
      foundImages.push({
        id: `profiles-hero-${item.id}`,
        url: item.hero_image_url,
        source_table: "profiles",
        source_column: "hero_image_url",
        source_record_id: item.id,
        file_type: getFileType(item.hero_image_url)
      });
    }
  });

  return foundImages;
};
