
import { getEquipmentData } from "./equipment/equipmentDataService";
import { searchWithAI, fallbackSearch, AISearchResult } from "./equipment/aiSearchService";
import { getUseAISearchSetting } from "./equipment/appSettingsService";
import { parseQueryForLocation } from "@/utils/queryParsing";
import { isValidCoordinate, calculateDistance } from "@/utils/distanceCalculation";

// Helper function to determine primary gear category from query
const determinePrimaryCategory = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  const categories: string[] = [];
  
  // Check for specific brand and model combinations that indicate category
  const brandModelPatterns = [
    { brands: ['head', 'rossignol', 'salomon', 'k2', 'volkl', 'atomic', 'blizzard'], category: 'skis' },
    { brands: ['burton', 'lib tech', 'gnu', 'jones', 'capita', 'rome', 'never summer'], category: 'snowboards' },
    { brands: ['lost', 'firewire', 'js', 'sharp eye', 'haydenshapes', 'pyzel', 'channel islands'], category: 'surfboards' },
    { brands: ['specialized', 'trek', 'giant', 'cannondale', 'santa cruz', 'yeti'], category: 'mountain-bikes' }
  ];

  // Check for brand-specific matches first
  for (const pattern of brandModelPatterns) {
    if (pattern.brands.some(brand => lowerQuery.includes(brand))) {
      categories.push(pattern.category);
    }
  }

  // Check for category keywords
  if (lowerQuery.includes("snow") || lowerQuery.includes("snowboard")) {
    categories.push("snowboards");
  }
  if (lowerQuery.includes("ski") && !lowerQuery.includes("snowboard")) {
    categories.push("skis");
  }
  if (lowerQuery.includes("surf") || lowerQuery.includes("surfboard") || lowerQuery.includes("waves")) {
    categories.push("surfboards");
  }
  if (lowerQuery.includes("bike") || lowerQuery.includes("mountain bike") || lowerQuery.includes("mtb") || lowerQuery.includes("cycling")) {
    categories.push("mountain-bikes");
  }

  return [...new Set(categories)]; // Remove duplicates
};

// AI-enhanced search function with location support
export const searchEquipmentWithNLP = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<AISearchResult[]> => {

  const { baseQuery, location, nearMe } = parseQueryForLocation(query);

  const useAISearch = await getUseAISearchSetting();
  
  // Get the appropriate dataset based on global setting
  const equipmentData = await getEquipmentData();
  
  if (equipmentData.length === 0) {
    return [];
  }

  // Determine gear categories from the query
  const detectedCategories = determinePrimaryCategory(baseQuery);
  
  // Filter equipment by detected categories to improve AI search accuracy
  let filteredEquipment = equipmentData;
  if (detectedCategories.length > 0) {
    filteredEquipment = equipmentData.filter(item => 
      detectedCategories.some(category => 
        category.toLowerCase() === item.category.toLowerCase()
      )
    );
  }
  
  // If filtering resulted in too few items, fall back to full dataset
  if (filteredEquipment.length < 3 && detectedCategories.length > 0) {
    filteredEquipment = equipmentData;
  }
  
  let results: AISearchResult[];

  if (!useAISearch) {
    results = fallbackSearch(baseQuery, filteredEquipment);
  } else {
    // Use AI-powered search with filtered equipment
    results = await searchWithAI(baseQuery, filteredEquipment, userLocation);
    
    // Fallback to non-AI search if AI returns 0 results
    if (results.length === 0) {
      results = fallbackSearch(baseQuery, filteredEquipment);
    }
  }


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
