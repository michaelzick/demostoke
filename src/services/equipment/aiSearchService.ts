
import { Equipment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export interface AISearchResult extends Equipment {
  ai_relevance_score?: number;
  ai_reasoning?: string;
}

export const searchWithAI = async (query: string, equipmentData: Equipment[]): Promise<AISearchResult[]> => {
  console.log(`🤖 Starting AI search for: "${query}"`);
  
  if (!query.trim() || equipmentData.length === 0) {
    return equipmentData as AISearchResult[];
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-search', {
      body: { 
        query: query.trim(),
        equipment: equipmentData 
      }
    });

    if (error) {
      console.error('❌ AI search error:', error);
      return fallbackSearch(query, equipmentData);
    }

    if (data?.fallback) {
      console.log('🔄 AI search failed, using fallback');
      return fallbackSearch(query, equipmentData);
    }

    console.log(`✅ AI search successful: ${data?.results?.length || 0} results`);
    return data?.results || [];

  } catch (error) {
    console.error('❌ AI search exception:', error);
    return fallbackSearch(query, equipmentData);
  }
};

// Fallback to the original search logic if AI fails
const fallbackSearch = (query: string, equipmentData: Equipment[]): AISearchResult[] => {
  console.log('🔄 Using fallback search logic');
  
  const lowerQuery = query.toLowerCase();
  
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
    // Basic text matching
    const nameMatch = item.name.toLowerCase().includes(lowerQuery);
    const descriptionMatch = item.description?.toLowerCase().includes(lowerQuery);
    
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
    const ownerNameMatch = item.owner?.name?.toLowerCase().includes(lowerQuery);
    
    // For generic searches (no specific category or skill level), allow broader matches
    if (categoriesRequested.length === 0 && !hasSkillLevelQuery) {
      return nameMatch || descriptionMatch || ownerNameMatch;
    }
    
    // For specific searches, require both category and skill level to match (if specified)
    // Plus allow name/description matches that also meet the category/skill requirements
    const textMatch = nameMatch || descriptionMatch || ownerNameMatch;
    return categoryMatch && skillLevelMatch && (textMatch || categoriesRequested.length > 0 || hasSkillLevelQuery);
    
  }).sort((a, b) => {
    // Sort by skill level relevance first if query contains skill level
    const skillLevelRelevance = getSkillLevelRelevance(lowerQuery, a, b);
    if (skillLevelRelevance !== 0) return skillLevelRelevance;
    
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

// Extract category keywords from search query
const extractCategoryMatches = (lowerQuery: string) => {
  const categoryMatches: { [key: string]: number } = {
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

// Helper function to provide skill level relevance scoring for sorting
const getSkillLevelRelevance = (query: string, a: Equipment, b: Equipment): number => {
  const aSkillMatch = checkSkillLevelMatch(query, a.specifications.suitable);
  const bSkillMatch = checkSkillLevelMatch(query, b.specifications.suitable);
  
  if (aSkillMatch && !bSkillMatch) return -1; // a is more relevant
  if (!aSkillMatch && bSkillMatch) return 1;  // b is more relevant
  
  return 0; // equal relevance
};
