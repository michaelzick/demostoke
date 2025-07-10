
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarIcon, CalendarIcon } from "lucide-react";

interface UserProfileHeaderProps {
  profile: {
    name: string;
    avatar_url: string | null;
    hero_image_url?: string | null;
    role: string;
    created_at?: string;
    member_since?: string;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
  } | null;
  memberSinceDate: number;
}

export const UserProfileHeader = ({ profile, stats, memberSinceDate }: UserProfileHeaderProps) => {
  if (profile.role === 'private-party') {
    return (
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
                <Badge>Private Party</Badge>
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
    );
  }

  // Business profile header
  if (profile.hero_image_url) {
    return (
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url('${profile.hero_image_url}')` }}
      >
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
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profile.role === 'retail-store' ? 'Retail Store' :
                    profile.role === 'builder' ? 'Builder' :
                      profile.role === 'retail-website' ? 'Retail Website' : 'Business'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div>
              <div>This is an unclaimed profile for {profile.name || "this user"}.</div>
              <div>
                <a href="/contact-us" className="text-primary hover:underline">
                  Contact us
                </a> if you are the owner and want to claim this profile.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ""} />
            <AvatarFallback>{profile.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
            {stats && stats.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg">{stats.averageRating}</span>
                <span className="text-gray-300">({stats.totalReviews} reviews)</span>
              </div>
            )}
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
  );
};
