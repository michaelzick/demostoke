
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDicebearAvatar } from "@/utils/profileImageUpload";
import { useAuth } from "@/helpers";

export const useProfileData = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('name, role, avatar_url, hero_image_url, phone, address')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('No profile found, using defaults');
        setName(user.name || "");
        setRole("private-party");
        setPhone("");
        setAddress("");
        setProfileImage(generateDicebearAvatar(user.id));
        setHeroImage(null);
      } else {
        setName(profileData.name || "");
        setRole(profileData.role || "private-party");
        setPhone(profileData.phone || "");
        setAddress(profileData.address || "");
        // Use avatar_url for profile image, fallback to dicebear if not set
        const avatarUrl = profileData.avatar_url || generateDicebearAvatar(user.id);
        console.log('Setting profile image from avatar_url:', avatarUrl);
        setProfileImage(avatarUrl);
        setHeroImage(profileData.hero_image_url);
      }

      setEmail(user.email || "");
      setProfileLoaded(true);
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      setName(user.name || "");
      setEmail(user.email || "");
      setRole("private-party");
      setPhone("");
      setAddress("");
      setProfileImage(generateDicebearAvatar(user.id));
      setHeroImage(null);
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  return {
    name,
    setName,
    email,
    setEmail,
    role,
    setRole,
    phone,
    setPhone,
    address,
    setAddress,
    profileImage,
    setProfileImage,
    heroImage,
    setHeroImage,
    profileLoaded,
    fetchProfileData,
  };
};
