
import { mapGearTypeToCategory } from "./gearTypeMapping";

interface Dimensions {
  length: string;
  width: string;
  thickness?: string;
}

interface PrepareEquipmentDataParams {
  userId?: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
  dimensions: Dimensions;
  measurementUnit: string;
  skillLevel: string;
  firstPricingOptionPrice: string;
  finalImageUrl: string;
  damageDeposit?: string;
}

// Overloaded function to handle both creation (with userId) and update (without userId) scenarios
export function prepareEquipmentData(params: PrepareEquipmentDataParams): any;
export function prepareEquipmentData(
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
): any;

export function prepareEquipmentData(
  paramsOrGearName: PrepareEquipmentDataParams | string,
  gearType?: string,
  description?: string,
  zipCode?: string,
  measurementUnit?: string,
  dimensions?: Dimensions,
  skillLevel?: string,
  price?: number,
  imageUrl?: string,
  coordinates?: { lat: number; lng: number }
) {
  // Handle object parameter (new way)
  if (typeof paramsOrGearName === 'object') {
    const {
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
      damageDeposit
    } = paramsOrGearName;

    const isMountainBike = gearType === "mountain-bike";
    // Use dimensions.length directly as the size - no formatting
    const sizeString = dimensions.length;

    const result: any = {
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
      price_per_day: parseFloat(firstPricingOptionPrice),
      image_url: finalImageUrl,
    };

    // Add damage deposit if provided
    if (damageDeposit) {
      result.damage_deposit = parseFloat(damageDeposit);
    }

    // Only add user_id if it's provided (for creation)
    if (userId) {
      result.user_id = userId;
    }

    return result;
  }

  // Handle individual parameters (old way for backwards compatibility)
  const gearNameParam = paramsOrGearName;
  const isMountainBike = gearType === "mountain-bike";
  // Use dimensions.length directly as the size - no formatting
  const sizeString = dimensions!.length;

  return {
    name: gearNameParam,
    category: mapGearTypeToCategory(gearType!),
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
}
