
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, useRef } from "react";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useSimilarEquipment } from "@/hooks/useSimilarEquipment";
import { Skeleton } from "@/components/ui/skeleton";
import { mockEquipment } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { trackEquipmentView } from "@/services/viewTrackingService";

// Import component modules
import EquipmentDetailPageDb from "./EquipmentDetailPageDb";
import EquipmentDetailPageMock from "./EquipmentDetailPageMock";

// Helper to check for valid UUID
function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string; }>();
  const [waiverCompleted, setWaiverCompleted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Scroll to top and track view on page load
  useEffect(() => {
    window.scrollTo(0, 0);

    // Track equipment view if we have a valid ID
    if (id) {
      trackEquipmentView(id);
    }
  }, [id]);

  // Only fetch from DB if id is a valid UUID
  const shouldFetchFromDb = id && isValidUUID(id);
  const { data: equipment, isLoading, error } = useEquipmentById(shouldFetchFromDb ? id : "");

  // Helper to ensure pricing_options is a tuple
  const ensurePricingOptionsTuple = (options: unknown, fallbackPrice: number): [import("@/types").PricingOption] => {
    if (Array.isArray(options) && options.length > 0) {
      return options as [import("@/types").PricingOption];
    }
    return [{ id: 'default', price: fallbackPrice, duration: 'day' }];
  };

  // DB equipment mapping
  const equipmentForDisplayDb = useMemo(() => {
    if (equipment) {
      console.log('=== EQUIPMENT IMAGE DEBUG ===');
      console.log('Raw equipment data:', equipment);
      console.log('Equipment image_url:', equipment.image_url);
      console.log('Equipment images array:', equipment.images);
      console.log('Images array length:', equipment.images?.length || 0);
      console.log('=== END IMAGE DEBUG ===');

      return {
        id: equipment.id,
        name: equipment.name,
        category: equipment.category,
        subcategory: equipment.subcategory,
        description: equipment.description || "",
        price_per_day: Number(equipment.price_per_day),
        price_per_hour: Number(equipment.price_per_hour),
        price_per_week: Number(equipment.price_per_week),
        image_url: equipment.image_url || "",
        images: equipment.images || [], // Make sure images array is passed through
        rating: Number(equipment.rating || 0),
        review_count: equipment.review_count || 0,
        owner: equipment.owner, // Use the actual owner data from the database
        location: equipment.location || {
          lat: 0,
          lng: 0,
          zip: ''
        },
        distance: 0,
        specifications: equipment.specifications || {
          size: '',
          weight: '',
          material: '',
          suitable: ''
        },
        availability: {
          available: equipment.status === 'available',
        },
        pricing_options: ensurePricingOptionsTuple((equipment as { pricing_options?: unknown[]; }).pricing_options, Number(equipment.price_per_day)),
      };
    }
    return null;
  }, [equipment]);

  // Mock equipment mapping
  const equipmentForDisplayMock = useMemo(() => {
    if (id) {
      const mock = mockEquipment.find(e => e.id === id);
      if (mock) {
        console.log('=== MOCK EQUIPMENT IMAGE DEBUG ===');
        console.log('Mock equipment data:', mock);
        console.log('Mock image_url:', mock.image_url);
        console.log('Mock images array:', mock.images);
        console.log('Mock images array length:', mock.images?.length || 0);
        console.log('=== END MOCK IMAGE DEBUG ===');

        return {
          ...mock,
          pricingOptions: ensurePricingOptionsTuple(mock.pricing_options, mock.price_per_day),
        };
      }
    }
    return null;
  }, [id]);

  // Fetch similar equipment using the new hook
  const currentEquipment = equipmentForDisplayDb || equipmentForDisplayMock;
  const { data: similarEquipmentFromDb, isLoading: similarLoading } = useSimilarEquipment(
    currentEquipment?.category || '',
    currentEquipment?.id || ''
  );

  // Use real similar equipment data, fallback to empty array
  const similarEquipment = similarEquipmentFromDb || [];

  // Shared handlers
  const handleBookNowClick = () => {
    if (bookingCardRef.current) {
      bookingCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleWaiverComplete = () => {
    setWaiverCompleted(true);
    setShowWaiver(false);
    setTimeout(() => {
      if (bookingCardRef.current) {
        bookingCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-8">
        <Skeleton className="h-6 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-20 w-full mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton className="h-40 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // DB equipment found
  if (shouldFetchFromDb && equipmentForDisplayDb) {
    return (
      <EquipmentDetailPageDb
        equipment={equipmentForDisplayDb}
        similarEquipment={similarEquipment}
        waiverCompleted={waiverCompleted}
        showWaiver={showWaiver}
        setShowWaiver={setShowWaiver}
        handleWaiverComplete={handleWaiverComplete}
        handleBookNowClick={handleBookNowClick}
        bookingCardRef={bookingCardRef}
      />
    );
  }

  // Mock equipment fallback
  if (equipmentForDisplayMock) {
    return (
      <EquipmentDetailPageMock
        equipment={equipmentForDisplayMock}
        similarEquipment={similarEquipment}
        waiverCompleted={waiverCompleted}
        showWaiver={showWaiver}
        setShowWaiver={setShowWaiver}
        handleWaiverComplete={handleWaiverComplete}
        handleBookNowClick={handleBookNowClick}
        bookingCardRef={bookingCardRef}
      />
    );
  }

  // Not found
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
};

export default EquipmentDetailPage;
