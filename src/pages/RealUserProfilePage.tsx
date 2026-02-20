
import { useEffect, useState, useRef } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfileBySlug } from "@/hooks/useUserProfileBySlug";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useAuth } from "@/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Settings, X, EyeOff, Eye } from "lucide-react";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import CategorySelect from "@/components/CategorySelect";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { UserProfileSidebar } from "@/components/profile/UserProfileSidebar";
import { UserEquipmentGrid } from "@/components/profile/UserEquipmentGrid";
import { UserProfileLoading } from "@/components/profile/UserProfileLoading";
import { UserProfileNotFound } from "@/components/profile/UserProfileNotFound";
import { ProfileFormSection } from "@/components/profile/ProfileFormSection";
import { PasswordChangeSection } from "@/components/profile/PasswordChangeSection";
import { HeroImageSection } from "@/components/profile/HeroImageSection";
import { PrivacySettingsSection } from "@/components/profile/PrivacySettingsSection";
import { ProfileLoadingSkeleton } from "@/components/profile/ProfileLoadingSkeleton";
import { useProfileImageHandlers } from "@/hooks/useProfileImageHandlers";
import { useHeroImageHandlers } from "@/hooks/useHeroImageHandlers";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import useScrollToTop from "@/hooks/useScrollToTop";
import { useScrollToTopButton } from "@/hooks/useScrollToTopButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { UserProfile } from "@/types";
import type { UserEquipment } from "@/types/equipment";

const RealUserProfilePage = () => {
  // Scroll to top on mount
  useScrollToTop();

  const { slug } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const availableEquipmentRef = useRef<HTMLHeadingElement | null>(null);

  const handleAvailableClick = () => {
    if (availableEquipmentRef.current) {
      const header = document.querySelector('header.sticky') as HTMLElement | null;
      const headerHeight = header ? header.offsetHeight : 0;
      const top = availableEquipmentRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isDeletingHeroImage, setIsDeletingHeroImage] = useState(false);

  // Use React Query profile data if viewing own profile
  const { data: dbProfile, isLoading: profileLoading } = useUserProfileBySlug(slug || "");
  const profileId = dbProfile?.id;
  const isOwnProfile = user?.id === profileId;
  const { data: ownProfileData, refetch: refetchOwnProfile } = useProfileQuery();

  // Fetch stats and equipment once we know the profile ID
  const { data: dbStats, isLoading: statsLoading } = useUserStats(profileId || "");
  // Only show visible equipment on public profiles (visibleOnly = true for other users, false for own profile)
  const { data: dbUserEquipment, isLoading: equipmentLoading } = useUserEquipment(profileId || "", !isOwnProfile);

  // Profile editing hooks (always call hooks, but conditionally use data)
  const profileDataResult = useProfileData();
  const profileData = isOwnProfile ? profileDataResult : {
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

  // Scroll to top button
  const { showButton: showScrollButton, scrollToTop } = useScrollToTopButton({
    threshold: 300
  });


  // Refetch own profile data when navigating to own profile page
  useEffect(() => {
    if (isOwnProfile && ownProfileData) {
      refetchOwnProfile();
    }
  }, [isOwnProfile, profileId, refetchOwnProfile, ownProfileData]);

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

  const handleToggleVisibility = async () => {
    if (!profileId) return;
    const currentlyHidden = (dbProfile as any)?.is_hidden === true;
    const newValue = !currentlyHidden;
    
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ is_hidden: newValue })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update user visibility');
      return;
    }

    toast.success(newValue ? 'User hidden from site' : 'User is now visible on site');
    // Invalidate all relevant caches
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['userLocations'] });
    queryClient.invalidateQueries({ queryKey: ['featuredEquipment'] });
    queryClient.invalidateQueries({ queryKey: ['recentEquipment'] });
    queryClient.invalidateQueries({ queryKey: ['trendingEquipment'] });
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
  };


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
      show_phone: ownProfileData.show_phone,
      show_address: ownProfileData.show_address,
      show_website: ownProfileData.show_website,
      show_location: ownProfileData.show_location,
      privacy_acknowledgment: ownProfileData.privacy_acknowledgment,
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
  const [searchTerm, setSearchTerm] = useState("");
  const hasSearchText = searchTerm.length > 0;
  const categories = [
    ...new Set((userEquipment || []).map((item) => item.category)),
  ] as string[];
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredEquipment = (userEquipment || []).filter(
    (item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = normalizedSearchTerm === "" || [
        item.name,
        item.description,
        item.category,
        item.specifications?.size,
        item.specifications?.material,
        item.specifications?.suitable,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearchTerm);

      return matchesCategory && matchesSearch;
    },
  );
  const totalEquipmentCount = userEquipment?.length || 0;
  const hasActiveFilters = selectedCategory !== "all" || normalizedSearchTerm !== "";
  const emptyEquipmentMessage = totalEquipmentCount === 0
    ? "No gear currently listed."
    : `No gear matches "${searchTerm.trim()}". Try another model or clear your search.`;

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

        <PrivacySettingsSection
          userId={user?.id || ''}
          showPhone={profile?.show_phone ?? true}
          showAddress={profile?.show_address ?? true}
          showWebsite={profile?.show_website ?? true}
          showLocation={profile?.show_location ?? true}
          privacyAcknowledgment={profile?.privacy_acknowledgment ?? false}
          onPrivacyUpdate={() => {
            refetchOwnProfile();
          }}
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

  const isUserHidden = (dbProfile as any)?.is_hidden === true;

  return (
    <div className="min-h-screen">
      {/* Admin visibility toggle banner */}
      {isAdmin && !isOwnProfile && profileId && (
        <div className={`border-b px-4 py-3 flex items-center justify-between ${isUserHidden ? 'bg-destructive/10 border-destructive/20' : 'bg-muted border-border'}`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUserHidden ? (
                <EyeOff className="h-4 w-4 text-destructive" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {isUserHidden
                  ? 'This user and their gear are hidden from the site'
                  : 'This user and their gear are visible on the site'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {isUserHidden ? 'Hidden' : 'Visible'}
              </span>
              <Switch
                checked={!isUserHidden}
                onCheckedChange={handleToggleVisibility}
              />
            </div>
          </div>
        </div>
      )}

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
              isOwnProfile={isOwnProfile}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 ref={availableEquipmentRef} className="text-2xl font-bold">Available Equipment</h2>
              <div className="flex items-center gap-2">
                {userEquipment && (
                  <Badge variant="outline">
                    {hasActiveFilters
                      ? `${filteredEquipment.length} of ${totalEquipmentCount} items`
                      : `${totalEquipmentCount} items`}
                  </Badge>
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" onClick={handleToggleEditMode}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            {/* Mobile-only fixed button to jump to Available Equipment (mirrors Book Now pattern) */}
            <Button
              className="block lg:hidden fixed left-0 bottom-0 w-full z-40 rounded-none bg-primary text-primary-foreground font-semibold focus:outline-none h-12"
              onClick={handleAvailableClick}
              type="button"
              id="available-equipment-mobile-button"
            >
              Available Equipment
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex w-full sm:max-w-md gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search model name (e.g., Black Crows Camox)"
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!hasSearchText}
                  onClick={() => setSearchTerm("")}
                  className="h-10 px-3 shrink-0"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
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
              emptyMessage={emptyEquipmentMessage}
            />
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <ScrollToTopButton show={showScrollButton} onClick={scrollToTop} />
    </div>
  );
};

export default RealUserProfilePage;
