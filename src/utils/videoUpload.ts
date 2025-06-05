
import { supabase } from "@/integrations/supabase/client";

export const uploadVideoToSupabase = async (file: File, fileName: string): Promise<string> => {
  console.log(`Uploading video: ${fileName}`);
  
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading video:', error);
    throw error;
  }

  console.log('Video uploaded successfully:', data);
  
  // Get the public URL for the uploaded video
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  return publicUrl;
};

export const getVideoUrl = (fileName: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);
  
  return publicUrl;
};

export const deleteVideoFromSupabase = async (fileName: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('videos')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting video:', error);
    throw error;
  }

  console.log('Video deleted successfully');
};
