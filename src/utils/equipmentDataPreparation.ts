
import { mapGearTypeToCategory } from "@/utils/gearTypeMapping";

interface PrepareEquipmentDataParams {
  userId?: string;
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  coordinates: { lat: number; lng: number } | null;
  size: string;
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
  size,
  skillLevel,
  pricePerDay,
  pricePerHour,
  pricePerWeek,
  finalImageUrl,
  damageDeposit,
}: PrepareEquipmentDataParams) => {
  const equipmentData: any = {
    name: gearName,
    category: mapGearTypeToCategory(gearType),
    description,
    image_url: finalImageUrl,
    price_per_day: parseFloat(pricePerDay),
    location_zip: zipCode,
    size: size,
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

  // Add damage deposit - set to null if empty string to clear the database value
  if (damageDeposit !== undefined) {
    if (damageDeposit.trim() === '') {
      equipmentData.damage_deposit = null;
    } else {
      equipmentData.damage_deposit = parseFloat(damageDeposit);
    }
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
