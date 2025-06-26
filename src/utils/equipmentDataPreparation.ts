
import { mapGearTypeToCategory } from "@/utils/gearTypeMapping";

interface PrepareEquipmentDataParams {
  userId?: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates: { lat: number; lng: number } | null;
  dimensions: { length: string; width: string; thickness?: string };
  measurementUnit: string;
  skillLevel: string;
  pricePerDay: string;
  pricePerHour?: string;
  pricePerWeek?: string;
  finalImageUrl: string;
  damageDeposit?: string;
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
  pricePerDay,
  pricePerHour,
  pricePerWeek,
  finalImageUrl,
  damageDeposit,
}: PrepareEquipmentDataParams) => {
  const buildSizeString = () => {
    let size = dimensions.length;
    if (dimensions.width && dimensions.width.trim()) {
      size += ` x ${dimensions.width}`;
    }
    if (dimensions.thickness && dimensions.thickness.trim()) {
      size += ` x ${dimensions.thickness}`;
    }
    // Only add measurementUnit if width or thickness is present
    if ((dimensions.width && dimensions.width.trim()) || (dimensions.thickness && dimensions.thickness.trim())) {
      size += ` ${measurementUnit}`;
    }
    return size;
  };

  const equipmentData: any = {
    name: gearName,
    category: mapGearTypeToCategory(gearType),
    description,
    image_url: finalImageUrl,
    price_per_day: parseFloat(pricePerDay),
    location_zip: zipCode,
    size: buildSizeString(),
    suitable_skill_level: skillLevel,
    status: 'available',
    visible_on_map: true,
  };

  // Handle optional price columns - set to null if empty string to clear the database value
  if (pricePerHour !== undefined) {
    if (pricePerHour.trim() === '') {
      equipmentData.price_per_hour = null;
    } else {
      equipmentData.price_per_hour = parseFloat(pricePerHour);
    }
  }

  if (pricePerWeek !== undefined) {
    if (pricePerWeek.trim() === '') {
      equipmentData.price_per_week = null;
    } else {
      equipmentData.price_per_week = parseFloat(pricePerWeek);
    }
  }

  // Add damage deposit if provided
  if (damageDeposit && damageDeposit.trim()) {
    equipmentData.damage_deposit = parseFloat(damageDeposit);
  }

  // Add coordinates if available
  if (coordinates) {
    equipmentData.location_lat = coordinates.lat;
    equipmentData.location_lng = coordinates.lng;
  }

  // Add user_id if provided (for new equipment)
  if (userId) {
    equipmentData.user_id = userId;
  }

  console.log('Prepared equipment data:', equipmentData);
  return equipmentData;
};
