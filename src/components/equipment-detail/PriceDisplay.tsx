import React from "react";
import { Equipment } from "@/types";
import { usePricingOptions } from "@/hooks/usePricingOptions";

interface PriceDisplayProps {
  equipment: Equipment;
  equipmentHeader?: boolean; // Optional prop to indicate if this is used in the header
}

const PriceDisplay = ({ equipment, equipmentHeader }: PriceDisplayProps) => {
  const { data: dbPricingOptions = [], isLoading } = usePricingOptions(equipment.id);

  // Helper to get mock pricing options from equipment
  function getMockPricingOptions(equipment: unknown) {
    if (equipment && typeof equipment === 'object' && 'pricingOptions' in equipment) {
      const eq = equipment as { pricingOptions?: { id: string; price: number; duration: string; }[]; };
      if (Array.isArray(eq.pricingOptions)) {
        return eq.pricingOptions;
      }
    }
    return [];
  }
  const mockPricingOptions = getMockPricingOptions(equipment);

  // Only show DB pricing if there is DB data for this equipment
  const showDbPricing = dbPricingOptions.length > 0;
  const pricingOptions = showDbPricing ? dbPricingOptions : mockPricingOptions;

  // Group and order pricing options
  const getOrderedPricingOptions = (options: Array<{ id: string; price: number; duration: string }>) => {
    // Group options by duration
    const grouped = options.reduce((acc, option) => ({
      ...acc,
      [option.duration]: option
    }), {} as Record<string, { id: string; price: number; duration: string }>);

    // Return array in desired order, filtering out undefined values
    return [
      grouped['day'],
      grouped['week'],
      grouped['hour']
    ].filter(Boolean);
  };

  const getAvailabilityStatusText = () => {
    if (equipment.availability.available) {
      return "Available";
    } else if (equipment.availability.nextAvailableDate) {
      return `Unavailable until ${equipment.availability.nextAvailableDate}`;
    } else {
      return "Currently Unavailable";
    }
  };

  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'hour': return 'hr';
      case 'day': return 'day';
      case 'week': return 'week';
      default: return duration;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-between items-center">
        <div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        {pricingOptions.length > 0 ? (
          <div className="space-y-1">
            {getOrderedPricingOptions(pricingOptions).map((option, index) => (
              <p key={option.id} className={index === 0 ? "text-2xl font-bold text-primary" : "text-lg"}>
                ${option.price} <span className="text-sm font-normal">/ {formatDuration(option.duration)}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-bold">${equipment.price_per_day} <span className="text-sm font-normal">/ day</span></p>
        )}
        {!equipmentHeader && (
          <div className="flex items-center mt-1">
            <span className="text-sm">★ {equipment.rating}</span>
            <span className="mx-1">·</span>
            <span className="text-sm">{equipment.review_count} reviews</span>
          </div>
        )}
      </div>
      {!equipmentHeader && <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 py-1 px-2 rounded">
        {getAvailabilityStatusText()}
      </span>}
    </div>
  );
};

export default PriceDisplay;
