
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

export const generateRoleBasedAvatar = (userId: string, displayRole: string = 'retail-store'): string => {
  const iconMap = {
    'retail-store': 'store',
    'builder': 'hammer', 
    'private-party': 'user'
  };
  
  const iconName = iconMap[displayRole as keyof typeof iconMap] || 'store';
  
  // Use static colors that work in data URI SVGs
  const backgroundColor = '#f1f5f9'; // Light gray background
  const iconColor = '#334155'; // Dark gray for icon
  
  // Generate SVG with lucide icon based on role
  // Using a 24x24 viewBox ensures the icon scales to fill the avatar container
  // just like uploaded profile images
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="12" fill="${backgroundColor}"/>
    ${getSvgPath(iconName, iconColor)}
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const getSvgPath = (iconName: string, color: string): string => {
  const paths = {
    'store': `<path d="M2 7v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7m-8 4v6m-4-6v6m8-10V3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v4" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    'hammer': `<path d="m15 12-8.5-8.5c-.83-.83-2.17-.83-3 0 0 0 0 0 0 0l-2.5 2.5c-.83.83-.83 2.17 0 3l8.5 8.5 2-2Zm-7 4 3-3 4 4-3 3-4-4Z" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    'user': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  };
  return paths[iconName as keyof typeof paths] || paths.store;
};
