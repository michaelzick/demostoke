
import { Equipment } from "@/types";
import { getEquipmentData } from "./equipment/equipmentDataService";
import { processSearchQuery } from "./equipment/searchLogic";

// Simulated AI-based search function
export const searchEquipmentWithNLP = async (query: string): Promise<Equipment[]> => {
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  
  // Process the search query
  return await processSearchQuery(query, equipmentData);
};

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
