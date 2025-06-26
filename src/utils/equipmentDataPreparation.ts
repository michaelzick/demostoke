
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
  const equipmentData: any = {
    name: gearName,
    category: mapGearTypeToCategory(gearType),
    description,
    image_url: finalImageUrl,
    price_per_day: parseFloat(pricePerDay),
    location_zip: zipCode,
    size: `${dimensions.length} x ${dimensions.width}${dimensions.thickness ? ` x ${dimensions.thickness}` : ''} ${measurementUnit}`,
    suitable_skill_level: skillLevel,
    status: 'available',
    visible_on_map: true,
  };

  // Add optional price columns
  if (pricePerHour && pricePerHour.trim()) {
    equipmentData.price_per_hour = parseFloat(pricePerHour);
  }
  
  if (pricePerWeek && pricePerWeek.trim()) {
    equipmentData.price_per_week = parseFloat(pricePerWeek);
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
