
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useEmailChange } from "@/hooks/useEmailChange";

export const useProfileUpdate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { handleEmailChange, isChangingEmail } = useEmailChange();

  const handleUpdateProfile = async (profileData: {
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
  }) => {
    if (!user) return;

    setIsUpdating(true);

    try {
      // Check if email has changed
      const emailChanged = profileData.email !== user.email;
      
      if (emailChanged) {
        const emailChangeSuccess = await handleEmailChange(profileData.email, user.email || "");
        if (!emailChangeSuccess) {
          setIsUpdating(false);
          return;
        }
      }

      // Update profile data (excluding email as that's handled separately)
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          role: profileData.role,
          phone: profileData.phone,
          address: profileData.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      if (emailChanged) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated. Please check your email to confirm the email change.",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'There was an error updating your profile.';
      toast({
        title: "Error updating profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating: isUpdating || isChangingEmail,
    handleUpdateProfile,
  };
};
