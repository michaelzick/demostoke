import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import CustomerWaiverForm from "@/components/waiver/CustomerWaiverForm";
import EquipmentHeader from "@/components/equipment-detail/EquipmentHeader";
import EquipmentSpecs from "@/components/equipment-detail/EquipmentSpecs";
import LocationTab from "@/components/equipment-detail/LocationTab";
import ReviewsTab from "@/components/equipment-detail/ReviewsTab";
import PolicyTab from "@/components/equipment-detail/PolicyTab";
import OwnerCard from "@/components/equipment-detail/OwnerCard";
import SimilarEquipment from "@/components/equipment-detail/SimilarEquipment";
import GearImageModal from "@/components/equipment-detail/GearImageModal";
import ContactInfoModal from "@/components/equipment-detail/ContactInfoModal";
import { TricksSection } from "@/components/equipment-detail/TricksSection";
import { slugify } from "@/utils/slugify";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoryDisplayName, getCategoryActivityName } from "@/helpers";
import { Equipment } from "@/types";
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { useDeleteEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { buildEquipmentTrackingFrom, trackEvent } from "@/utils/tracking";
import { buildGearPath } from "@/utils/gearUrl";

interface EquipmentDetailPageDbProps {
  equipment: Equipment;
  similarEquipment: Equipment[];
  waiverCompleted: boolean;
  showWaiver: boolean;
  setShowWaiver: (show: boolean) => void;
  handleWaiverComplete: () => void;
  bookingCardRef: React.RefObject<HTMLDivElement>;
  canonicalPath?: string;
  lastVerifiedDate: string;
  gearDisplayName?: string;
}

const EquipmentDetailPageDb: React.FC<EquipmentDetailPageDbProps> = ({
  equipment,
  similarEquipment,
  waiverCompleted,
  showWaiver,
  setShowWaiver,
  handleWaiverComplete,
  bookingCardRef,
  canonicalPath,
  lastVerifiedDate,
  gearDisplayName,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const deleteEquipmentMutation = useDeleteEquipment();
  const updateVisibilityMutation = useUpdateEquipmentVisibility();

  // Use images array from equipment_images table
  const images =
    equipment.images && equipment.images.length > 0 ? equipment.images : [];

  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  const handleImageClick = (index: number = 0) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  // Create tracking data for analytics
  const trackingData = buildEquipmentTrackingFrom(equipment);
  const resolvedGearName = gearDisplayName || equipment.name;
  const leadContext = {
    gear_id: equipment.id,
    gear_name: resolvedGearName,
    gear_category: equipment.category,
    owner_id: equipment.owner.id,
    owner_name: equipment.owner.name,
    location: equipment.location.address,
    last_verified: lastVerifiedDate,
  };
  const handleBookNowClick = (
    ctaPlacement: "booking_card_desktop" | "sticky_footer_mobile",
  ) => {
    trackEvent("click_book_now", {
      ...leadContext,
      shop_name: equipment.owner.name,
      gear_title: resolvedGearName,
      cta_id: "gear_detail_page_book_now_cta",
      cta_placement: ctaPlacement,
      page_name: "gear_detail_page",
    });
    setShowContactModal(true);
  };

  // Check if current user can edit this equipment
  const canEdit = user && (equipment.owner.id === user.id || isAdmin);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`)) {
      try {
        await deleteEquipmentMutation.mutateAsync(equipment.id);
        toast({
          title: "Equipment Deleted",
          description: `${equipment.name} has been successfully deleted.`,
        });
        navigate(`/user-profile/${slugify(equipment.owner.name)}`);
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete equipment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVisibilityToggle = async () => {
    try {
      await updateVisibilityMutation.mutateAsync({
        equipmentId: equipment.id,
        visible: !(equipment.visible_on_map || false),
      });
      toast({
        title: "Visibility Updated",
        description: `${equipment.name} is now ${!(equipment.visible_on_map || false) ? "visible" : "hidden"} on the map.`,
      });
    } catch (error) {
      console.error("Visibility toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-4 md:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          {
            label: getCategoryDisplayName(equipment.category),
            path: `/explore?category=${equipment.category}`,
          },
          {
            label: equipment.owner.name,
            path: `/user-profile/${slugify(equipment.owner.name)}`,
          },
          {
            label: resolvedGearName,
            path:
              canonicalPath ||
              buildGearPath({
                id: equipment.id,
                name: equipment.name,
                size: equipment.specifications?.size,
              }),
          },
        ]}
      />

      {/* Image Modal */}
      <GearImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={images}
        initialIndex={selectedImageIndex}
        equipmentName={equipment.name}
      />

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        owner={equipment.owner}
        trackingData={trackingData}
        leadContext={leadContext}
        showBookingComingSoonMessage
      />

      {/* Waiver Form Modal */}
      {showWaiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {waiverCompleted ? "Edit" : "Complete"} Waiver
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowWaiver(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <CustomerWaiverForm
              equipment={equipment}
              onComplete={handleWaiverComplete}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="overflow-hidden rounded-lg">
            {hasImages ? (
              hasMultipleImages ? (
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {images.map((imageUrl, index) => (
                      <CarouselItem key={index}>
                        <div
                          className="cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(index)}
                        >
                          <img
                            src={imageUrl}
                            alt={`${resolvedGearName} - ${getCategoryActivityName(equipment.category)} Gear Image ${index + 1}`}
                            loading="lazy"
                            className="w-full h-96 object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(0)}
                >
                  <img
                    src={images[0]}
                    alt={`${resolvedGearName} - ${getCategoryActivityName(equipment.category)} Gear`}
                    loading="lazy"
                    className="w-full h-96 object-cover"
                  />
                </div>
              )
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          {/* Equipment Info */}
          <section aria-labelledby="gear-title">
            <div
              className={`mb-4 ${canEdit
                ? "flex flex-col md:flex-row md:justify-between md:items-start"
                : "flex justify-between items-start"
                }`}
            >
              <div className="flex-1">
                <EquipmentHeader
                  equipment={equipment}
                  stackOnMobile={canEdit}
                  gearDisplayName={resolvedGearName}
                  lastVerifiedDate={lastVerifiedDate}
                />
              </div>
              {canEdit && (
                <div className="flex gap-2 flex-col mt-4 md:mt-0 md:ml-4 w-full md:w-40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisibilityToggle}
                    disabled={updateVisibilityMutation.isPending}
                    className="w-full"
                  >
                    {equipment.visible_on_map ? (
                      <Eye className="w-4 h-4 mr-1" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-1" />
                    )}
                    {equipment.visible_on_map ? "Hide" : "Show"}
                    {isAdmin && equipment.owner.id !== user?.id ? ' (Admin)' : ''}
                  </Button>

                  <Link to={`/edit-gear/${equipment.id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      {isAdmin && equipment.owner.id !== user?.id ? 'Edit (Admin)' : 'Edit'}
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteEquipmentMutation.isPending}
                    className="w-full text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isAdmin && equipment.owner.id !== user?.id ? 'Delete (Admin)' : 'Delete'}
                  </Button>
                </div>
              )}
            </div>
            {/* Book Now button: only visible on mobile (columns stacked) */}
            <Button
              className="block lg:hidden fixed left-0 bottom-0 w-full z-40 rounded-none bg-primary text-primary-foreground font-semibold focus:outline-none h-12"
              onClick={() => handleBookNowClick("sticky_footer_mobile")}
              type="button"
              id="book-now-mobile-button"
            >
              Book Now
            </Button>
            <p className="text-sm text-muted-foreground mb-3">
              {resolvedGearName} is available in {equipment.location.address}. Last verified: {lastVerifiedDate}.
            </p>
            <div className="text-lg mb-6 whitespace-pre-wrap">{equipment.description}</div>
            <EquipmentSpecs specifications={equipment.specifications} />

            {/* Tricks & Tutorials Section */}
            <section aria-label="Tricks and Tutorials">
              <TricksSection
                equipmentId={equipment.id}
                category={equipment.category}
                subcategory={equipment.subcategory}
                equipmentName={equipment.name}
                specifications={equipment.specifications}
              />
            </section>
          </section>
          {/* Tabs for Additional Information */}
          <section aria-label="Detailed Information">
            <Tabs defaultValue="location">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="policy">Policies</TabsTrigger>
              </TabsList>
              <TabsContent value="location">
                <LocationTab equipment={equipment} />
              </TabsContent>
              <TabsContent value="reviews">
                <ReviewsTab
                  equipmentId={equipment.id}
                  rating={equipment.rating}
                  reviewCount={equipment.review_count}
                />
              </TabsContent>
              <TabsContent value="policy">
                <PolicyTab />
              </TabsContent>
            </Tabs>
          </section>
          {/* Owner Info */}
          <section aria-label="Owner Information">
            <Card>
              <OwnerCard owner={equipment.owner} trackingData={trackingData} />
            </Card>
          </section>
        </article>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6" ref={bookingCardRef}>
            <Button
              className="w-full font-semibold"
              onClick={() => handleBookNowClick("booking_card_desktop")}
              type="button"
              id="book-now-desktop-button"
            >
              Book Now
            </Button>
          </Card>
          {/* Similar Equipment */}
          <SimilarEquipment similarEquipment={similarEquipment} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPageDb;
