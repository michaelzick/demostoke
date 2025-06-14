
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseHeroImageUploadProps {
  userId: string | undefined;
  onUrl: (url: string) => void;
}

export function useHeroImageUpload({ userId, onUrl }: UseHeroImageUploadProps) {
  const { toast } = useToast();

  const uploadHeroImage = async (file: File) => {
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size 10MB.",
        variant: "destructive"
      });
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 4)}.${ext}`;
    
    try {
      const { data, error } = await supabase.storage
        .from("profile-images")
        .upload(path, file, { upsert: true });

      if (error) {
        toast({
          title: "Upload error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(data.path);
      
      if (urlData?.publicUrl) {
        onUrl(urlData.publicUrl);
        toast({
          title: "Hero image uploaded",
          description: "Image uploaded successfully."
        });
      }
    } catch (error) {
      console.error('Hero image upload error:', error);
      toast({
        title: "Upload error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { uploadHeroImage };
}
