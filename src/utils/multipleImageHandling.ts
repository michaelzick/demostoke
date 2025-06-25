
import { supabase } from "@/integrations/supabase/client";

export const fetchEquipmentImages = async (equipmentId: string): Promise<string[]> => {
  console.log('=== FETCHING EQUIPMENT IMAGES ===');
  console.log('Equipment ID for image fetch:', equipmentId);

  try {
    const { data, error } = await supabase
      .from('equipment_images')
      .select('image_url, display_order, is_primary')
      .eq('equipment_id', equipmentId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching equipment images:', error);
      return [];
    }

    console.log('Raw equipment_images data:', data);
    console.log('Number of images found:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('No additional images found in equipment_images table');
      return [];
    }

    const imageUrls = data.map(img => img.image_url);
    console.log('Extracted image URLs:', imageUrls);
    console.log('=== END EQUIPMENT IMAGES FETCH ===');
    
    return imageUrls;
  } catch (err) {
    console.error('Exception while fetching equipment images:', err);
    return [];
  }
};

export const uploadEquipmentImage = async (
  equipmentId: string,
  file: File,
  displayOrder: number,
  isPrimary: boolean = false
): Promise<string | null> => {
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${equipmentId}-${displayOrder}.${fileExt}`;
    const filePath = `equipment-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('equipment-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    // Save to database
    const { error: dbError } = await supabase
      .from('equipment_images')
      .insert({
        equipment_id: equipmentId,
        image_url: imageUrl,
        display_order: displayOrder,
        is_primary: isPrimary
      });

    if (dbError) {
      console.error('Error saving image to database:', dbError);
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error('Exception uploading equipment image:', error);
    return null;
  }
};

export const deleteEquipmentImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Delete from database first
    const { error: dbError } = await supabase
      .from('equipment_images')
      .delete()
      .eq('image_url', imageUrl);

    if (dbError) {
      console.error('Error deleting image from database:', dbError);
      return false;
    }

    // Extract file path from URL and delete from storage
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `equipment-images/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('equipment-images')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting equipment image:', error);
    return false;
  }
};
