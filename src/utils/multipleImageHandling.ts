
import { supabase } from "@/integrations/supabase/client";

export const fetchEquipmentImages = async (
  equipmentId: string,
): Promise<string[]> => {
  console.log('=== FETCHING EQUIPMENT IMAGES ===');
  console.log('Equipment ID for image fetch:', equipmentId);

  try {
    const { data, error } = await supabase
      .from('equipment_images')
      .select('image_url, display_order, is_primary')
      .eq('equipment_id', equipmentId)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching equipment images:', error);
      return [];
    }

    console.log('Raw equipment_images data:', data);
    console.log('Number of images found:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('No images found in equipment_images table');
      return [];
    }

    const imageUrls = data.map((img) => img.image_url);
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

export const uploadMultipleGearImages = async (
  files: File[],
  userId: string,
  onProgress?: (message: string) => void
): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(`Uploading image ${i + 1} of ${files.length}...`);
    
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}-${i}.${fileExt}`;
      const filePath = `equipment-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get public URL
      const { data } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    } catch (error) {
      console.error('Exception uploading image:', error);
      throw error;
    }
  }

  return uploadedUrls;
};

export const saveEquipmentImages = async (
  equipmentId: string,
  imageUrls: string[]
): Promise<void> => {
  try {
    // Delete existing images for this equipment
    const { error: deleteError } = await supabase
      .from('equipment_images')
      .delete()
      .eq('equipment_id', equipmentId);

    if (deleteError) {
      console.error('Error deleting existing images:', deleteError);
      throw new Error(`Failed to delete existing images: ${deleteError.message}`);
    }

    // Insert new images
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        equipment_id: equipmentId,
        image_url: url,
        display_order: index,
        is_primary: index === 0
      }));

      const { error: insertError } = await supabase
        .from('equipment_images')
        .insert(imageRecords);

      if (insertError) {
        console.error('Error inserting new images:', insertError);
        throw new Error(`Failed to save images: ${insertError.message}`);
      }
    }
  } catch (error) {
    console.error('Exception saving equipment images:', error);
    throw error;
  }
};

export const updateEquipmentImages = async (
  equipmentId: string,
  imageUrls: string[],
  mergeWithExisting: boolean = false
): Promise<void> => {
  if (mergeWithExisting) {
    // Get existing images first
    const existingImages = await fetchEquipmentImages(equipmentId);
    
    // Create a set for deduplication
    const existingSet = new Set(existingImages);
    const newUrls = imageUrls.filter(url => !existingSet.has(url));
    
    // Merge existing with new images
    const finalUrls = [...existingImages, ...newUrls];
    
    console.log('Merging images:', { existing: existingImages, new: newUrls, final: finalUrls });
    await saveEquipmentImages(equipmentId, finalUrls);
  } else {
    // Replace all images as before
    await saveEquipmentImages(equipmentId, imageUrls);
  }
};
