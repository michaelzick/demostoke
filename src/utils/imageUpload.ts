
import { supabase } from "@/integrations/supabase/client";

export const uploadGearImage = async (file: File, userId: string): Promise<string> => {
  // Create a unique filename with user ID folder structure
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  console.log('Uploading image:', fileName);

  // Upload the file to Supabase storage
  const { data, error } = await supabase.storage
    .from('gear-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  console.log('Upload successful:', data);

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('gear-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};
