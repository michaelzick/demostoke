
import { Equipment } from "@/types";
import { getEquipmentData } from "./equipment/equipmentDataService";
import { processSearchQuery } from "./equipment/searchLogic";

// Simulated AI-based search function
export const searchEquipmentWithNLP = async (query: string): Promise<Equipment[]> => {
  console.log(`🔍 Starting search for query: "${query}"`);
  
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  console.log(`📦 Retrieved ${equipmentData.length} equipment items for search`);
  
  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return [];
  }
  
  // Process the search query
  const results = await processSearchQuery(query, equipmentData);
  console.log(`✅ Search completed. Found ${results.length} results`);
  
  return results;
};

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
