
import React from "react";
import { Equipment } from "@/types";
import { usePricingOptions } from "@/hooks/usePricingOptions";

interface PriceDisplayProps {
  equipment: Equipment;
}

const PriceDisplay = ({ equipment }: PriceDisplayProps) => {
  const { data: pricingOptions = [], isLoading } = usePricingOptions(equipment.id);

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
            {pricingOptions.map((option, index) => (
              <p key={option.id} className={index === 0 ? "text-2xl font-bold" : "text-lg"}>
                ${option.price} <span className="text-sm font-normal">/ {formatDuration(option.duration)}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-bold">${equipment.pricePerDay} <span className="text-sm font-normal">/ day</span></p>
        )}
        <div className="flex items-center mt-1">
          <span className="text-sm">★ {equipment.rating}</span>
          <span className="mx-1">·</span>
          <span className="text-sm">{equipment.reviewCount} reviews</span>
        </div>
      </div>
      <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 py-1 px-2 rounded">
        {getAvailabilityStatusText()}
      </span>
    </div>
  );
};

export default PriceDisplay;
