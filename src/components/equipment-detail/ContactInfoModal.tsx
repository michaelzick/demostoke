import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPinIcon, PhoneIcon, GlobeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { slugify } from "@/utils/slugify";
import { GearOwner } from "@/types";
import { trackEvent } from "@/utils/tracking";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: GearOwner;
  trackingData?: string;
  leadContext?: Record<string, unknown>;
  showBookingComingSoonMessage?: boolean;
}

const ContactInfoModal = ({
  isOpen,
  onClose,
  owner,
  trackingData,
  leadContext,
  showBookingComingSoonMessage = false,
}: ContactInfoModalProps) => {
  const { data: profile } = useUserProfile(owner.id);

  const displayName = profile?.name || owner.name;
  const hasContactInfo = profile?.address || profile?.phone || profile?.website;
  const profileLinkPath = `/user-profile/${slugify(owner.name)}`;
  const outboundActionTakenRef = useRef(false);
  const noContactInfoTrackedRef = useRef(false);
  const baseLeadEvent = useMemo(
    () => ({
      owner_id: owner.id,
      owner_name: displayName,
      ...leadContext,
    }),
    [owner.id, displayName, leadContext]
  );

  useEffect(() => {
    if (isOpen) {
      outboundActionTakenRef.current = false;
      noContactInfoTrackedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasContactInfo && !noContactInfoTrackedRef.current) {
      trackEvent("lead_contact_info_unavailable", {
        ...baseLeadEvent,
        failure_reason: "no_public_contact_info",
      });
      noContactInfoTrackedRef.current = true;
    }
  }, [baseLeadEvent, hasContactInfo, isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !outboundActionTakenRef.current) {
      trackEvent("lead_contact_abandoned", {
        ...baseLeadEvent,
        failure_reason: "modal_closed_without_outbound_contact",
      });
    }

    if (!open) {
      outboundActionTakenRef.current = false;
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          {showBookingComingSoonMessage && (
            <p className="text-sm text-muted-foreground">
              The ability to book here is coming soon. Please contact {displayName}.
            </p>
          )}
          <DialogTitle>
            <Link
              to={profileLinkPath}
              className="text-primary underline hover:text-primary/80 transition-colors view-profile-link"
              data-tracking={trackingData}
              id={`${owner.name} - View Profile Link - Contact Info Modal`}
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
                      className="mp-block text-sm text-muted-foreground hover:text-primary underline profile-address"
                      data-tracking={trackingData}
                       id={`${owner.name} - ${profile?.address} - Contact Info Modal`}
                       onClick={() => {
                         outboundActionTakenRef.current = true;
                         trackEvent("click_directions", {
                           ...baseLeadEvent,
                           destination: profile.address,
                         });
                       }}
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
                      className="mp-block text-sm text-muted-foreground hover:text-primary underline profile-phone"
                      data-tracking={trackingData}
                       id={`${owner.name} - ${profile?.phone} - Contact Info Modal`}
                       onClick={() => {
                         outboundActionTakenRef.current = true;
                         trackEvent("click_call", {
                           ...baseLeadEvent,
                           phone: profile.phone,
                         });
                       }}
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
                       id={`${owner.name} - ${profile?.website} - Contact Info Modal`}
                       onClick={() => {
                         outboundActionTakenRef.current = true;
                         trackEvent("click_shop_site", {
                           ...baseLeadEvent,
                           website: profile.website,
                         });
                       }}
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
              {profile && (
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
