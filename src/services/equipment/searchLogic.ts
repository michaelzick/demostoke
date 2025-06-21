
import { Equipment } from "@/types";
import { AISearchResult } from "./aiSearchService";

// Legacy search logic for backwards compatibility
export const processSearchQuery = async (query: string, equipmentData: Equipment[]): Promise<Equipment[]> => {
  console.log(`🔍 Processing search query (legacy): "${query}"`);

  if (equipmentData.length === 0) {
    console.log('⚠️ No equipment data available for search');
    return [];
  }

  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();

  // Extract search criteria
  const categoryMatches = extractCategoryMatches(lowerQuery);
  const locationMatches = extractLocationMatches(lowerQuery);
  const skillLevelKeywords = extractSkillLevelKeywords(lowerQuery);

  console.log('🔍 Search criteria extracted:', {
    categoryMatches,
    locationMatches,
    skillLevelKeywords,
    equipmentCount: equipmentData.length
  });

  // Add a short delay to simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 300));

  // Filter and score equipment with enhanced text matching
  const filteredEquipment = filterAndScoreEquipmentWithTextPriority(
    equipmentData,
    lowerQuery,
    categoryMatches,
    locationMatches,
    skillLevelKeywords
  );

  console.log('🔍 Filtered equipment count:', filteredEquipment.length);

  // Sort by relevance with text priority scoring
  const sortedResults = sortEquipmentByTextRelevance(filteredEquipment);

  console.log('🔍 Final search results:', sortedResults.length, 'items');

  return sortedResults;
};

// Helper function to process AI search results for display
export const processAISearchResults = (results: AISearchResult[]): AISearchResult[] => {
  return results.map(item => ({
    ...item,
    // Add any additional processing here if needed
    searchScore: item.ai_relevance_score || 0
  }));
};

interface CategoryMatches {
  [key: string]: number;
}

interface EquipmentWithScore extends Equipment {
  searchScore: number;
}

// Extract category keywords from search query
const extractCategoryMatches = (lowerQuery: string): CategoryMatches => {
  const categoryMatches: CategoryMatches = {
    snowboards: 0,
    skis: 0,
    surfboards: 0,
    sups: 0,
    "mountain-bikes": 0,
  };

  // Check for category keywords
  if (lowerQuery.includes("snow") || lowerQuery.includes("snowboard")) {
    categoryMatches.snowboards += 3;
  }
  if (lowerQuery.includes("ski") || lowerQuery.includes("skiing")) {
    categoryMatches.skis += 3;
  }
  if (lowerQuery.includes("surf") || lowerQuery.includes("surfboard") || lowerQuery.includes("waves")) {
    categoryMatches.surfboards += 3;
  }
  if (lowerQuery.includes("paddle") || lowerQuery.includes("sup") || lowerQuery.includes("stand up paddle")) {
    categoryMatches.sups += 3;
  }
  if (lowerQuery.includes("bike") || lowerQuery.includes("mountain bike") || lowerQuery.includes("mtb") || lowerQuery.includes("cycling")) {
    categoryMatches["mountain-bikes"] += 3;
  }

  return categoryMatches;
};

// Extract location keywords from search query
const extractLocationMatches = (lowerQuery: string): string[] => {
  const locations = [
    "Hollywood", "Downtown LA", "Santa Monica", "Venice",
    "Beverly Hills", "Westwood", "Silver Lake", "Echo Park",
    "Koreatown", "Culver City", "Brentwood", "Bel Air",
    "Pasadena", "Glendale", "Burbank"
  ];

  return locations.filter(location =>
    lowerQuery.includes(location.toLowerCase())
  );
};

// Extract skill level keywords from search query
const extractSkillLevelKeywords = (lowerQuery: string) => {
  return {
    isBeginnerSearch: lowerQuery.includes("beginner") || lowerQuery.includes("new") || lowerQuery.includes("learning"),
    isIntermediateSearch: lowerQuery.includes("intermediate"),
    isAdvancedSearch: lowerQuery.includes("advanced") || lowerQuery.includes("expert") || lowerQuery.includes("pro"),
  };
};

