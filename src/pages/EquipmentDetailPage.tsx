import { useLocation, useNavigate, useParams } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, useRef } from "react";
import { useEquipmentBySlug } from "@/hooks/useEquipmentBySlug";
import { useEquipmentById } from "@/hooks/useEquipmentById";
import { useSimilarEquipment } from "@/hooks/useSimilarEquipment";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { trackEquipmentView } from "@/services/viewTrackingService";
import { getCategoryDisplayName } from "@/helpers";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  buildGearCanonicalUrl,
  buildGearDisplayName,
  buildGearPath,
  extractGearIdFromSlug,
  toISODate,
} from "@/utils/gearUrl";
import { trackEvent } from "@/utils/tracking";

// Import component modules
import EquipmentDetailPageDb from "./EquipmentDetailPageDb";

const EquipmentDetailPage = () => {
  const {
    category = "",
    ownerSlug = "",
    slug = "",
    gearSlug = "",
  } = useParams<{
    category?: string;
    ownerSlug?: string;
    slug?: string;
    gearSlug?: string;
  }>();
  const [waiverCompleted, setWaiverCompleted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const isCanonicalGearRoute = Boolean(gearSlug);
  const gearIdFromSlug = useMemo(
    () => extractGearIdFromSlug(gearSlug),
    [gearSlug],
  );

  const {
    data: equipmentFromCanonicalSlug,
    isLoading: isCanonicalGearLoading,
    error: canonicalGearError,
  } = useEquipmentById(gearIdFromSlug || "");

  const {
    data: equipmentFromLegacySlug,
    isLoading: isLegacyGearLoading,
    error: legacyGearError,
  } = useEquipmentBySlug(category, slug, ownerSlug, !isCanonicalGearRoute);

  const equipment = isCanonicalGearRoute
    ? equipmentFromCanonicalSlug
    : equipmentFromLegacySlug;
  const isLoading = isCanonicalGearRoute
    ? isCanonicalGearLoading
    : isLegacyGearLoading;
  const error = isCanonicalGearRoute ? canonicalGearError : legacyGearError;

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track view when equipment is loaded
  useEffect(() => {
    console.log('🎯 Equipment detail view effect triggered:', { 
      hasEquipment: !!equipment, 
      equipmentId: equipment?.id, 
      hasUser: !!user, 
      userId: user?.id 
    });
    
    if (equipment) {
      trackEquipmentView(equipment.id, user?.id, queryClient);
    }
  }, [equipment, user?.id, queryClient]);

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
        image_url: equipment.images?.[0] || "",
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
        status: equipment.status,
        created_at: equipment.created_at,
        updated_at: equipment.updated_at,
      };
    }
    return null;
  }, [equipment]);

  const currentEquipment = equipmentForDisplayDb;
  const { data: similarEquipmentFromDb } = useSimilarEquipment(
    currentEquipment?.category || '',
    currentEquipment?.id || '',
    currentEquipment?.name || '',
    currentEquipment?.location?.lat,
    currentEquipment?.location?.lng
  );

  // Use real similar equipment data, fallback to empty array
  const similarEquipment = similarEquipmentFromDb || [];

  const equipmentName = currentEquipment?.name;
  const gearDisplayName = currentEquipment
    ? buildGearDisplayName(
        currentEquipment.name,
        currentEquipment.specifications?.size,
      )
    : "";
  const categoryDisplay = currentEquipment ? getCategoryDisplayName(currentEquipment.category) : '';
  const lastVerifiedDate = currentEquipment
    ? toISODate(currentEquipment.updated_at || currentEquipment.created_at)
    : toISODate();
  const canonicalPath = currentEquipment
    ? buildGearPath({
        id: currentEquipment.id,
        name: currentEquipment.name,
        size: currentEquipment.specifications?.size,
      })
    : undefined;
  const canonicalUrl = currentEquipment
    ? buildGearCanonicalUrl({
        id: currentEquipment.id,
        name: currentEquipment.name,
        size: currentEquipment.specifications?.size,
      })
    : undefined;

  useEffect(() => {
    if (isCanonicalGearRoute || !canonicalPath) {
      return;
    }

    const nextPath = `${canonicalPath}${location.search}`;
    const currentPath = `${location.pathname}${location.search}`;
    if (nextPath !== currentPath) {
      navigate(nextPath, { replace: true });
    }
  }, [canonicalPath, isCanonicalGearRoute, location.pathname, location.search, navigate]);
  const offers = useMemo(() => {
    if (!currentEquipment || !canonicalUrl) {
      return [];
    }

    const baseOffer = {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: currentEquipment.availability.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      availabilityStarts: lastVerifiedDate,
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      url: canonicalUrl,
    };

    const rentalOffers: Array<Record<string, string>> = [];

    if (Number(currentEquipment.price_per_hour) > 0) {
      rentalOffers.push({
        ...baseOffer,
        name: "Hourly rental",
        price: String(Number(currentEquipment.price_per_hour)),
      });
    }

    if (Number(currentEquipment.price_per_day) > 0) {
      rentalOffers.push({
        ...baseOffer,
        name: "Daily rental",
        price: String(Number(currentEquipment.price_per_day)),
      });
    }

    if (Number(currentEquipment.price_per_week) > 0) {
      rentalOffers.push({
        ...baseOffer,
        name: "Weekly rental",
        price: String(Number(currentEquipment.price_per_week)),
      });
    }

    return rentalOffers;
  }, [currentEquipment, canonicalUrl, lastVerifiedDate]);

  const productSchema = useMemo(() => {
    if (!currentEquipment || !canonicalUrl) {
      return undefined;
    }

    const imageList =
      currentEquipment.images && currentEquipment.images.length > 0
        ? currentEquipment.images
        : [currentEquipment.image_url];
    const validImageList = imageList.filter(Boolean);
    const offerPrices = offers
      .map((offer) => Number(offer.price))
      .filter((price) => Number.isFinite(price));

    const offerSchema =
      offers.length > 1
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: String(Math.min(...offerPrices)),
            highPrice: String(Math.max(...offerPrices)),
            offerCount: String(offers.length),
            offers,
          }
        : offers[0];

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: gearDisplayName || currentEquipment.name,
      description: `${gearDisplayName || currentEquipment.name}. Last verified ${lastVerifiedDate}. Located in ${currentEquipment.location.address}.`,
      image: validImageList,
      url: canonicalUrl,
      category: categoryDisplay || currentEquipment.category,
      offers: offerSchema,
      aggregateRating:
        currentEquipment.review_count > 0 &&
        currentEquipment.rating > 0 &&
        currentEquipment.rating <= 5
          ? {
              "@type": "AggregateRating",
              ratingValue: currentEquipment.rating,
              reviewCount: currentEquipment.review_count,
            }
          : undefined,
    };
  }, [
    canonicalUrl,
    categoryDisplay,
    currentEquipment,
    gearDisplayName,
    lastVerifiedDate,
    offers,
  ]);

  usePageMetadata({
    title: gearDisplayName
      ? `${gearDisplayName} | DemoStoke Gear`
      : "Gear Details | DemoStoke",
    description: gearDisplayName
      ? `${gearDisplayName} available for demo and rental in ${currentEquipment?.location.address}. Last verified ${lastVerifiedDate}.`
      : "View detailed information about this gear listing.",
    image: currentEquipment?.images?.[0] || currentEquipment?.image_url,
    type: "product",
    schema: productSchema,
    canonicalUrl,
  });

  // Shared handlers
  const handleBookNowClick = () => {
    if (currentEquipment) {
      trackEvent("click_reserve", {
        gear_id: currentEquipment.id,
        gear_name: gearDisplayName || currentEquipment.name,
        gear_category: currentEquipment.category,
        owner_id: currentEquipment.owner.id,
        owner_name: currentEquipment.owner.name,
      });
    }

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
        canonicalPath={canonicalPath}
        lastVerifiedDate={lastVerifiedDate}
        gearDisplayName={gearDisplayName || equipmentName || undefined}
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
