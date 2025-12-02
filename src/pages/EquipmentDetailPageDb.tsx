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
import { slugify } from "@/utils/slugify";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoryDisplayName } from "@/helpers";
import { Equipment } from "@/types";
import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { useDeleteEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { buildEquipmentTrackingFrom } from "@/utils/tracking";

interface EquipmentDetailPageDbProps {
  equipment: Equipment;
  similarEquipment: Equipment[];
  waiverCompleted: boolean;
  showWaiver: boolean;
  setShowWaiver: (show: boolean) => void;
  handleWaiverComplete: () => void;
  handleBookNowClick: () => void;
  bookingCardRef: React.RefObject<HTMLDivElement>;
}

const EquipmentDetailPageDb: React.FC<EquipmentDetailPageDbProps> = ({
  equipment,
  similarEquipment,
  waiverCompleted,
  showWaiver,
  setShowWaiver,
  handleWaiverComplete,
  handleBookNowClick,
  bookingCardRef,
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
            label: equipment.name,
            path: `/${equipment.category}/${slugify(equipment.owner.name)}/${slugify(equipment.name)}`,
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
        <div className="lg:col-span-2 space-y-8">
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
                            alt={`${equipment.name} - Image ${index + 1}`}
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
                    alt={equipment.name}
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
          <div>
            <div
              className={`mb-4 ${
                canEdit
                  ? "flex flex-col md:flex-row md:justify-between md:items-start"
                  : "flex justify-between items-start"
              }`}
            >
              <div className="flex-1">
                <EquipmentHeader equipment={equipment} stackOnMobile={canEdit} />
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
              onClick={handleBookNowClick}
              type="button"
              id="book-now-mobile-button"
            >
              Book Now
            </Button>
            <div className="text-lg mb-6 whitespace-pre-wrap">{equipment.description}</div>
            <EquipmentSpecs specifications={equipment.specifications} />
          </div>
          {/* Tabs for Additional Information */}
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
          {/* Owner Info */}
          <Card>
            <OwnerCard owner={equipment.owner} trackingData={trackingData} />
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6" ref={bookingCardRef}>
            <h3 className="text-lg font-semibold mb-4">
              The ability to book here is coming soon. Please contact{" "}
              {equipment.owner.name}.
            </h3>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-primary
              underline underline-offset-4
              hover:underline hover:text-primary/80
              transition-colors bg-transparent
              border-none p-0 font-inherit
              cursor-pointer owner-name-button"
              data-tracking={trackingData}
              id={`${equipment.owner.name} - Trigger Modal Button - Booking Card`}
            >
              {equipment.owner.name}
            </button>
          </Card>
          {/* Similar Equipment */}
          <SimilarEquipment similarEquipment={similarEquipment} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPageDb;
