
import { supabase } from "@/integrations/supabase/client";

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  // Create a unique filename for the profile image
  const fileExt = file.name.split('.').pop();
  const fileName = `profile-${userId}-${Date.now()}.${fileExt}`;

  console.log('Uploading profile image:', fileName);

  // Upload the file to Supabase storage
  const { data, error } = await supabase.storage
    .from('gear-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Allow overwriting existing files
    });

  if (error) {
    console.error('Profile image upload error:', error);
    throw new Error(`Failed to upload profile image: ${error.message}`);
  }

  console.log('Profile image upload successful:', data);

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('gear-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const generateDicebearAvatar = (userId: string): string => {
  return `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`;
};
