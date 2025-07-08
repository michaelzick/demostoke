
import { mapGearTypeToCategory } from "@/utils/gearTypeMapping";

interface PrepareEquipmentDataParams {
  userId?: string;
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode to address
  coordinates: { lat: number; lng: number } | null;
  size: string;
  skillLevel: string;
  pricePerDay: string;
  pricePerHour?: string;
  pricePerWeek?: string;
  finalImageUrl: string;
  damageDeposit: string;
}

export const prepareEquipmentData = ({
  userId,
  gearName,
  gearType,
  description,
  address, // Changed from zipCode to address
  coordinates,
  size,
  skillLevel,
  pricePerDay,
  pricePerHour,
  pricePerWeek,
  finalImageUrl,
  damageDeposit,
}: PrepareEquipmentDataParams) => {
  // Parse numeric values
  const parsedPricePerDay = parseFloat(pricePerDay) || 0;
  const parsedPricePerHour = pricePerHour && pricePerHour.trim() ? parseFloat(pricePerHour) : null;
  const parsedPricePerWeek = pricePerWeek && pricePerWeek.trim() ? parseFloat(pricePerWeek) : null;
  const parsedDamageDeposit = damageDeposit && damageDeposit.trim() ? parseFloat(damageDeposit) : null;

  const equipmentData: Record<string, unknown> = {
    name: gearName,
    category: mapGearTypeToCategory(gearType),
    description: description,
    image_url: finalImageUrl,
    location_address: address, // Changed from location_zip to location_address
    size: size,
    suitable_skill_level: skillLevel,
    price_per_day: parsedPricePerDay,
    price_per_hour: parsedPricePerHour,
    price_per_week: parsedPricePerWeek,
    damage_deposit: parsedDamageDeposit,
    status: 'available',
    visible_on_map: true,
  };

  // Add coordinates if available
  if (coordinates) {
    equipmentData.location_lat = coordinates.lat;
    equipmentData.location_lng = coordinates.lng;
  }

  // Add user_id only if provided (for creation, not updates)
  if (userId) {
    equipmentData.user_id = userId;
  }

  console.log('Prepared equipment data:', equipmentData);
  return equipmentData;
};
