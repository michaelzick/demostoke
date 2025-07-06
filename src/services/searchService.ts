
import { getEquipmentData } from "./equipment/equipmentDataService";
import { searchWithAI, fallbackSearch, AISearchResult } from "./equipment/aiSearchService";
import { getUseAISearchSetting } from "./equipment/appSettingsService";
import { parseQueryForLocation } from "@/utils/queryParsing";
import { isValidCoordinate, calculateDistance } from "@/utils/distanceCalculation";

// AI-enhanced search function with location support
export const searchEquipmentWithNLP = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<AISearchResult[]> => {
  console.log(`🔍 Starting AI-enhanced search for query: "${query}"`);

  const { baseQuery, location, nearMe } = parseQueryForLocation(query);

  const useAISearch = await getUseAISearchSetting();
  
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  console.log(`📦 Retrieved ${equipmentData.length} equipment items for AI search`);
  
  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return [];
  }
  
  let results: AISearchResult[];

  if (!useAISearch) {
    console.log('🤖 AI search disabled - using fallback search');
    results = fallbackSearch(baseQuery, equipmentData);
  } else {
    // Use AI-powered search with cleaned query
    results = await searchWithAI(baseQuery, equipmentData, userLocation);
  }

  console.log(`✅ Search completed. Found ${results.length} results`);

  // Filter by explicit location after "in"
  if (location) {
    const locLower = location.toLowerCase();
    const locationSynonyms: Record<string, string[]> = {
      hawaii: ['hi'],
      california: ['ca'],
      'new york': ['ny'],
      colorado: ['co'],
      oregon: ['or'],
      washington: ['wa']
    };

    const locTerms = [locLower, ...(locationSynonyms[locLower] || [])];

    results = results.filter(item => {
      const address = item.location?.address?.toLowerCase() || '';
      return locTerms.some(term => address.includes(term));
    });
  }

  // If no explicit location or "near me", sort by distance when possible
  if (!location && !nearMe && isValidCoordinate(userLocation?.lat, userLocation?.lng)) {
    results = [...results].sort((a, b) => {
      const distA = calculateDistance(
        userLocation!.lat,
        userLocation!.lng,
        a.location.lat,
        a.location.lng
      );
      const distB = calculateDistance(
        userLocation!.lat,
        userLocation!.lng,
        b.location.lat,
        b.location.lng
      );
      return distA - distB;
    });
  }

  return results;
};

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
