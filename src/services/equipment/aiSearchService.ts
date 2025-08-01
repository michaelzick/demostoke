
import { Equipment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Simple map of singular/plural synonyms for gear types
const SEARCH_SYNONYMS: { [key: string]: string[] } = {
  surfboards: ["surfboard"],
  surfboard: ["surfboards"],
  snowboards: ["snowboard"],
  snowboard: ["snowboards"],
  skis: ["ski"],
  ski: ["skis"],
  "mountain-bikes": ["mountain-bike"],
  "mountain-bike": ["mountain-bikes"],
};

const expandSearchVariants = (term: string): string[] => {
  const variants = SEARCH_SYNONYMS[term] || [];
  return [term, ...variants];
};

export interface AISearchResult extends Equipment {
  ai_relevance_score?: number;
  ai_reasoning?: string;
}

export const searchWithAI = async (query: string, equipmentData: Equipment[], userLocation?: { lat: number; lng: number }): Promise<AISearchResult[]> => {

  if (!query.trim() || equipmentData.length === 0) {
    return equipmentData as AISearchResult[];
  }

  // Auto-detect location need
  let finalUserLocation = userLocation;
  const queryLower = query.toLowerCase();
  const needsLocation = !userLocation && !queryLower.includes('near me') && 
    !['hawaii', 'california', 'lake tahoe', 'tahoe', 'los angeles', 'san francisco', 'san diego'].some(loc => queryLower.includes(loc));

  // Try to get user location if not provided and search would benefit from it
  if (needsLocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          timeout: 3000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes cache
        });
      });
      finalUserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
    } catch (locationError) {
      // Continue without location - AI will handle this gracefully
    }
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-search', {
      body: {
        query: query.trim(),
        equipment: equipmentData,
        userLocation: finalUserLocation
      }
    });

    if (error) {
      console.error('❌ AI search error:', error);
      return fallbackSearch(query, equipmentData);
    }

    if (data?.fallback) {
      return fallbackSearch(query, equipmentData);
    }

    return data?.results || [];

  } catch (error) {
    console.error('❌ AI search exception:', error);
    return fallbackSearch(query, equipmentData);
  }
};

// Fallback to the original search logic if AI fails
export const fallbackSearch = (query: string, equipmentData: Equipment[]): AISearchResult[] => {

  const lowerQuery = query.toLowerCase();
  const queryVariants = expandSearchVariants(lowerQuery);

  // Extract search criteria
  const categoryMatches = extractCategoryMatches(lowerQuery);
  const skillLevelKeywords = extractSkillLevelKeywords(lowerQuery);

  // Check if specific categories and skill levels were mentioned
  const categoriesRequested = Object.entries(categoryMatches)
    .filter(([_, score]) => score > 0)
    .map(([category]) => category);

  const hasSkillLevelQuery = skillLevelKeywords.isBeginnerSearch ||
    skillLevelKeywords.isIntermediateSearch ||
    skillLevelKeywords.isAdvancedSearch;

  return equipmentData.filter(item => {
    // Enhanced text matching including description with synonym support
    const itemName = item.name.toLowerCase();
    const itemDescription = item.description?.toLowerCase() || "";
    const nameMatch = queryVariants.some(v => itemName.includes(v));
    const descriptionMatch = queryVariants.some(v => itemDescription.includes(v));

    // Check for individual words in description for better matching
    const queryWords = lowerQuery.split(' ').filter(word => word.length > 2); // Skip short words
    const wordVariants = queryWords.flatMap(w => expandSearchVariants(w));
    const descriptionWordMatch = wordVariants.some(word =>
      itemDescription.includes(word) || itemName.includes(word)
    );

    // Category matching - if categories were specified, item must match one of them
    let categoryMatch = true;
    if (categoriesRequested.length > 0) {
      categoryMatch = categoriesRequested.includes(item.category);
    }

    // Skill level matching - if skill level was specified, item must match
    let skillLevelMatch = true;
    if (hasSkillLevelQuery) {
      skillLevelMatch = checkSkillLevelMatch(lowerQuery, item.specifications.suitable);
    }

    // Owner name matching for brand searches
    const ownerName = item.owner?.name?.toLowerCase() || "";
    const ownerNameMatch = queryVariants.some(v => ownerName.includes(v));

    // Combined text matching
    const textMatch = nameMatch || descriptionMatch || descriptionWordMatch || ownerNameMatch;

    // If specific categories or skill levels are requested, require strict matching
    if (categoriesRequested.length > 0 || hasSkillLevelQuery) {
      return categoryMatch && skillLevelMatch && textMatch;
    }

    // For general searches, allow broader matches
    return textMatch;

  }).sort((a, b) => {
    // Calculate relevance scores for better sorting
    const aScore = calculateRelevanceScore(lowerQuery, a, categoryMatches);
    const bScore = calculateRelevanceScore(lowerQuery, b, categoryMatches);

    if (aScore !== bScore) {
      return bScore - aScore; // Higher score first
    }

    // Finally sort by rating
    return b.rating - a.rating;
  });
};

