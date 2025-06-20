
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
    // Enhanced text matching including description
    const nameMatch = item.name.toLowerCase().includes(lowerQuery);
    const descriptionMatch = item.description?.toLowerCase().includes(lowerQuery) || false;
    
    // Check for individual words in description for better matching
    const queryWords = lowerQuery.split(' ').filter(word => word.length > 2); // Skip short words
    const descriptionWordMatch = queryWords.some(word => 
      item.description?.toLowerCase().includes(word) || 
      item.name.toLowerCase().includes(word)
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
    const ownerNameMatch = item.owner?.name?.toLowerCase().includes(lowerQuery) || false;
    
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
const calculateRelevanceScore = (query: string, item: Equipment, categoryMatches: { [key: string]: number }): number => {
  let score = 0;
  
  // Exact name match gets highest score
  if (item.name.toLowerCase() === query.toLowerCase()) {
    score += 10;
  } else if (item.name.toLowerCase().includes(query.toLowerCase())) {
    score += 5;
  }
  
  // Description matches
  if (item.description?.toLowerCase().includes(query.toLowerCase())) {
    score += 3;
  }
  
  // Category relevance
  score += categoryMatches[item.category] || 0;
  
  // Skill level relevance
  if (checkSkillLevelMatch(query, item.specifications.suitable)) {
    score += 4;
  }
  
  // Owner/brand matches
  if (item.owner?.name?.toLowerCase().includes(query.toLowerCase())) {
    score += 2;
  }
  
  return score;
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
