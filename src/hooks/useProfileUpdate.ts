
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useEmailChange } from "@/hooks/useEmailChange";
import { useQueryClient } from "@tanstack/react-query";
import { geocodeAddress } from "@/utils/geocoding";

export const useProfileUpdate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { handleEmailChange, isChangingEmail } = useEmailChange();
  const queryClient = useQueryClient();

  const handleUpdateProfile = async (profileData: {
    name: string;
    email: string;
    role: string;
    phone: string;
    address: string;
    about: string;
  }) => {
    if (!user) return;

    setIsUpdating(true);

    try {
      // Get the current email from auth to compare
      const { data: authData } = await supabase.auth.getUser();
      const currentEmail = authData?.user?.email || user.email || "";
      
      // Check if email has changed
      const emailChanged = profileData.email !== currentEmail;
      
      if (emailChanged) {
        const emailChangeSuccess = await handleEmailChange(profileData.email, currentEmail);
        if (!emailChangeSuccess) {
          setIsUpdating(false);
          return;
        }
      }

      // Get current profile to check if address changed
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .single();

      const addressChanged = currentProfile?.address !== profileData.address;
      let coordinates = null;

      // If address changed and is not empty, geocode it
      if (addressChanged && profileData.address.trim()) {
        console.log('Address changed, geocoding new address...');
        coordinates = await geocodeAddress(profileData.address);
        console.log('Geocoding result:', coordinates);
      }

      // Update profile data (including coordinates if geocoded)
      const updateData: any = {
        name: profileData.name,
        role: profileData.role,
        phone: profileData.phone,
        address: profileData.address,
        about: profileData.about,
      };

      // Add coordinates if we got them from geocoding
      if (coordinates) {
        updateData.location_lat = coordinates.lat;
        updateData.location_lng = coordinates.lng;
      } else if (addressChanged && !profileData.address.trim()) {
        // Clear coordinates if address was cleared
        updateData.location_lat = null;
        updateData.location_lng = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Invalidate profile query to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

      if (emailChanged) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated. Please check your email to confirm the email change.",
        });
      } else {
        toast({
          title: "Profile updated",
          description: coordinates 
            ? "Your profile has been updated and your address has been geocoded for map display."
            : "Your profile has been updated successfully.",
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
