
import React from "react";
import { Equipment } from "@/types";

interface PriceDisplayProps {
  equipment: Equipment;
}

const PriceDisplay = ({ equipment }: PriceDisplayProps) => {
  const getAvailabilityStatusText = () => {
    if (equipment.availability.available) {
      return "Available";
    } else if (equipment.availability.nextAvailableDate) {
      return `Unavailable until ${equipment.availability.nextAvailableDate}`;
    } else {
      return "Currently Unavailable";
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-2xl font-bold">${equipment.pricePerDay} <span className="text-sm font-normal">/ day</span></p>
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
