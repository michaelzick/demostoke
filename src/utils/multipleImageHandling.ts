
import { supabase } from "@/integrations/supabase/client";
import { uploadGearImage } from "./imageUpload";

export interface EquipmentImage {
  id: string;
  equipment_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const uploadMultipleGearImages = async (
  files: File[],
  userId: string,
  onProgress?: (message: string) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    onProgress?.(`Uploading image ${index + 1} of ${files.length}...`);
    return await uploadGearImage(file, userId);
  });

  return await Promise.all(uploadPromises);
};

export const saveEquipmentImages = async (
  equipmentId: string,
  imageUrls: string[]
): Promise<void> => {
  if (imageUrls.length === 0) return;

  const imageData = imageUrls.map((url, index) => ({
    equipment_id: equipmentId,
    image_url: url,
    display_order: index,
    is_primary: index === 0, // First image is primary
  }));

  const { error } = await supabase
    .from('equipment_images')
    .insert(imageData);

  if (error) {
    console.error('Error saving equipment images:', error);
    throw error;
  }
};

export const fetchEquipmentImages = async (equipmentId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('equipment_images')
    .select('image_url')
    .eq('equipment_id', equipmentId)
    .order('display_order');

  if (error) {
    console.error('Error fetching equipment images:', error);
    return [];
  }

  return data?.map(img => img.image_url) || [];
};

export const deleteEquipmentImages = async (equipmentId: string): Promise<void> => {
  const { error } = await supabase
    .from('equipment_images')
    .delete()
    .eq('equipment_id', equipmentId);

  if (error) {
    console.error('Error deleting equipment images:', error);
    throw error;
  }
};
