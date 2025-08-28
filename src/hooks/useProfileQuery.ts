
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateRoleBasedAvatar } from "@/utils/profileImageUpload";
import { useAuth } from "@/helpers";

export const useProfileQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchProfileData = async () => {
    if (!user?.id) throw new Error("No user found");

    try {
      // First get the current email from auth.users table
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const currentEmail = authData?.user?.email || user.email || "";

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, hero_image_url, phone, address, about, website, location_lat, location_lng, show_phone, show_address, show_website, show_location, privacy_acknowledgment')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('No profile found, using defaults');
        return {
          name: user.name || "",
          email: currentEmail,
          displayRole: "retail-store",
          phone: "",
          address: "",
          location_lat: null,
          location_lng: null,
          about: null,
          website: "",
          profileImage: generateRoleBasedAvatar(user.id, 'retail-store'),
          heroImage: null,
          show_phone: true,
          show_address: true,
          show_website: true,
          show_location: true,
          privacy_acknowledgment: false,
        };
      }

      // Use avatar_url for profile image, fallback to dicebear if not set
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('display_role')
        .eq('user_id', user.id)
        .single();

      const displayRole = roleRow?.display_role || "retail-store";
      const avatarUrl = profileData.avatar_url || generateRoleBasedAvatar(user.id, displayRole);
      console.log('Setting profile image from avatar_url:', avatarUrl);

      return {
        name: profileData.name || "",
        email: currentEmail, // Use the current email from auth
        displayRole: displayRole,
        phone: profileData.phone || "",
        address: profileData.address || "",
        location_lat: profileData.location_lat,
        location_lng: profileData.location_lng,
        about: profileData.about,
        website: profileData.website || "",
        profileImage: avatarUrl,
        heroImage: profileData.hero_image_url,
        show_phone: profileData.show_phone ?? true,
        show_address: profileData.show_address ?? true,
        show_website: profileData.show_website ?? true,
        show_location: profileData.show_location ?? true,
        privacy_acknowledgment: profileData.privacy_acknowledgment ?? false,
      };
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      // Fallback to current email from auth
      const { data: authData } = await supabase.auth.getUser();
      const currentEmail = authData?.user?.email || user.email || "";
      
      return {
        name: user.name || "",
        email: currentEmail,
        displayRole: "retail-store",
        phone: "",
        address: "",
        location_lat: null,
        location_lng: null,
        about: null,
        website: "",
        profileImage: generateRoleBasedAvatar(user.id, 'retail-store'),
        heroImage: null,
        show_phone: true,
        show_address: true,
        show_website: true,
        show_location: true,
        privacy_acknowledgment: false,
      };
    }
  };

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfileData,
    enabled: !!user?.id,
    staleTime: 0, // Force fresh data to avoid caching issues with role changes
    refetchOnWindowFocus: true,
  });

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return {
    ...query,
    invalidateProfile,
  };
};
