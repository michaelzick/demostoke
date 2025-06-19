
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircleIcon, StarIcon, MapPinIcon, PhoneIcon } from "lucide-react";

interface UserProfileSidebarProps {
  profile: {
    name: string;
    about?: string | null;
    role: string;
    phone?: string | null;
    address?: string | null;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
  } | null;
  memberSinceDate: number;
}

export const UserProfileSidebar = ({ profile, stats, memberSinceDate }: UserProfileSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircleIcon className="h-5 w-5" />
          About {profile.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
          {profile.about ||
            (profile.role === 'private-party'
              ? `Hi, I'm ${profile.name?.split(" ")[0] || 'User'}! I love sharing my gear with others and helping them enjoy their adventures.`
              : "This user has not provided an 'about' section.")}
        </div>
        
        {/* Contact Information Section */}
        {(profile.address || profile.phone) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              {profile.address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{profile.address}</p>
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator />
        <div className="space-y-3 pt-4">
          {profile.role === 'private-party' ? (
            <>
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
            </>
          ) : (
            <>
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
              {!profile.address && !profile.phone && (
                <div className="text-sm text-muted-foreground">
                  Contact information not available. To add contact details, please update your profile settings.
                </div>
              )}
            </>
          )}
        </div>
        {profile.role === 'private-party' && (
          <Button className="w-full" size="lg" disabled>
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            Contact {profile.name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
