import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPinIcon, PhoneIcon, GlobeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { slugify } from "@/utils/slugify";
import { GearOwner } from "@/types";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: GearOwner;
  trackingData?: string;
}

const ContactInfoModal = ({ isOpen, onClose, owner, trackingData }: ContactInfoModalProps) => {
  const { data: profile } = useUserProfile(owner.id);

  const displayName = profile?.name || owner.name;
  const hasContactInfo = profile?.address || profile?.phone || profile?.website;
  const profileLinkPath = owner.shopId
    ? `/shop/${owner.shopId}`
    : `/user-profile/${slugify(owner.name)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Contact{' '}
            <Link
              to={profileLinkPath}
              className="text-primary underline hover:text-primary/80 transition-colors view-profile-link"
              data-tracking={trackingData}
              id={trackingData}
            >
              {displayName}
            </Link>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasContactInfo ? (
            <div className="space-y-3">
              {profile?.address && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary underline profile-address"
                      data-tracking={trackingData}
                      id={trackingData}
                    >
                      {profile.address}
                    </a>
                  </div>
                </div>
              )}

              {profile?.phone && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-sm text-muted-foreground hover:text-primary underline profile-phone"
                      data-tracking={trackingData}
                      id={trackingData}
                    >
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}

              {profile?.website && (
                <div className="flex items-start gap-3">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary underline profile-website"
                      data-tracking={trackingData}
                      id={trackingData}
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Contact information is not available for {displayName}.
              {profile?.role === 'shop' && (
                <div className="mt-2">
                  To add contact details, the owner should update their profile settings.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoModal;
