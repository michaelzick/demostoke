
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadProfileImage, deleteProfileImage } from "@/utils/profileImageUpload";

interface UseHeroImageHandlersProps {
  user: any;
  heroImage: string | null;
  setHeroImage: (url: string | null) => void;
  setIsUploadingHeroImage: (loading: boolean) => void;
  setIsDeletingHeroImage: (loading: boolean) => void;
}

export const useHeroImageHandlers = ({
  user,
  heroImage,
  setHeroImage,
  setIsUploadingHeroImage,
  setIsDeletingHeroImage,
}: UseHeroImageHandlersProps) => {
  const { toast } = useToast();

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingHeroImage(true);

    try {
      console.log('Starting hero image upload for user:', user.id);
      
      // Delete old hero image if it exists and is from profile-images bucket
      if (heroImage && heroImage.includes('profile-images') && !heroImage.includes('dicebear.com')) {
        console.log('Deleting old hero image:', heroImage);
        await deleteProfileImage(heroImage, user.id);
      }

      // Upload the new hero image
      console.log('Uploading new hero image');
      const imageUrl = await uploadProfileImage(file, user.id);
      console.log('Hero image upload successful, URL:', imageUrl);

      // Update the hero_image_url in the database
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          hero_image_url: imageUrl,
          name: user.name || '',
          role: 'retail-store' // Default for business profiles
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state
      setHeroImage(imageUrl);

      toast({
        title: "Hero image updated",
        description: "Your hero image has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error('Error uploading hero image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload hero image. Please try again.';
      toast({
        title: "Error uploading hero image",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const handleDeleteHeroImage = async () => {
    if (!user) return;

    setIsDeletingHeroImage(true);

    try {
      // Delete the current hero image if it exists and is from profile-images bucket
      if (heroImage && heroImage.includes('profile-images') && !heroImage.includes('dicebear.com')) {
        await deleteProfileImage(heroImage, user.id);
      }

      // Update the hero_image_url in the database to null
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          hero_image_url: null,
          name: user.name || '',
          role: 'retail-store'
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update local state
      setHeroImage(null);

      toast({
        title: "Hero image removed",
        description: "Your hero image has been removed successfully.",
      });
    } catch (error: unknown) {
      console.error('Error deleting hero image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove hero image. Please try again.';
      toast({
        title: "Error removing hero image",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingHeroImage(false);
    }
  };

  return {
    handleHeroImageUpload,
    handleDeleteHeroImage,
  };
};
