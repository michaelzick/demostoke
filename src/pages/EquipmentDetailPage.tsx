import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, useRef } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CustomerWaiverForm from "@/components/waiver/CustomerWaiverForm";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { Skeleton } from "@/components/ui/skeleton";
import { mockEquipment } from "@/lib/mockData";

// Import component modules
import BookingCard from "@/components/equipment-detail/BookingCard";
import EquipmentHeader from "@/components/equipment-detail/EquipmentHeader";
import EquipmentSpecs from "@/components/equipment-detail/EquipmentSpecs";
import LocationTab from "@/components/equipment-detail/LocationTab";
import ReviewsTab from "@/components/equipment-detail/ReviewsTab";
import PolicyTab from "@/components/equipment-detail/PolicyTab";
import OwnerCard from "@/components/equipment-detail/OwnerCard";

// Define a type for pricing options
interface PricingOption { id: string; price: number; duration: string; }

// Helper to check for valid UUID
function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string; }>();
  const [waiverCompleted, setWaiverCompleted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  // Only fetch from DB if id is a valid UUID
  const shouldFetchFromDb = id && isValidUUID(id);
  const { data: equipment, isLoading, error } = useEquipmentById(shouldFetchFromDb ? id : "");

  // Only use dbPricingOptions if using DB equipment, otherwise use mockPricingOptions
  const showDbPricing = shouldFetchFromDb && equipment && isValidUUID(equipment.id);

  // Convert UserEquipment to Equipment format for components that expect it
  const equipmentForDisplay = useMemo(() => {
    if (equipment) {
      return {
        id: equipment.id,
        name: equipment.name,
        category: equipment.category,
        description: equipment.description || "",
        imageUrl: equipment.image_url || "",
        pricePerDay: Number(equipment.price_per_day),
        rating: Number(equipment.rating || 0),
        reviewCount: equipment.review_count || 0,
        owner: {
          id: equipment.id, // fallback to equipment id if no user_id
          name: "Equipment Owner",
          imageUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${equipment.id}`,
          rating: 4.9,
          responseRate: 98,
        },
        location: {
          lat: Number(equipment.location_lat || 0),
          lng: Number(equipment.location_lng || 0),
          name: equipment.location_name || "Location",
        },
        distance: 0,
        specifications: {
          size: equipment.size || "N/A",
          weight: equipment.weight || "N/A",
          material: equipment.material || "N/A",
          suitable: equipment.suitable_skill_level || "All Levels",
        },
        availability: {
          available: equipment.status === 'available',
        },
      };
    }
    // If no equipment found from DB, try to find in mockEquipment
    if (id) {
      const mock = mockEquipment.find(e => e.id === id);
      if (mock) return mock;
    }
    return null;
  }, [equipment, id]);

  // Get mock pricing options if available (must be after equipmentForDisplay is defined)
  const mockPricingOptions: PricingOption[] = (equipmentForDisplay && (equipmentForDisplay as { pricingOptions?: PricingOption[]; }).pricingOptions) || [];

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Ref for booking card
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Scroll handler for Book Now button
  const handleBookNowClick = () => {
    if (bookingCardRef.current) {
      bookingCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenWaiver = () => {
    setShowWaiver(true);
  };

  const handleWaiverComplete = () => {
    setWaiverCompleted(true);
    setShowWaiver(false);

    // After waiver is completed, scroll to booking card
    setTimeout(() => {
      if (bookingCardRef.current) {
        bookingCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Render error or fallback to mock equipment first
  if (error || !equipment || !equipmentForDisplay) {
    if (equipmentForDisplay) {
      return (
        <div className="container px-4 md:px-6 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", path: "/" },
              { label: "My Gear", path: "/my-gear" },
              { label: equipmentForDisplay.name, path: `/equipment/${equipmentForDisplay.id}` },
            ]}
          />
          {/* Waiver Form Modal */}
          {showWaiver && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{waiverCompleted ? "Edit" : "Complete"} Waiver</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowWaiver(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <CustomerWaiverForm
                  equipment={equipmentForDisplay}
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
                <img
                  src={equipmentForDisplay.imageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"}
                  alt={equipmentForDisplay.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              {/* Equipment Info */}
              <div>
                <EquipmentHeader equipment={equipmentForDisplay} />
                {/* Book Now button: only visible on mobile (columns stacked) */}
                <Button
                  className="block lg:hidden fixed left-0 bottom-0 w-full z-40 rounded-none bg-primary text-white font-semibold hover:bg-primary hover:opacity-100 hover:shadow-none focus:outline-none h-12"
                  onClick={handleBookNowClick}
                  type="button"
                >
                  Book Now
                </Button>
                <p className="text-lg mb-6">{equipmentForDisplay.description}</p>
                <EquipmentSpecs specifications={equipmentForDisplay.specifications} />
              </div>
              {/* Tabs for Additional Information */}
              <Tabs defaultValue="location">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="policy">Policies</TabsTrigger>
                </TabsList>
                <TabsContent value="location">
                  <LocationTab equipment={equipmentForDisplay} />
                </TabsContent>
                <TabsContent value="reviews">
                  <ReviewsTab rating={equipmentForDisplay.rating} reviewCount={equipmentForDisplay.reviewCount} />
                </TabsContent>
                <TabsContent value="policy">
                  <PolicyTab />
                </TabsContent>
              </Tabs>
              {/* Owner Info */}
              <Card>
                <OwnerCard owner={equipmentForDisplay.owner} />
              </Card>
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="p-6" ref={bookingCardRef}>
                <BookingCard
                  equipment={equipmentForDisplay}
                  waiverCompleted={waiverCompleted}
                  onWaiverClick={handleOpenWaiver}
                />
              </Card>
            </div>
          </div>
        </div>
      );
    }
    // If no equipment found at all
    return (
      <div className="container px-4 md:px-6 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">Equipment not found</h2>
          <p className="text-muted-foreground mb-6">
            {error ? "There was an error loading this equipment." : "This equipment doesn't exist or you don't have permission to view it."}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <Skeleton className="h-6 w-64 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Skeleton className="w-full h-96 rounded-lg" />

            {/* Equipment Info */}
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-20 w-full mb-6" />

              {/* Specs skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton className="h-40 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main render (DB equipment found)
  return (
    <div className="container px-4 md:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "My Gear", path: "/my-gear" },
          { label: equipment.name, path: `/equipment/${equipment.id}` },
        ]}
      />
      {/* Waiver Form Modal */}
      {showWaiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{waiverCompleted ? "Edit" : "Complete"} Waiver</h2>
              <Button
                variant="outline"
                onClick={() => setShowWaiver(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <CustomerWaiverForm
              equipment={equipmentForDisplay}
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
            <img
              src={equipment.image_url || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"}
              alt={equipment.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Equipment Info */}
          <div>
            <EquipmentHeader equipment={equipmentForDisplay} />

            {/* Book Now button: only visible on mobile (columns stacked) */}
            <Button
              className="
                block
                lg:hidden
                fixed left-0 bottom-0 w-full z-40 rounded-none
                bg-primary text-white font-semibold
                hover:bg-primary
                hover:opacity-100
                hover:shadow-none
                focus:outline-none
                h-12
              "
              onClick={handleBookNowClick}
              type="button"
            >
              Book Now
            </Button>

            <p className="text-lg mb-6">{equipment.description}</p>
            <EquipmentSpecs specifications={equipmentForDisplay.specifications} />
          </div>

          {/* Tabs for Additional Information */}
          <Tabs defaultValue="location">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="policy">Policies</TabsTrigger>
            </TabsList>
            <TabsContent value="location">
              <LocationTab equipment={equipmentForDisplay} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab rating={equipmentForDisplay.rating} reviewCount={equipmentForDisplay.reviewCount} />
            </TabsContent>
            <TabsContent value="policy">
              <PolicyTab />
            </TabsContent>
          </Tabs>

          {/* Owner Info */}
          <Card>
            <OwnerCard owner={equipmentForDisplay.owner} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="p-6" ref={bookingCardRef}>
            <BookingCard
              equipment={equipmentForDisplay}
              waiverCompleted={waiverCompleted}
              onWaiverClick={handleOpenWaiver}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
