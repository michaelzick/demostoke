
import { useEffect, useState } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useParams } from "react-router-dom";
import { useUserProfileBySlug } from "@/hooks/useUserProfileBySlug";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { useMockUserProfileBySlug } from "@/hooks/useMockUserProfileBySlug";
import { useMockUserStats } from "@/hooks/useMockUserStats";
import { useMockData } from "@/hooks/useMockData";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useAuth } from "@/helpers";
import { Badge } from "@/components/ui/badge";
import { UserProfileHeader } from "@/components/profile/UserProfileHeader";
import { UserProfileSidebar } from "@/components/profile/UserProfileSidebar";
import { UserEquipmentGrid } from "@/components/profile/UserEquipmentGrid";
import { UserProfileLoading } from "@/components/profile/UserProfileLoading";
import { UserProfileNotFound } from "@/components/profile/UserProfileNotFound";
import { slugify } from "@/utils/slugify";
import type { UserProfile } from "@/types";
import type { UserEquipment } from "@/types/equipment";

const RealUserProfilePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { slug } = useParams();
  const { user } = useAuth();
  
  // Use React Query profile data if viewing own profile
  const { data: dbProfile, isLoading: profileLoading, error: profileError } = useUserProfileBySlug(slug || "");
  const profileId = dbProfile?.id;
  const isOwnProfile = user?.id === profileId;
  const { data: ownProfileData, refetch: refetchOwnProfile } = useProfileQuery();

  // Fetch stats and equipment once we know the profile ID
  const { data: dbStats, isLoading: statsLoading } = useUserStats(profileId || "");
  // Only show visible equipment on public profiles (visibleOnly = true for other users, false for own profile)
  const { data: dbUserEquipment, isLoading: equipmentLoading } = useUserEquipment(profileId || "", !isOwnProfile);

  // Fallback to mock data if database query fails or returns null
  const mockProfile = useMockUserProfileBySlug(slug || "");
  const mockStats = useMockUserStats(profileId || slug || "");
  const { mockEquipment } = useMockData();

  // Refetch own profile data when navigating to own profile page
  useEffect(() => {
    if (isOwnProfile && ownProfileData) {
      refetchOwnProfile();
    }
  }, [isOwnProfile, profileId, refetchOwnProfile]);

  // Determine if we should use mock data
  const isMockUser = !profileLoading && (profileError || !dbProfile) && !!mockProfile;
  
  // Use the correct profile data - prioritize own profile data for current user
  let profile: UserProfile | undefined;
  if (isOwnProfile && ownProfileData) {
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
  } else if (isMockUser) {
    profile = mockProfile;
  } else {
    profile = dbProfile as UserProfile | undefined;
  }

  const stats = isMockUser ? mockStats : dbStats;
  
  // For mock users, filter visible equipment; for real users, visibility is already handled by the hook
  const userEquipment = isMockUser
    ? mockEquipment.filter(item => slugify(item.owner.name) === slug) // Mock data doesn't have visibility field, so show all
    : dbUserEquipment;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = [
    ...new Set((userEquipment || []).map((item) => item.category)),
  ];
  const filteredEquipment = (userEquipment || []).filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory,
  );

  const isLoading = isMockUser ? false : (profileLoading || statsLoading);

  const profileName = profile?.name;

  usePageMetadata({
    title: profileName ? `User Profile | ${profileName}` : 'User Profile | DemoStoke',
    description: 'View rider profiles and their listed gear on DemoStoke.'
  });

  if (isLoading) {
    return <UserProfileLoading />;
  }

  if (!profile) {
    return <UserProfileNotFound />;
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
              {userEquipment && <Badge variant="outline">{userEquipment.length} items</Badge>}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <UserEquipmentGrid
              userEquipment={filteredEquipment as UserEquipment[]}
              owner={owner}
              stats={stats}
              isLoading={equipmentLoading}
              isMockUser={isMockUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealUserProfilePage;
