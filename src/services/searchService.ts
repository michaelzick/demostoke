
import { Equipment } from "@/types";
import { getEquipmentData } from "./equipment/equipmentDataService";
import { searchWithAI, AISearchResult } from "./equipment/aiSearchService";

// AI-enhanced search function with location support
export const searchEquipmentWithNLP = async (query: string, userLocation?: { lat: number; lng: number }): Promise<AISearchResult[]> => {
  console.log(`🔍 Starting AI-enhanced search for query: "${query}"`);
  
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  console.log(`📦 Retrieved ${equipmentData.length} equipment items for AI search`);
  
  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return [];
  }
  
  // Use AI-powered search with location
  const results = await searchWithAI(query, equipmentData, userLocation);
  console.log(`✅ AI search completed. Found ${results.length} results`);
  
  return results;
};

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
