
import { useEffect, useState } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfileBySlug } from "@/hooks/useUserProfileBySlug";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useAuth } from "@/helpers";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import CategorySelect from "@/components/CategorySelect";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { UserProfileSidebar } from "@/components/profile/UserProfileSidebar";
import { UserEquipmentGrid } from "@/components/profile/UserEquipmentGrid";
import { UserProfileLoading } from "@/components/profile/UserProfileLoading";
import { UserProfileNotFound } from "@/components/profile/UserProfileNotFound";
import { ProfileFormSection } from "@/components/profile/ProfileFormSection";
import { PasswordChangeSection } from "@/components/profile/PasswordChangeSection";
import { HeroImageSection } from "@/components/profile/HeroImageSection";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { useProfileImageHandlers } from "@/hooks/useProfileImageHandlers";
import { useHeroImageHandlers } from "@/hooks/useHeroImageHandlers";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { slugify } from "@/utils/slugify";
import type { UserProfile } from "@/types";
import type { UserEquipment } from "@/types/equipment";

const RealUserProfilePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { slug } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isDeletingHeroImage, setIsDeletingHeroImage] = useState(false);
  
  // Use React Query profile data if viewing own profile
  const { data: dbProfile, isLoading: profileLoading, error: profileError } = useUserProfileBySlug(slug || "");
  const profileId = dbProfile?.id;
  const isOwnProfile = user?.id === profileId;
  const { data: ownProfileData, refetch: refetchOwnProfile } = useProfileQuery();

  // Fetch stats and equipment once we know the profile ID
  const { data: dbStats, isLoading: statsLoading } = useUserStats(profileId || "");
  // Only show visible equipment on public profiles (visibleOnly = true for other users, false for own profile)
  const { data: dbUserEquipment, isLoading: equipmentLoading } = useUserEquipment(profileId || "", !isOwnProfile);

  // Profile editing hooks (only for own profile, and only when needed)
  const profileData = isOwnProfile ? useProfileData() : {
    name: '', setName: () => {}, email: '', setEmail: () => {}, 
    phone: '', setPhone: () => {}, address: '', setAddress: () => {},
    about: '', setAbout: () => {}, website: '', setWebsite: () => {},
    displayRole: '', setDisplayRole: () => {}, profileImage: null, setProfileImage: () => {},
    heroImage: null, setHeroImage: () => {}, profileLoaded: true
  };
  
  const {
    name, setName, email, setEmail, phone, setPhone, address, setAddress,
    about, setAbout, website, setWebsite, displayRole, setDisplayRole,
    profileImage, setProfileImage, heroImage, setHeroImage, profileLoaded
  } = profileData;

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


  // Refetch own profile data when navigating to own profile page
  useEffect(() => {
    if (isOwnProfile && ownProfileData) {
      refetchOwnProfile();
    }
  }, [isOwnProfile, profileId, refetchOwnProfile]);

  // Authentication check for unauthenticated users trying to edit
  useEffect(() => {
    if (!authLoading && !isAuthenticated && isEditMode) {
      navigate("/auth/signin");
      return;
    }
  }, [user, isAuthenticated, authLoading, navigate, isEditMode]);

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateProfile({
      name,
      email,
      phone,
      address,
      about,
      website,
      displayRole,
    });
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  
  // Use the correct profile data - prioritize own profile data for current user
  let profile: UserProfile | undefined;
  if (isOwnProfile && ownProfileData) {
    console.log('Using own profile data, displayRole:', ownProfileData.displayRole);
    profile = {
      id: user.id,
      name: ownProfileData.name,
      email: ownProfileData.email,
      avatar_url: ownProfileData.profileImage,
      hero_image_url: ownProfileData.heroImage,
      displayRole: ownProfileData.displayRole,
      about: ownProfileData.about,
      phone: ownProfileData.phone,
      address: ownProfileData.address,
      location_lat: ownProfileData.location_lat,
      location_lng: ownProfileData.location_lng,
      website: ownProfileData.website, // Include website field
      member_since: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as UserProfile;
  } else {
    console.log('Using db profile data, displayRole:', dbProfile?.displayRole);
    profile = dbProfile as UserProfile | undefined;
  }

  const stats = dbStats;
  const userEquipment = dbUserEquipment;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = [
    ...new Set((userEquipment || []).map((item) => item.category)),
  ] as string[];
  const filteredEquipment = (userEquipment || []).filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory,
  );

  const isLoading = profileLoading || statsLoading;
  const isEditLoading = (authLoading || (!profileLoaded && isAuthenticated)) && isEditMode;

  const profileName = profile?.name;

  usePageMetadata({
    title: profileName ? `User Profile | ${profileName}` : 'User Profile | DemoStoke',
    description: 'View rider profiles and their listed gear on DemoStoke.'
  });

  if (isLoading) {
    return <UserProfileLoading />;
  }

  if (isEditLoading) {
    return <ProfileLoadingSkeleton />;
  }

  if (!profile) {
    return <UserProfileNotFound />;
  }

  // Show edit mode for own profile
  if (isOwnProfile && isEditMode) {
    return (
      <div className="container max-w-3xl py-10 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <Button variant="outline" onClick={handleToggleEditMode}>
            View Profile
          </Button>
        </div>
        
        <ProfileFormSection
          profileImage={profileImage}
          name={name}
          email={email}
          displayRole={displayRole}
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
          onPhoneChange={setPhone}
          onAddressChange={setAddress}
          onAboutChange={setAbout}
          onWebsiteChange={setWebsite}
          onDisplayRoleChange={setDisplayRole}
          onImageUpload={handleImageUpload}
          onDeletePhoto={handleDeletePhoto}
          onSubmit={onUpdateProfile}
        />

        <PasswordChangeSection />

        <HeroImageSection
          heroImage={heroImage}
          isUploadingHeroImage={isUploadingHeroImage}
          isDeletingHeroImage={isDeletingHeroImage}
          onHeroImageUpload={handleHeroImageUpload}
          onDeleteHeroImage={handleDeleteHeroImage}
        />
      </div>
    );
  }

  const memberSinceDate = new Date(profile.created_at || profile.member_since).getFullYear();

  const owner = {
    id: profile.id,
    name: profile.name,
    imageUrl: profile.avatar_url || '',
    rating: stats?.averageRating || 0,
    reviewCount: stats?.totalReviews || 0,
    responseRate: 95,
    website: profile.website || undefined,
  };

  return (
    <div className="min-h-screen">
      <UserProfileHeader 
        profile={profile} 
        stats={stats} 
        memberSinceDate={memberSinceDate} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfileSidebar 
              profile={profile} 
              stats={stats} 
              memberSinceDate={memberSinceDate} 
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Equipment</h2>
              <div className="flex items-center gap-2">
                {userEquipment && <Badge variant="outline">{userEquipment.length} items</Badge>}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" onClick={handleToggleEditMode}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-4">
                <CategorySelect
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                  categories={categories}
                />
              </div>
            </div>

            <UserEquipmentGrid
              userEquipment={filteredEquipment as UserEquipment[]}
              owner={owner}
              stats={stats}
              isLoading={equipmentLoading}
              isMockUser={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealUserProfilePage;
