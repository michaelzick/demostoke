
import React from "react";
import { Equipment } from "@/types";

interface PriceDisplayProps {
  equipment: Equipment;
  equipmentHeader?: boolean; // Optional prop to indicate if this is used in the header
}

const PriceDisplay = ({ equipment, equipmentHeader }: PriceDisplayProps) => {
  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'hour': return 'hr';
      case 'day': return 'day';
      case 'week': return 'week';
      default: return duration;
    }
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

  // Create pricing options from equipment table columns
  const pricingOptions = [];
  
  if (equipment.price_per_day) {
    pricingOptions.push({ price: equipment.price_per_day, duration: 'day' });
  }
  if (equipment.price_per_hour) {
    pricingOptions.push({ price: equipment.price_per_hour, duration: 'hour' });
  }
  if (equipment.price_per_week) {
    pricingOptions.push({ price: equipment.price_per_week, duration: 'week' });
  }

  // Order: day, week, hour
  const orderedPricingOptions = [
    pricingOptions.find(p => p.duration === 'day'),
    pricingOptions.find(p => p.duration === 'week'),
    pricingOptions.find(p => p.duration === 'hour')
  ].filter(Boolean);

  return (
    <div className="flex justify-between items-center">
      <div>
        {orderedPricingOptions.length > 0 ? (
          <div className="space-y-1">
            {orderedPricingOptions.map((option, index) => (
              <p key={option.duration} className={index === 0 ? "text-2xl font-bold text-primary" : "text-lg"}>
                ${option.price} <span className="text-sm font-normal">/ {formatDuration(option.duration)}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-bold text-primary">${equipment.price_per_day} <span className="text-sm font-normal">/ day</span></p>
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
