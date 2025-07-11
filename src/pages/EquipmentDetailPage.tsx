
import { useParams } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, useRef } from "react";
import { useEquipmentBySlug } from "@/hooks/useEquipmentBySlug";
import { useSimilarEquipment } from "@/hooks/useSimilarEquipment";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { trackEquipmentView } from "@/services/viewTrackingService";
import { getCategoryDisplayName } from "@/helpers";

// Import component modules
import EquipmentDetailPageDb from "./EquipmentDetailPageDb";

const EquipmentDetailPage = () => {
  const { category = "", slug = "" } = useParams<{ category: string; slug: string }>();
  const [waiverCompleted, setWaiverCompleted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  const { data: equipment, isLoading, error } = useEquipmentBySlug(category, slug);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track view when equipment is loaded
  useEffect(() => {
    if (equipment) {
      trackEquipmentView(equipment.id);
    }
  }, [equipment]);

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
          address: '' // Changed from zip to address
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

  const currentEquipment = equipmentForDisplayDb;
  const { data: similarEquipmentFromDb, isLoading: similarLoading } = useSimilarEquipment(
    currentEquipment?.category || '',
    currentEquipment?.id || '',
    currentEquipment?.location?.lat,
    currentEquipment?.location?.lng
  );

  // Use real similar equipment data, fallback to empty array
  const similarEquipment = similarEquipmentFromDb || [];

  const equipmentName = currentEquipment?.name;
  const categoryDisplay = currentEquipment ? getCategoryDisplayName(currentEquipment.category) : '';

  usePageMetadata({
    title: equipmentName
      ? `Rent ${equipmentName} – ${categoryDisplay} Demo | DemoStoke`
      : 'Gear Details | DemoStoke',
    description: equipmentName
      ? `Demo and rent a ${equipmentName} ${categoryDisplay ? `(${categoryDisplay})` : ''} on DemoStoke – try before you buy!`
      : 'View detailed information about this gear listing.',
    image: currentEquipment?.images?.[0] || currentEquipment?.image_url,
    type: 'product',
    schema: currentEquipment
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: currentEquipment.name,
          description: currentEquipment.description,
          image:
            currentEquipment.images && currentEquipment.images.length > 0
              ? currentEquipment.images
              : [currentEquipment.image_url],
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: currentEquipment.price_per_day,
            availability: currentEquipment.availability.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: currentEquipment.rating,
            reviewCount: currentEquipment.review_count
          }
        }
      : undefined
  });

  // Shared handlers
  const handleBookNowClick = () => {
    if (bookingCardRef.current) {
      const header = document.querySelector('header.sticky') as HTMLElement | null;
      const headerHeight = header ? header.offsetHeight : 0;
      const top = bookingCardRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };
  const handleWaiverComplete = () => {
    setWaiverCompleted(true);
    setShowWaiver(false);
    setTimeout(() => {
      if (bookingCardRef.current) {
        const header = document.querySelector('header.sticky') as HTMLElement | null;
        const headerHeight = header ? header.offsetHeight : 0;
        const top = bookingCardRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top, behavior: "smooth" });
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

  // Equipment found
  if (equipmentForDisplayDb) {
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
