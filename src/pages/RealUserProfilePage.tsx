
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserEquipment } from "@/hooks/useUserEquipment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon, MapPinIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const RealUserProfilePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();

  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(id || "");
  const { data: stats, isLoading: statsLoading } = useUserStats(id || "");
  const { data: userEquipment, isLoading: equipmentLoading } = useUserEquipment(id || "");

  if (profileLoading) {
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

  if (profileError || !profile) {
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

  const memberSinceDate = new Date(profile.member_since).getFullYear();

  return (
    <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="w-full md:w-1/3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="relative h-12 z-10">
                <Avatar className="h-24 w-24 border-4 border-white absolute -mt-12">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                  <AvatarFallback>{profile.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>

              <div className="pt-16">
                <div className="flex justify-between items-start">
                  <div className="max-w-[80%]">
                    <h1 className="text-2xl font-bold truncate dark:text-white">{profile.name}</h1>
                    <span className="inline-block text-xs px-2 py-1 rounded-full mt-1 bg-blue-100 text-blue-800">
                      {profile.role === 'private-party' ? 'Private Party' : 
                       profile.role === 'retail-store' ? 'Retail Store' :
                       profile.role === 'builder' ? 'Builder' :
                       profile.role === 'retail-website' ? 'Retail Website' : 'User'}
                    </span>
                  </div>
                  {!statsLoading && stats && stats.totalReviews > 0 && (
                    <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
                      <span className="font-medium">{stats.averageRating}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {!statsLoading && stats && (
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span>Response Rate: {stats.responseRate}%</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                    <span>Member since {memberSinceDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-lg font-medium mb-4 dark:text-white">About</h2>
          <Card>
            <CardContent className="p-6">
              <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                {profile.about || `Hi, I'm ${profile.name?.split(" ")[0] || 'User'}! I love sharing my gear with others and helping them enjoy their adventures. Feel free to reach out if you have any questions!`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-xl font-medium mb-6 dark:text-white">Available Gear</h2>
        {equipmentLoading ? (
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
            {userEquipment.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium dark:text-white">{item.name}</h3>
                    <span className="font-medium text-primary">${item.price_per_day}/day</span>
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
    </div>
  );
};

export default RealUserProfilePage;
