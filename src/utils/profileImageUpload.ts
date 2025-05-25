
import { supabase } from "@/integrations/supabase/client";

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  // Create a unique filename for the profile image
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

  console.log('Uploading profile image to profile-images bucket:', fileName);

  // Upload the file to Supabase storage in the profile-images bucket
  const { data, error } = await supabase.storage
    .from('profile-images')
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
    .from('profile-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const deleteProfileImage = async (imageUrl: string, userId: string): Promise<void> => {
  // Extract the file path from the URL
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'profile-images');
  
  if (bucketIndex === -1) {
    console.log('Image is not from profile-images bucket, skipping deletion');
    return;
  }

  const filePath = urlParts.slice(bucketIndex + 1).join('/');
  
  console.log('Deleting profile image from profile-images bucket:', filePath);

  // Delete the file from Supabase storage
  const { error } = await supabase.storage
    .from('profile-images')
    .remove([filePath]);

  if (error) {
    console.error('Profile image deletion error:', error);
    // Don't throw error for deletion failures - just log it
  } else {
    console.log('Profile image deleted successfully');
  }
};

export const generateDicebearAvatar = (userId: string): string => {
  return `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`;
};
