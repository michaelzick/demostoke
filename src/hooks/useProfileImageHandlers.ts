
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadProfileImage, deleteProfileImage, generateRoleBasedAvatar } from "@/utils/profileImageUpload";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types";

interface UseProfileImageHandlersProps {
  user: User | null;
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
  const queryClient = useQueryClient();

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
      console.log('Starting profile image upload for user:', user.id);
      
      // First, get the current profile data to preserve existing values
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current profile:', fetchError);
      }

      // Delete old profile image if it exists and is from profile-images bucket
      if (profileImage && profileImage.includes('profile-images') && !profileImage.includes('dicebear.com')) {
        console.log('Deleting old profile image:', profileImage);
        await deleteProfileImage(profileImage, user.id);
      }

      // Upload the new image
      console.log('Uploading new profile image');
      const imageUrl = await uploadProfileImage(file, user.id);
      console.log('Upload successful, URL:', imageUrl);

      // Update the avatar_url in the database while preserving existing role and name
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: imageUrl,
          name: currentProfile?.name || user.name || ''
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state
      setProfileImage(imageUrl);

      // Invalidate profile query to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

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

      // Fallback to role-based avatar on error
      const fallbackAvatar = generateRoleBasedAvatar(user.id, 'retail-store');
      setProfileImage(fallbackAvatar);

      // Update database with fallback avatar, preserving existing data
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: fallbackAvatar,
          name: currentProfile?.name || user.name || ''
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
      // First, get the current profile data to preserve existing values
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current profile:', fetchError);
      }

      // Delete the current profile image if it exists and is from profile-images bucket
      if (profileImage && profileImage.includes('profile-images') && !profileImage.includes('dicebear.com')) {
        await deleteProfileImage(profileImage, user.id);
      }

      // Generate a new role-based avatar
      const fallbackAvatar = generateRoleBasedAvatar(user.id, 'retail-store');

      // Update the avatar_url in the database while preserving existing role and name
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: fallbackAvatar,
          name: currentProfile?.name || user.name || ''
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Update local state
      setProfileImage(fallbackAvatar);

      // Invalidate profile query to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

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
