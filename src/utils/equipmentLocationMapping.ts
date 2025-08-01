import { Equipment } from "@/types";
import { UserLocation } from "@/hooks/useUserLocations";

/**
 * Maps filtered equipment to their owner locations
 * Returns only user locations that have equipment in the filtered results
 */
export function getFilteredUserLocations(
  filteredEquipment: Equipment[],
  allUserLocations: UserLocation[]
): UserLocation[] {
  // Get unique owner IDs from filtered equipment
  const ownerIds = new Set(filteredEquipment.map(item => item.owner.id));
  
  // Return only user locations whose IDs are in the filtered equipment owner list
  return allUserLocations.filter(user => ownerIds.has(user.id));
}

/**
 * Maps equipment to map-compatible format for display
 */
export function equipmentToMapFormat(equipment: Equipment[]) {
  return equipment
    .filter(item => item.location?.lat && item.location?.lng)
    .map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price_per_day: item.price_per_day,
      location: {
        lat: item.location.lat,
        lng: item.location.lng,
      },
      ownerId: item.owner.id,
      ownerName: item.owner.name,
    }));
}