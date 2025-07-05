
import { Equipment } from "@/types";
import { getEquipmentData } from "./equipment/equipmentDataService";
import { searchWithAI, AISearchResult, AISearchResponse } from "./equipment/aiSearchService";

// AI-enhanced search function
export const searchEquipmentWithNLP = async (query: string): Promise<AISearchResult[]> => {
  console.log(`🔍 Starting AI-enhanced search for query: "${query}"`);
  
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  console.log(`📦 Retrieved ${equipmentData.length} equipment items for AI search`);
  
  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return [];
  }
  
  // Use AI-powered search
  const { results } = await searchWithAI(query, equipmentData);
  console.log(`✅ AI search completed. Found ${results.length} results`);

  return results;
};

export const searchEquipmentWithNLPWithSummary = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<AISearchResponse> => {
  console.log(`🔍 Starting AI-enhanced search for query: "${query}" with summary`);

  const equipmentData = await getEquipmentData();
  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return { results: [], summary: '' };
  }

  const response = await searchWithAI(query, equipmentData, userLocation);
  console.log(`✅ AI search completed. Found ${response.results.length} results`);

  return response;
};

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
