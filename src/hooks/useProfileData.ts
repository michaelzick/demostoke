
import { useState, useEffect } from "react";
import { useProfileQuery } from "@/hooks/useProfileQuery";

export const useProfileData = () => {
  const { data: profileData, isLoading, refetch } = useProfileQuery();
  
  // Local state for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [about, setAbout] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  // Update local state when profileData changes
  useEffect(() => {
    if (profileData) {
      setName(profileData.name);
      setEmail(profileData.email);
      setRole(profileData.role);
      setPhone(profileData.phone);
      setAddress(profileData.address);
      setAbout(profileData.about || "");
      setProfileImage(profileData.profileImage);
      setHeroImage(profileData.heroImage);
    }
  }, [profileData]);

  const fetchProfileData = async () => {
    await refetch();
  };

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
    about,
    setAbout,
    profileImage,
    setProfileImage,
    heroImage,
    setHeroImage,
    profileLoaded: !isLoading,
    fetchProfileData,
  };
};