// Enhanced filter and score equipment with text priority scoring
const filterAndScoreEquipmentWithTextPriority = (
  equipmentData: Equipment[],
  lowerQuery: string,
  categoryMatches: CategoryMatches,
  locationMatches: string[],
  skillLevelKeywords: { isBeginnerSearch: boolean; isIntermediateSearch: boolean; isAdvancedSearch: boolean; }
): EquipmentWithScore[] => {
  // Check if any specific categories were mentioned
  const categoriesRequested = Object.entries(categoryMatches)
    .filter(([_, score]) => score > 0)
    .map(([category]) => category);

  // Extract individual search terms for text matching
  const searchTerms = lowerQuery.split(/\s+/).filter(term => term.length > 0);

  return equipmentData
    .map(item => {
      let score = 0;
      let textScore = 0;

      // Calculate text matching score with priority: title > subcategory > description
      searchTerms.forEach(term => {
        // Title matching (highest priority - 10 points)
        if (item.name.toLowerCase().includes(term)) {
          textScore += 10;
        }
        
        // Subcategory matching (medium priority - 7 points)
        if (item.subcategory && item.subcategory.toLowerCase().includes(term)) {
          textScore += 7;
        }
        
        // Description matching (lowest priority - 3 points)
        if (item.description && item.description.toLowerCase().includes(term)) {
          textScore += 3;
        }
      });

      // Category filtering and scoring
      if (categoriesRequested.length > 0) {
        if (!categoriesRequested.includes(item.category)) {
          return null; // Filter out items that don't match requested categories
        }
        score += categoryMatches[item.category] || 0;
      } else {
        // If no specific categories requested, give base score
        score += 1;
      }

      // Location matching
      if (locationMatches.length > 0) {
        if (locationMatches.some(loc =>
          item.location.zip.toLowerCase().includes(loc.toLowerCase()))) {
          score += 2;
        }
      } else {
        // If no locations were specified, don't filter by location
        score += 1;
      }

      // Skill level matching
      if (skillLevelKeywords.isBeginnerSearch && item.specifications.suitable.toLowerCase().includes("beginner")) {
        score += 2;
      }
      if (skillLevelKeywords.isIntermediateSearch && item.specifications.suitable.toLowerCase().includes("intermediate")) {
        score += 2;
      }
      if (skillLevelKeywords.isAdvancedSearch && item.specifications.suitable.toLowerCase().includes("advanced")) {
        score += 2;
      }

      // Combine text score with other factors
      const totalScore = textScore + score;

      // Only return items with some relevance
      return totalScore > 0 ? { ...item, searchScore: totalScore } : null;
    })
    .filter((item): item is EquipmentWithScore => item !== null);
};

// Sort equipment based on text relevance priority
const sortEquipmentByTextRelevance = (equipment: EquipmentWithScore[]): Equipment[] => {
  return equipment
    .sort((a, b) => {
      // Primary sort: by search score (higher is better)
      if (a.searchScore !== b.searchScore) {
        return b.searchScore - a.searchScore;
      }

      // Secondary sort: by rating (higher is better)
      return b.rating - a.rating;
    })
    .map(({ searchScore, ...item }) => item); // Remove searchScore from final result
};

// Legacy functions for backwards compatibility
export const filterAndScoreEquipment = (
  equipmentData: Equipment[],
  lowerQuery: string,
  categoryMatches: CategoryMatches,
  locationMatches: string[],
  skillLevelKeywords: { isBeginnerSearch: boolean; isIntermediateSearch: boolean; isAdvancedSearch: boolean; }
): Equipment[] => {
  return filterAndScoreEquipmentWithTextPriority(
    equipmentData,
    lowerQuery,
    categoryMatches,
    locationMatches,
    skillLevelKeywords
  );
};

export const sortEquipmentByRelevance = (
  equipment: Equipment[],
  categoryMatches: CategoryMatches,
  locationMatches: string[]
): Equipment[] => {
  // Convert to EquipmentWithScore for sorting
  const equipmentWithScore: EquipmentWithScore[] = equipment.map(item => ({
    ...item,
    searchScore: (categoryMatches[item.category] || 0) + 
                 (locationMatches.some(loc => item.location.zip.toLowerCase().includes(loc.toLowerCase())) ? 2 : 0)
  }));
  
  return sortEquipmentByTextRelevance(equipmentWithScore);
};
