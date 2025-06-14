
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadProfileImage, deleteProfileImage, generateDicebearAvatar } from "@/utils/profileImageUpload";

interface UseProfileImageHandlersProps {
  user: any;
  profileImage: string | null;
  setProfileImage: (url: string) => void;
  setIsUploadingImage: (loading: boolean) => void;
  setIsDeletingImage: (loading: boolean) => void;
}

export const useProfileImageHandlers = ({
  user,
  profileImage,
  setProfileImage,
  setIsUploadingImage,
  setIsDeletingImage,
}: UseProfileImageHandlersProps) => {
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      console.log('Starting image upload for user:', user.id);
      
      // Delete old hero image if it exists and is from profile-images bucket
      if (profileImage && profileImage.includes('profile-images') && !profileImage.includes('dicebear.com')) {
        console.log('Deleting old image:', profileImage);
        await deleteProfileImage(profileImage, user.id);
      }

      // Upload the new image
      console.log('Uploading new image');
      const imageUrl = await uploadProfileImage(file, user.id);
      console.log('Upload successful, URL:', imageUrl);

      // Update the hero_image_url in the database
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          hero_image_url: imageUrl,
          name: user.name || '',
          role: 'private-party'
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state
      setProfileImage(imageUrl);

      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error: unknown) {
      console.error('Error uploading profile image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      toast({
        title: "Error uploading image",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback to dicebear avatar on error
      const fallbackAvatar = generateDicebearAvatar(user.id);
      setProfileImage(fallbackAvatar);

      // Update database with fallback avatar
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          hero_image_url: fallbackAvatar,
          name: user.name || '',
          role: 'private-party'
        }, {
          onConflict: 'id'
        });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user) return;

    setIsDeletingImage(true);

    try {
      // Delete the current hero image if it exists and is from profile-images bucket
      if (profileImage && profileImage.includes('profile-images') && !profileImage.includes('dicebear.com')) {
        await deleteProfileImage(profileImage, user.id);
      }

      // Generate a new dicebear avatar
      const fallbackAvatar = generateDicebearAvatar(user.id);

      // Update the hero_image_url in the database
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          hero_image_url: fallbackAvatar,
          name: user.name || '',
          role: 'private-party'
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update local state
      setProfileImage(fallbackAvatar);

      toast({
        title: "Profile image deleted",
        description: "Your profile image has been removed and replaced with a default avatar.",
      });
    } catch (error: unknown) {
      console.error('Error deleting profile image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image. Please try again.';
      toast({
        title: "Error deleting image",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingImage(false);
    }
  };

  return {
    handleImageUpload,
    handleDeletePhoto,
  };
};
