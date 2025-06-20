
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
  
  return equipmentData.filter(item => {
    // Basic text matching
    const nameMatch = item.name.toLowerCase().includes(lowerQuery);
    const descriptionMatch = item.description?.toLowerCase().includes(lowerQuery);
    const categoryMatch = item.category.toLowerCase().includes(lowerQuery);
    
    // Check if owner has brand-like information in their name
    const ownerNameMatch = item.owner?.name?.toLowerCase().includes(lowerQuery);
    
    // Skill level matching - check if query contains skill level keywords
    const skillLevelMatch = checkSkillLevelMatch(lowerQuery, item.specifications.suitable);
    
    // Category keyword matching
    const categoryKeywords = {
      'bike': 'mountain-bikes',
      'mountain bike': 'mountain-bikes',
      'mtb': 'mountain-bikes',
      'surf': 'surfboards',
      'surfboard': 'surfboards',
      'snow': 'snowboards',
      'snowboard': 'snowboards',
      'ski': 'skis',
      'paddle': 'sups',
      'sup': 'sups'
    };
    
    const categoryKeywordMatch = Object.entries(categoryKeywords).some(([keyword, category]) => 
      lowerQuery.includes(keyword) && item.category === category
    );
    
    return nameMatch || descriptionMatch || categoryMatch || ownerNameMatch || categoryKeywordMatch || skillLevelMatch;
  }).sort((a, b) => {
    // Sort by skill level relevance first if query contains skill level
    const skillLevelRelevance = getSkillLevelRelevance(lowerQuery, a, b);
    if (skillLevelRelevance !== 0) return skillLevelRelevance;
    
    // Then sort by rating as fallback
    return b.rating - a.rating;
  });
};

// Helper function to check if skill level in query matches equipment suitability
const checkSkillLevelMatch = (query: string, suitable: string): boolean => {
  const suitableLower = suitable.toLowerCase();
  
  // Check for skill level keywords in query
  if (query.includes('beginner') || query.includes('beginners')) {
    return suitableLower.includes('beginner');
  }
  
  if (query.includes('intermediate')) {
    return suitableLower.includes('intermediate');
  }
  
  if (query.includes('advanced') || query.includes('expert')) {
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
