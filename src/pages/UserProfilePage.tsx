
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { useProfileImageHandlers } from "@/hooks/useProfileImageHandlers";
import { useHeroImageHandlers } from "@/hooks/useHeroImageHandlers";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { ProfileFormSection } from "@/components/profile/ProfileFormSection";
import { PasswordChangeSection } from "@/components/profile/PasswordChangeSection";
import { HeroImageSection } from "@/components/profile/HeroImageSection";

const UserProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isDeletingHeroImage, setIsDeletingHeroImage] = useState(false);

  const {
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
    website,
    setWebsite,
    profileImage,
    setProfileImage,
    heroImage,
    setHeroImage,
    profileLoaded,
  } = useProfileData();

  const { isUpdating, handleUpdateProfile } = useProfileUpdate();

  const { handleImageUpload, handleDeletePhoto } = useProfileImageHandlers({
    user,
    profileImage,
    setProfileImage,
    setIsUploadingImage,
    setIsDeletingImage,
  });

  const { handleHeroImageUpload, handleDeleteHeroImage } = useHeroImageHandlers({
    user,
    heroImage,
    setHeroImage,
    setIsUploadingHeroImage,
    setIsDeletingHeroImage,
  });

  useEffect(() => {
    console.log("Profile page effect - auth status:", { isAuthenticated, isLoading, userId: user?.id });

    if (!isLoading && !isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateProfile({ name, email, role, phone, address, about, website });
  };

  if (isLoading || (!profileLoaded && isAuthenticated)) {
    return <ProfileLoadingSkeleton />;
  }

  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <ProfileFormSection
        profileImage={profileImage}
        name={name}
        email={email}
        role={role}
        phone={phone}
        address={address}
        about={about}
        website={website}
        isUploadingImage={isUploadingImage}
        isDeletingImage={isDeletingImage}
        isUpdating={isUpdating}
        userId={user?.id}
        onNameChange={setName}
        onEmailChange={setEmail}
        onRoleChange={setRole}
        onPhoneChange={setPhone}
        onAddressChange={setAddress}
        onAboutChange={setAbout}
        onWebsiteChange={setWebsite}
        onImageUpload={handleImageUpload}
        onDeletePhoto={handleDeletePhoto}
        onSubmit={onUpdateProfile}
      />

      <PasswordChangeSection />

      <HeroImageSection
        heroImage={heroImage}
        role={role}
        isUploadingHeroImage={isUploadingHeroImage}
        isDeletingHeroImage={isDeletingHeroImage}
        onHeroImageUpload={handleHeroImageUpload}
        onDeleteHeroImage={handleDeleteHeroImage}
      />
    </div>
  );
};

export default UserProfilePage;
