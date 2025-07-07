
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarIcon, MessageSquare } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { GearOwner } from "@/types";
import ContactInfoModal from "./ContactInfoModal";
import { useState } from "react";

interface OwnerCardProps {
  owner: GearOwner;
  trackingData?: string;
}

const OwnerCard = ({ owner, trackingData }: OwnerCardProps) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const { data: profile } = useUserProfile(owner.id);
  const { data: stats } = useUserStats(owner.id);

  // Determine the correct profile link - use real user profile for DB users
  const profileLinkPath = owner.shopId
    ? `/shop/${owner.shopId}`
    : `/user-profile/${owner.id}`;

  // Use real data if available, fallback to mock data
  const displayName = profile?.name || owner.name;
  const displayImage = profile?.avatar_url || owner.imageUrl;
  const displayRating = stats && stats.totalReviews > 0 ? stats.averageRating : owner.rating;
  const displayResponseRate = stats?.responseRate || owner.responseRate;
  const memberSince = profile?.member_since ? new Date(profile.member_since).getFullYear() : owner.memberSince;

  return (
    <>
      <ContactInfoModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        owner={owner}
        trackingData={trackingData}
      />

      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={displayImage} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-medium truncate">{displayName}</h3>
            <div className="flex items-center text-sm">
              {stats && stats.totalReviews > 0 ? (
                <>
                  <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
                  <span>{displayRating}</span>
                </>
              ) : (
                <span className="text-muted-foreground">No reviews yet</span>
              )}
              {owner.personality && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 rounded-full truncate owner-personality">
                  {owner.personality}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm mb-4">
          {/* ADD THIS IN WHEN IT'S WORKING */}
          {/* <p className="mb-2">Response rate: {displayResponseRate}%</p> */}
          <p className="text-muted-foreground">
            Member since {memberSince}
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link to={profileLinkPath} data-tracking={trackingData}
            id={trackingData} className="view-profile-link">
            View Profile
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full mt-4 contact-owner-button"
          onClick={() => setShowContactModal(true)}
          data-tracking={trackingData}
          id={trackingData}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Owner
        </Button>
      </div>
    </>
  );
};

export default OwnerCard;
