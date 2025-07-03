
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";
import { calculateDistance, isValidCoordinate } from "@/utils/distanceCalculation";

export const useSimilarEquipment = (
  category: string,
  excludeId: string,
  lat?: number,
  lng?: number
) => {
  return useQuery({
    queryKey: ['similarEquipment', category, excludeId, lat, lng],
    queryFn: async (): Promise<Equipment[]> => {
      console.log(
        `🔍 Fetching similar equipment for category: ${category}, excluding ID: ${excludeId}`
      );

      // Get all equipment data based on app settings (mock or real)
      const allEquipment = await getEquipmentData();

      // Filter by category and exclude current item first
      let similarEquipment = allEquipment.filter(
        (item) => item.category === category && item.id !== excludeId
      );

      // If we have valid coordinates for the current item, further filter by distance
      if (isValidCoordinate(lat, lng)) {
        similarEquipment = similarEquipment.filter((item) => {
          if (!isValidCoordinate(item.location?.lat, item.location?.lng)) {
            return false;
          }
          const distance = calculateDistance(
            lat as number,
            lng as number,
            item.location!.lat,
            item.location!.lng
          );
          return distance <= 50; // only include equipment within 50 miles
        });
      }

      // Limit to 3 items for the sidebar
      similarEquipment = similarEquipment.slice(0, 3);

      console.log(`✅ Found ${similarEquipment.length} similar equipment items`);
      return similarEquipment;
    },
    enabled: !!category && !!excludeId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
