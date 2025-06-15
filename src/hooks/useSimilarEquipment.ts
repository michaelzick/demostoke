
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";

export const useSimilarEquipment = (category: string, excludeId: string) => {
  return useQuery({
    queryKey: ['similarEquipment', category, excludeId],
    queryFn: async (): Promise<Equipment[]> => {
      console.log(`🔍 Fetching similar equipment for category: ${category}, excluding ID: ${excludeId}`);
      
      // Get all equipment data based on app settings (mock or real)
      const allEquipment = await getEquipmentData();
      
      // Filter by category and exclude current item
      const similarEquipment = allEquipment
        .filter(item => item.category === category && item.id !== excludeId)
        .slice(0, 3); // Limit to 3 items for the sidebar
      
      console.log(`✅ Found ${similarEquipment.length} similar equipment items`);
      return similarEquipment;
    },
    enabled: !!category && !!excludeId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
