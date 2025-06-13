
import { mapGearTypeToCategory } from "./gearTypeMapping";

interface Dimensions {
  length: string;
  width: string;
  thickness?: string;
}

export const prepareEquipmentData = (
  gearName: string,
  gearType: string,
  description: string,
  zipCode: string,
  measurementUnit: string,
  dimensions: Dimensions,
  skillLevel: string,
  price: number,
  imageUrl: string,
  coordinates?: { lat: number; lng: number }
) => {
  const isMountainBike = gearType === "mountain-bike";
  const sizeString = isMountainBike
    ? dimensions.length // For mountain bikes, just use the size (S/M/L/XL/XXL)
    : dimensions.thickness
      ? `${dimensions.length} x ${dimensions.width} x ${dimensions.thickness} ${measurementUnit}`
      : `${dimensions.length} x ${dimensions.width} ${measurementUnit}`;

  return {
    name: gearName,
    category: mapGearTypeToCategory(gearType),
    description: description,
    location_zip: zipCode,
    ...(coordinates && {
      location_lat: coordinates.lat,
      location_lng: coordinates.lng,
    }),
    size: sizeString,
    suitable_skill_level: skillLevel,
    price_per_day: price,
    image_url: imageUrl,
  };
};
