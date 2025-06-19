
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
        .select('address, location_lat, location_lng')
        .eq('id', user.id)
        .single();

      const addressChanged = currentProfile?.address !== profileData.address;
      console.log('🏠 Address changed:', addressChanged);
      console.log('🏠 Old address:', currentProfile?.address);
      console.log('🏠 New address:', profileData.address);

      // Prepare update data
      const updateData: any = {
        name: profileData.name,
        role: profileData.role,
        phone: profileData.phone,
        address: profileData.address,
        about: profileData.about,
      };

      // Handle address changes and geocoding
      if (addressChanged) {
        if (profileData.address.trim()) {
          console.log('🌍 Attempting to geocode new address:', profileData.address);
          const coordinates = await geocodeAddress(profileData.address);
          
          if (coordinates) {
            console.log('✅ Geocoding successful:', coordinates);
            updateData.location_lat = coordinates.lat;
            updateData.location_lng = coordinates.lng;
          } else {
            console.log('❌ Geocoding failed for address:', profileData.address);
            // Clear coordinates if geocoding fails
            updateData.location_lat = null;
            updateData.location_lng = null;
          }
        } else {
          console.log('🧹 Address cleared, removing coordinates');
          // Clear coordinates if address was cleared
          updateData.location_lat = null;
          updateData.location_lng = null;
        }
      }

      console.log('💾 Update data being sent to database:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully');

      // Invalidate profile query to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });

      if (emailChanged) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated. Please check your email to confirm the email change.",
        });
      } else {
        const hasCoordinates = updateData.location_lat && updateData.location_lng;
        toast({
          title: "Profile updated",
          description: hasCoordinates 
            ? "Your profile has been updated and your address has been geocoded for map display."
            : addressChanged 
            ? "Your profile has been updated. Address geocoding failed - you may not appear on the map."
            : "Your profile has been updated successfully.",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'There was an error updating your profile.';
      console.error('❌ Profile update error:', errorMessage);
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
