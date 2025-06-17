import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { useMockUserProfile } from "@/hooks/useMockUserProfile";
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
import type { UserProfile } from "@/types";

const RealUserProfilePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const { user } = useAuth();
  
  // Use React Query profile data if viewing own profile
  const isOwnProfile = user?.id === id;
  const { data: ownProfileData, refetch: refetchOwnProfile } = useProfileQuery();

  // Try to fetch from database first
  const { data: dbProfile, isLoading: profileLoading, error: profileError } = useUserProfile(id || "");
  const { data: dbStats, isLoading: statsLoading } = useUserStats(id || "");
  const { data: dbUserEquipment, isLoading: equipmentLoading } = useUserEquipment(id || "");

  // Fallback to mock data if database query fails or returns null
  const mockProfile = useMockUserProfile(id || "");
  const mockStats = useMockUserStats(id || "");
  const { mockEquipment } = useMockData();

  // Refetch own profile data when navigating to own profile page
  useEffect(() => {
    if (isOwnProfile && ownProfileData) {
      refetchOwnProfile();
    }
  }, [isOwnProfile, id, refetchOwnProfile]);

  // Determine if we should use mock data
  const isMockUser = !profileLoading && (profileError || !dbProfile) && !!mockProfile;
  
  // Use the correct profile data - prioritize own profile data for current user
  let profile: UserProfile | undefined;
  if (isOwnProfile && ownProfileData) {
    profile = {
      id: user.id,
      name: ownProfileData.name,
      avatar_url: ownProfileData.profileImage,
      hero_image_url: ownProfileData.heroImage,
      role: ownProfileData.role,
      about: ownProfileData.about,
      member_since: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as UserProfile;
  } else if (isMockUser) {
    profile = mockProfile;
  } else {
    profile = dbProfile as UserProfile | undefined;
  }

  const stats = isMockUser ? mockStats : dbStats;
  const userEquipment = isMockUser ? mockEquipment.filter(item => item.owner.id === id) : dbUserEquipment;
  const isLoading = isMockUser ? false : (profileLoading || statsLoading);

  if (isLoading) {
    return <UserProfileLoading />;
  }

  if (!profile) {
    return <UserProfileNotFound />;
  }

  const memberSinceDate = new Date(profile.created_at || profile.member_since).getFullYear();

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
            
            <UserEquipmentGrid 
              userEquipment={userEquipment} 
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