// Calculate relevance score for better sorting
const calculateRelevanceScore = (query: string, item: Equipment, categoryMatches: { [key: string]: number; }): number => {
  let score = 0;
  const queryVariants = expandSearchVariants(query.toLowerCase());

  // Exact name match gets highest score
  const itemName = item.name.toLowerCase();
  if (queryVariants.some(v => itemName === v)) {
    score += 10;
  } else if (queryVariants.some(v => itemName.includes(v))) {
    score += 5;
  }

  // Description matches
  const itemDescription = item.description?.toLowerCase() || "";
  if (queryVariants.some(v => itemDescription.includes(v))) {
    score += 3;
  }

  // Category relevance
  score += categoryMatches[item.category] || 0;

  // Skill level relevance
  if (checkSkillLevelMatch(query, item.specifications.suitable)) {
    score += 4;
  }

  // Owner/brand matches
  const ownerName = item.owner?.name?.toLowerCase() || "";
  if (queryVariants.some(v => ownerName.includes(v))) {
    score += 2;
  }

  return score;
};

// Extract category keywords from search query
const extractCategoryMatches = (lowerQuery: string) => {
  const categoryMatches: { [key: string]: number; } = {
    snowboards: 0,
    skis: 0,
    surfboards: 0,
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
  if (lowerQuery.includes("bike") || lowerQuery.includes("mountain bike") || lowerQuery.includes("mtb") || lowerQuery.includes("cycling")) {
    categoryMatches["mountain-bikes"] += 3;
  }

  return categoryMatches;
};

// Extract skill level keywords from search query
const extractSkillLevelKeywords = (lowerQuery: string) => {
  return {
    isBeginnerSearch: lowerQuery.includes("beginner") || lowerQuery.includes("beginners") || lowerQuery.includes("new") || lowerQuery.includes("learning"),
    isIntermediateSearch: lowerQuery.includes("intermediate"),
    isAdvancedSearch: lowerQuery.includes("advanced") || lowerQuery.includes("expert") || lowerQuery.includes("pro"),
  };
};

// Helper function to check if skill level in query matches equipment suitability
const checkSkillLevelMatch = (query: string, suitable: string): boolean => {
  const suitableLower = suitable.toLowerCase();

  // Check for skill level keywords in query
  if (query.includes('beginner') || query.includes('beginners') || query.includes('new') || query.includes('learning')) {
    return suitableLower.includes('beginner');
  }

  if (query.includes('intermediate')) {
    return suitableLower.includes('intermediate');
  }

  if (query.includes('advanced') || query.includes('expert') || query.includes('pro')) {
    return suitableLower.includes('advanced') || suitableLower.includes('expert');
  }

  return false;
};
