
import { mapGearTypeToCategory } from "./gearTypeMapping";

interface Coordinates {
  lat: number;
  lng: number;
}

interface EquipmentDataParams {
  userId: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates: Coordinates | null;
  dimensions: { length: string; width: string; thickness?: string };
  measurementUnit: string;
  skillLevel: string;
  firstPricingOptionPrice: string;
  finalImageUrl: string;
}

export const prepareEquipmentData = ({
  userId,
  gearName,
  gearType,
  description,
  zipCode,
  coordinates,
  dimensions,
  measurementUnit,
  skillLevel,
  firstPricingOptionPrice,
  finalImageUrl,
}: EquipmentDataParams) => {
  const isMountainBike = gearType === "mountain-bike";
  const sizeString = isMountainBike
    ? dimensions.length // For mountain bikes, just use the size (S/M/L/XL/XXL)
    : dimensions.thickness
      ? `${dimensions.length} x ${dimensions.width} x ${dimensions.thickness} ${measurementUnit}`
      : `${dimensions.length} x ${dimensions.width} ${measurementUnit}`;

  const category = mapGearTypeToCategory(gearType);
  console.log('Preparing equipment data - gearType:', gearType, 'mapped category:', category);

  return {
    user_id: userId,
    name: gearName,
    category: category,
    description: description,
    location_zip: zipCode,
    location_lat: coordinates?.lat || null,
    location_lng: coordinates?.lng || null,
    size: sizeString,
    suitable_skill_level: skillLevel,
    price_per_day: parseFloat(firstPricingOptionPrice),
    status: 'available' as const,
    image_url: finalImageUrl,
    rating: 0,
    review_count: 0,
    weight: null,
    material: null
  };
};
