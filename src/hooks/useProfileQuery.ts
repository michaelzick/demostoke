
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
        .select('name, avatar_url, hero_image_url, phone, address, about, website, location_lat, location_lng')
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
