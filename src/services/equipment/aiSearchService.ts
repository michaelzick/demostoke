
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
    const brandMatch = item.specifications?.brand?.toLowerCase().includes(lowerQuery);
    
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
    
    return nameMatch || descriptionMatch || categoryMatch || brandMatch || categoryKeywordMatch;
  }).sort((a, b) => {
    // Sort by rating as fallback
    return b.rating - a.rating;
  });
};
