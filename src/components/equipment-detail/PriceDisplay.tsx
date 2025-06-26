
import React from "react";
import { Equipment } from "@/types";

interface PriceDisplayProps {
  equipment: Equipment;
  equipmentHeader?: boolean; // Optional prop to indicate if this is used in the header
}

const PriceDisplay = ({ equipment, equipmentHeader }: PriceDisplayProps) => {
  // Debug logging to see what pricing data we have
  console.log('=== PRICE DISPLAY DEBUG ===');
  console.log('Equipment ID:', equipment.id);
  console.log('Equipment name:', equipment.name);
  console.log('Price per day:', equipment.price_per_day, typeof equipment.price_per_day);
  console.log('Price per hour:', equipment.price_per_hour, typeof equipment.price_per_hour);
  console.log('Price per week:', equipment.price_per_week, typeof equipment.price_per_week);
  console.log('=== END PRICE DEBUG ===');

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

  // Create pricing options from equipment table columns with improved truthiness checks
  const pricingOptions = [];
  
  // Check for day price (should always exist)
  if (equipment.price_per_day !== null && equipment.price_per_day !== undefined && equipment.price_per_day > 0) {
    pricingOptions.push({ price: equipment.price_per_day, duration: 'day' });
  }
  
  // Check for hour price with proper type handling
  if (equipment.price_per_hour !== null && equipment.price_per_hour !== undefined && Number(equipment.price_per_hour) > 0) {
    pricingOptions.push({ price: Number(equipment.price_per_hour), duration: 'hour' });
  }
  
  // Check for week price with proper type handling
  if (equipment.price_per_week !== null && equipment.price_per_week !== undefined && Number(equipment.price_per_week) > 0) {
    pricingOptions.push({ price: Number(equipment.price_per_week), duration: 'week' });
  }

  console.log('Created pricing options:', pricingOptions);

  // Order: day, week, hour - filter out undefined values properly
  const orderedPricingOptions = [
    pricingOptions.find(p => p.duration === 'day'),
    pricingOptions.find(p => p.duration === 'week'),
    pricingOptions.find(p => p.duration === 'hour')
  ].filter((option): option is { price: number; duration: string } => option !== undefined);

  console.log('Ordered pricing options:', orderedPricingOptions);

  return (
    <div className="flex justify-between items-center">
      <div>
        {orderedPricingOptions.length > 0 ? (
          <div className="space-y-1">
            {orderedPricingOptions.map((option, index) => (
              <p key={option.duration} className={
                index === 0 
                  ? "text-2xl font-bold text-primary" 
                  : "text-sm text-muted-foreground"
              }>
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
