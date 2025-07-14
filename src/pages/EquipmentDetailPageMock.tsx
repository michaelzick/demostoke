import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import CustomerWaiverForm from "@/components/waiver/CustomerWaiverForm";
import BookingCard from "@/components/equipment-detail/BookingCard";
import EquipmentHeader from "@/components/equipment-detail/EquipmentHeader";
import EquipmentSpecs from "@/components/equipment-detail/EquipmentSpecs";
import LocationTab from "@/components/equipment-detail/LocationTab";
import ReviewsTab from "@/components/equipment-detail/ReviewsTab";
import PolicyTab from "@/components/equipment-detail/PolicyTab";
import OwnerCard from "@/components/equipment-detail/OwnerCard";
import SimilarEquipment from "@/components/equipment-detail/SimilarEquipment";
import GearImageModal from "@/components/equipment-detail/GearImageModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoryDisplayName } from "@/helpers";
import { Equipment } from "@/types";
import { slugify } from "@/utils/slugify";
import React, { useState } from "react";

interface EquipmentDetailPageMockProps {
  equipment: Equipment;
  similarEquipment: Equipment[];
  waiverCompleted: boolean;
  showWaiver: boolean;
  setShowWaiver: (show: boolean) => void;
  handleWaiverComplete: () => void;
  handleBookNowClick: () => void;
  bookingCardRef: React.RefObject<HTMLDivElement>;
}

const EquipmentDetailPageMock: React.FC<EquipmentDetailPageMockProps> = ({
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

  // Use images array from equipment_images table
  const images =
    equipment.images && equipment.images.length > 0 ? equipment.images : [];

  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  const handleImageClick = (index: number = 0) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
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
            <EquipmentHeader equipment={equipment} />
            {/* Book Now button: only visible on mobile (columns stacked) */}
            <Button
              className="block lg:hidden fixed left-0 bottom-0 w-full z-40 rounded-none bg-primary text-white font-semibold hover:bg-primary hover:opacity-100 hover:shadow-none focus:outline-none h-12"
              onClick={handleBookNowClick}
              type="button"
              id="book-now-mobile-button"
            >
              Book Now
            </Button>
            <p className="text-lg mb-6">{equipment.description}</p>
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
            <OwnerCard owner={equipment.owner} />
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6" ref={bookingCardRef}>
            <BookingCard
              equipment={equipment}
              waiverCompleted={waiverCompleted}
              onWaiverClick={() => setShowWaiver(true)}
            />
          </Card>
          {/* Similar Equipment */}
          <SimilarEquipment similarEquipment={similarEquipment} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPageMock;
