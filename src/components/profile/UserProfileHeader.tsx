
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { StarIcon, CalendarIcon } from "lucide-react";

import { getRoleDisplayName } from "@/utils/mapUtils";

interface UserProfileHeaderProps {
  profile: {
    name: string;
    avatar_url: string | null;
    hero_image_url?: string | null;
    created_at?: string;
    member_since?: string;
    displayRole?: string;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
  } | null;
  memberSinceDate: number;
}

export const UserProfileHeader = ({ profile, stats, memberSinceDate }: UserProfileHeaderProps) => {
  const hasHeroImage = !!profile.hero_image_url;
  const roleName = getRoleDisplayName(profile.displayRole || 'retail-store');

  if (hasHeroImage) {
    return (
      <div
        className="relative min-h-[16rem] bg-cover bg-center"
        style={{ backgroundImage: `url('${profile.hero_image_url}')` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 flex flex-col justify-center h-full py-4">
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
                <Badge variant="secondary">{roleName}</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 text-white md:mt-0 md:absolute md:bottom-4 md:left-4">
            <div>
              <div>This is an unclaimed profile for {profile.name || "this user"}.</div>
              <div>
                <Link to="/contact-us" className="text-primary hover:underline">
                  Contact us
                </Link> if you are the owner and want to claim this profile.
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
              <Badge variant="secondary">{roleName}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
