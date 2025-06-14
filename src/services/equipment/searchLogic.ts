
import { Equipment } from "@/types";

interface CategoryMatches {
  [key: string]: number;
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

// Filter and score equipment based on search criteria
export const filterAndScoreEquipment = (
  equipmentData: Equipment[],
  lowerQuery: string,
  categoryMatches: CategoryMatches,
  locationMatches: string[],
  skillLevelKeywords: { isBeginnerSearch: boolean; isIntermediateSearch: boolean; isAdvancedSearch: boolean; }
): Equipment[] => {
  // Check if any specific categories were mentioned
  const categoriesRequested = Object.entries(categoryMatches)
    .filter(([_, score]) => score > 0)
    .map(([category]) => category);

  // Filter equipment based on extracted info
  return equipmentData.filter(item => {
    // If specific categories were mentioned, only show those categories
    if (categoriesRequested.length > 0 && !categoriesRequested.includes(item.category)) {
      return false;
    }

    let score = 0;

    // Category matching (only relevant if categories were specified)
    if (categoryMatches[item.category] > 0) {
      score += categoryMatches[item.category];
    } else if (categoriesRequested.length === 0) {
      // If no categories were specified, don't filter by category
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

    // Description and name matching
    if (item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)) {
      score += 2;
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

    return score > 0;
  });
};

// Sort equipment based on search criteria
export const sortEquipmentByRelevance = (
  equipment: Equipment[],
  categoryMatches: CategoryMatches,
  locationMatches: string[]
): Equipment[] => {
  return equipment.sort((a, b) => {
    // Sort by location match
    if (locationMatches.length > 0) {
      const aLocationMatch = locationMatches.some(loc =>
        a.location.zip.toLowerCase().includes(loc.toLowerCase()));
      const bLocationMatch = locationMatches.some(loc =>
        b.location.zip.toLowerCase().includes(loc.toLowerCase()));

      if (aLocationMatch && !bLocationMatch) return -1;
      if (!aLocationMatch && bLocationMatch) return 1;
    }

    // Then sort by category relevance
    const aCategoryScore = categoryMatches[a.category] || 0;
    const bCategoryScore = categoryMatches[b.category] || 0;
    if (aCategoryScore !== bCategoryScore) {
      return bCategoryScore - aCategoryScore;
    }

    // Finally sort by rating
    return b.rating - a.rating;
  });
};

// Main search logic function
export const processSearchQuery = async (query: string, equipmentData: Equipment[]): Promise<Equipment[]> => {
  console.log(`🔍 Processing natural language query: "${query}"`);

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
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter and score equipment
  const filteredEquipment = filterAndScoreEquipment(
    equipmentData,
    lowerQuery,
    categoryMatches,
    locationMatches,
    skillLevelKeywords
  );

  console.log('🔍 Filtered equipment count:', filteredEquipment.length);

  // Sort by relevance
  const sortedResults = sortEquipmentByRelevance(filteredEquipment, categoryMatches, locationMatches);

  console.log('🔍 Final search results:', sortedResults.length, 'items');

  return sortedResults;
};
