import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { useMockUserProfile } from "@/hooks/useMockUserProfile";
import { useMockUserStats } from "@/hooks/useMockUserStats";
import { useMockData } from "@/hooks/useMockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon, CalendarIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const RealUserProfilePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();

  // Try to fetch from database first
  const { data: dbProfile, isLoading: profileLoading, error: profileError } = useUserProfile(id || "");
  const { data: dbStats, isLoading: statsLoading } = useUserStats(id || "");
  const { data: dbUserEquipment, isLoading: equipmentLoading } = useUserEquipment(id || "");

  // Fallback to mock data if database query fails or returns null
  const mockProfile = useMockUserProfile(id || "");
  const mockStats = useMockUserStats(id || "");
  const { mockEquipment } = useMockData();

  // Determine if we should use mock data
  const isMockUser = !profileLoading && (profileError || !dbProfile) && mockProfile;
  
  // Use appropriate data source
  const profile = isMockUser ? mockProfile : dbProfile;
  const stats = isMockUser ? mockStats : dbStats;
  const userEquipment = isMockUser ? mockEquipment.filter(item => item.owner.id === id) : dbUserEquipment;
  const isLoading = isMockUser ? false : (profileLoading || statsLoading);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-24"></div>
              <div className="px-6 pb-6 relative">
                <Skeleton className="h-24 w-24 rounded-full absolute -mt-12" />
                <div className="pt-16 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </Card>
          </div>
          <div className="w-full md:w-2/3">
            <Skeleton className="h-6 w-20 mb-4" />
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-6">
            This user profile doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const memberSinceDate = new Date(profile.created_at || profile.member_since).getFullYear();

  const equipmentSection = (
    <div>
      {equipmentLoading && !isMockUser ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !userEquipment || userEquipment.length === 0 ? (
        <p className="text-muted-foreground dark:text-white">No gear currently listed.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEquipment.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image_url || item.imageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium dark:text-white">{item.name}</h3>
                  <span className="font-medium text-primary">${item.price_per_day || item.pricePerDay}/day</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {stats && stats.totalReviews > 0 ? (
                    <div className="flex items-center text-xs">
                      <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{stats.averageRating} ({stats.totalReviews})</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">No reviews yet</div>
                  )}
                  <Button variant="outline" size="sm" asChild className="text-xs h-8">
                    <Link to={`/equipment/${item.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (profile.role === 'private-party') {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ""} />
                <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <div className="flex items-center gap-4 mb-2">
                  {stats && stats.totalReviews > 0 && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-medium">{stats.averageRating}</span>
                    </div>
                  )}
                  {stats && (
                    <Badge variant="secondary">{stats.responseRate}% response rate</Badge>
                  )}
                  <Badge variant="outline">Private Party</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Member since {memberSinceDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircleIcon className="h-5 w-5" />
                    About {profile.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                    {profile.about || `Hi, I'm ${profile.name?.split(" ")[0] || 'User'}! I love sharing my gear with others and helping them enjoy their adventures.`}
                  </div>
                  <Separator />
                  <div className="space-y-3 pt-4 border-t">
                    {stats && (
                      <div className="flex justify-between">
                        <span className="font-medium">Response Rate</span>
                        <span>{stats.responseRate}%</span>
                      </div>
                    )}
                    {stats && stats.totalReviews > 0 && (
                      <div className="flex justify-between">
                        <span className="font-medium">Rating</span>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>{stats.averageRating}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Member Since</span>
                      <span>{memberSinceDate}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" disabled>
                    <MessageCircleIcon className="h-4 w-4 mr-2" />
                    Contact {profile.name}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Available Equipment</h2>
                {userEquipment && <Badge variant="outline">{userEquipment.length} items</Badge>}
              </div>
              {equipmentSection}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Shop template
    return (
      <div className="min-h-screen">
        <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80')` }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ""} />
                <AvatarFallback>{profile.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                {stats && stats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg">{stats.averageRating}</span>
                    <span className="text-gray-300">({stats.totalReviews} reviews)</span>
                  </div>
                )}
                <p className="text-sm mb-2">Est. {memberSinceDate}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {profile.role === 'retail-store' ? 'Retail Store' :
                     profile.role === 'builder' ? 'Builder' :
                     profile.role === 'retail-website' ? 'Retail Website' : 'Business'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>About {profile.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                    {profile.about || "This user has not provided an 'about' section."}
                  </div>
                  <Separator />
                  <div className="space-y-3 pt-4 border-t text-sm text-muted-foreground">
                    Contact information not available. To add contact details, please update your profile settings.
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Available Equipment</h2>
                {userEquipment && <Badge variant="outline">{userEquipment.length} items</Badge>}
              </div>
              {equipmentSection}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default RealUserProfilePage;
