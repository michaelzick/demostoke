
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircleIcon, StarIcon, MapPinIcon, PhoneIcon, GlobeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import MapComponent from "@/components/MapComponent";

interface UserProfileSidebarProps {
  profile: {
    name: string;
    about?: string | null;
    phone?: string | null;
    address?: string | null;
    location_lat?: number | null;
    location_lng?: number | null;
    website?: string | null;
    displayRole?: string;
  };
  stats?: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
  } | null;
  memberSinceDate: number;
}

export const UserProfileSidebar = ({ profile, stats, memberSinceDate }: UserProfileSidebarProps) => {
  const isPrivateParty = profile.displayRole === 'private-party';
  
  return (
    <>
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
            (isPrivateParty
              ? `Hi, I'm ${profile.name?.split(" ")[0] || 'User'}! I love sharing my gear with others and helping them enjoy their adventures.`
              : "This user has not provided an 'about' section.")}
        </div>
        
        {/* Contact Information Section */}
        {(profile.address || profile.phone || profile.website) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              {profile.address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address!)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary underline"
                    >
                      {profile.address}
                    </a>
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
              {profile.website && (
                <div className="flex items-start gap-3">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        <Separator />
        <div className="space-y-3 pt-4">
          {isPrivateParty ? (
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
              <div className="text-sm text-muted-foreground">
                <div>This is an unclaimed profile for {profile.name || "this user"}.</div>
                <div>
                  <Link to="/contact-us" className="text-primary hover:underline">
                    Contact us
                  </Link>{" "}
                  if you are the owner and want to claim this profile.
                </div>
              </div>
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
              <div className="text-sm text-muted-foreground">
                <div>This is an unclaimed profile for {profile.name || "this user"}.</div>
                <div>
                  <Link to="/contact-us" className="text-primary hover:underline">
                    Contact us
                  </Link>{" "}
                  if you are the owner and want to claim this profile.
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Member Since</span>
                <span>{memberSinceDate}</span>
              </div>
              {!profile.address && !profile.phone && !profile.website && (
                <div className="text-sm text-muted-foreground">
                  Contact information not available. To add contact details, please update your profile settings.
                </div>
              )}
            </>
          )}
        </div>
        {isPrivateParty && (
          <Button className="w-full" size="lg" disabled>
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            Contact {profile.name}
          </Button>
        )}
      </CardContent>
    </Card>
      {profile.location_lat && profile.location_lng && (
        <div className="h-40 rounded-md overflow-hidden mt-4">
          <MapComponent
            initialEquipment={[{
              id: profile.name,
              name: profile.name,
              category: 'user',
              price_per_day: 0,
              location: { lat: profile.location_lat, lng: profile.location_lng },
              ownerId: profile.name,
              ownerName: profile.name,
            }]}
            activeCategory={null}
            interactive={false}
            userRole={profile.displayRole || 'private-party'}
          />
        </div>
      )}
    </>
  );
};
