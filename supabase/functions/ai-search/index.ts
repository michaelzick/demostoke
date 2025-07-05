
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  price_per_day: number;
  rating: number;
  distance: number;
  specifications: {
    suitable: string;
    brand?: string;
    material?: string;
    size?: string;
  };
  location: {
    zip: string;
    lat: number;
    lng: number;
  };
}

interface SearchAnalysis {
  equipment_id: string;
  relevance_score: number;
  reasoning: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

// Basic fallback search utilities used when the OpenAI API fails
const extractCategoryMatches = (lowerQuery: string) => {
  const categoryMatches: Record<string, number> = {
    snowboards: 0,
    skis: 0,
    "mountain-bikes": 0,
    surfboards: 0,
  };

  if (lowerQuery.includes("snow")) categoryMatches.snowboards += 3;
  if (lowerQuery.includes("ski")) categoryMatches.skis += 3;
  if (lowerQuery.includes("bike")) categoryMatches["mountain-bikes"] += 3;
  if (lowerQuery.includes("surf")) categoryMatches.surfboards += 3;

  return categoryMatches;
};

const extractSkillLevelKeywords = (lowerQuery: string) => ({
  isBeginnerSearch:
    lowerQuery.includes("beginner") ||
    lowerQuery.includes("beginners") ||
    lowerQuery.includes("new"),
  isIntermediateSearch: lowerQuery.includes("intermediate"),
  isAdvancedSearch:
    lowerQuery.includes("advanced") ||
    lowerQuery.includes("expert") ||
    lowerQuery.includes("pro"),
});

const checkSkillLevelMatch = (query: string, suitable: string): boolean => {
  const suitableLower = suitable.toLowerCase();
  if (query.includes("beginner")) return suitableLower.includes("beginner");
  if (query.includes("intermediate"))
    return suitableLower.includes("intermediate");
  if (query.includes("advanced") || query.includes("expert") || query.includes("pro")) {
    return (
      suitableLower.includes("advanced") || suitableLower.includes("expert")
    );
  }
  return false;
};

const calculateRelevanceScore = (
  query: string,
  item: Equipment,
  categoryMatches: Record<string, number>
): number => {
  let score = 0;
  const qLower = query.toLowerCase();

  if (item.name.toLowerCase() === qLower) score += 10;
  else if (item.name.toLowerCase().includes(qLower)) score += 5;

  if (item.description?.toLowerCase().includes(qLower)) score += 3;

  score += categoryMatches[item.category] || 0;

  if (checkSkillLevelMatch(qLower, item.specifications.suitable)) score += 4;

  if (item?.owner?.name?.toLowerCase().includes(qLower)) score += 2;

  return score;
};

const fallbackSearch = (query: string, equipmentData: Equipment[]): Equipment[] => {
  const lowerQuery = query.toLowerCase();
  const categoryMatches = extractCategoryMatches(lowerQuery);
  const skillKeywords = extractSkillLevelKeywords(lowerQuery);

  const categoriesRequested = Object.entries(categoryMatches)
    .filter(([_, v]) => v > 0)
    .map(([c]) => c);

  const hasSkillLevelQuery =
    skillKeywords.isBeginnerSearch ||
    skillKeywords.isIntermediateSearch ||
    skillKeywords.isAdvancedSearch;

  return equipmentData
    .filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery) || false;
      const queryWords = lowerQuery.split(" ").filter((w) => w.length > 2);
      const descWordMatch = queryWords.some(
        (word) =>
          item.description?.toLowerCase().includes(word) ||
          item.name.toLowerCase().includes(word)
      );

      let categoryMatch = true;
      if (categoriesRequested.length > 0) {
        categoryMatch = categoriesRequested.includes(item.category);
      }

      let skillLevelMatch = true;
      if (hasSkillLevelQuery) {
        skillLevelMatch = checkSkillLevelMatch(lowerQuery, item.specifications.suitable);
      }

      const ownerMatch = item.owner?.name?.toLowerCase().includes(lowerQuery) || false;
      const textMatch = nameMatch || descMatch || descWordMatch || ownerMatch;

      if (categoriesRequested.length > 0 || hasSkillLevelQuery) {
        return categoryMatch && skillLevelMatch && textMatch;
      }

      return textMatch;
    })
    .sort((a, b) => {
      const aScore = calculateRelevanceScore(lowerQuery, a, categoryMatches);
      const bScore = calculateRelevanceScore(lowerQuery, b, categoryMatches);
      if (aScore !== bScore) return bScore - aScore;
      return b.rating - a.rating;
    });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let query = '';
  let equipment: Equipment[] = [];
  let userLocation: UserLocation | undefined;

  try {
    const body = await req.json();
    query = body.query;
    equipment = body.equipment;
    userLocation = body.userLocation;
    
    if (!query || !equipment || !Array.isArray(equipment)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 AI Search: Processing query "${query}" for ${equipment.length} items`);

    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
    ): number => {
      const R = 6371; // km
      const toRad = (val: number) => (val * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Create a simplified version of equipment data for AI analysis
    const equipmentSummary = equipment.map((item: Equipment) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description || '',
      brand: item.specifications?.brand || 'Unknown',
      suitable: item.specifications?.suitable || 'All levels',
      material: item.specifications?.material || '',
      size: item.specifications?.size || '',
      location: item.location?.zip || '',
      distance_from_user: userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.location.lat,
            item.location.lng
          )
        : undefined,
      price: item.price_per_day,
      rating: item.rating
    }));

    const locationNote = userLocation
      ? `The user is located at latitude ${userLocation.lat.toFixed(4)}, longitude ${userLocation.lng.toFixed(4)}.`
      : 'User location not provided.';

    const prompt = `You are an expert outdoor gear search assistant. ${locationNote} Analyze the following search query and equipment inventory to determine relevance scores.

SEARCH QUERY: "${query}"

EQUIPMENT INVENTORY:
${JSON.stringify(equipmentSummary, null, 2)}

INSTRUCTIONS:
1. Score each equipment item from 0-100 based on relevance to the search query
2. Consider these factors in order of importance:
   - Exact category matching (e.g., "mountain bikes" for mountain-bikes category)
   - Skill level matching (e.g., "beginner" must match "suitable for beginners")
   - Name and description content matching (search for keywords in both name and description)
   - Brand name matching (e.g., "DHD" should match DHD surfboards)
   - Equipment attributes (size, material, style)
   - Semantic understanding (e.g., "bikes" = mountain bikes, "boards" = surfboards/snowboards)
   - Location relevance if mentioned; prefer items with a smaller distance_from_user value when provided

3. STRICT FILTERING RULES:
   - If query specifies a category (like "mountain bike"), ONLY return items from that category
   - If query specifies skill level (like "beginner"), ONLY return items suitable for that level
   - Items that don't match both category AND skill level (when specified) should get score 0

4. Provide brief reasoning for scores above 25

RESPOND WITH VALID JSON ONLY in this exact format:
{
  "results": [
    {
      "equipment_id": "item_id",
      "relevance_score": 85,
      "reasoning": "Perfect match for beginner mountain bike - category and skill level both match"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a search relevance expert. Always respond with valid JSON only. Pay special attention to category and skill level matching.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContentRaw = aiResponse.choices[0].message.content || '';

    console.log('🤖 AI Response:', aiContentRaw);

    // Clean any Markdown code fences that may wrap the JSON
    const codeBlockMatch = aiContentRaw.match(/```(?:json)?\n([\s\S]*?)```/);
    const aiContent = codeBlockMatch ? codeBlockMatch[1] : aiContentRaw;

    // Parse AI response
    let searchResults: SearchAnalysis[];
    try {
      const parsedResponse = JSON.parse(aiContent.trim());
      searchResults = parsedResponse.results || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to empty results if AI response is malformed
      searchResults = [];
    }

    // Create a map for quick lookup
    const scoreMap = new Map<string, { score: number; reasoning: string }>();
    searchResults.forEach(result => {
      scoreMap.set(result.equipment_id, {
        score: result.relevance_score,
        reasoning: result.reasoning
      });
    });

    // Filter and sort equipment based on AI analysis
    const filteredEquipment = equipment
      .map((item: Equipment) => {
        const aiResult = scoreMap.get(item.id);
        return {
          ...item,
          ai_relevance_score: aiResult?.score || 0,
          ai_reasoning: aiResult?.reasoning || ''
        };
      })
      .filter((item: any) => item.ai_relevance_score > 25) // Only include items with reasonable relevance
      .sort((a: any, b: any) => {
        // Primary sort: AI relevance score
        if (b.ai_relevance_score !== a.ai_relevance_score) {
          return b.ai_relevance_score - a.ai_relevance_score;
        }
        // Secondary sort: rating
        return b.rating - a.rating;
      });

    console.log(`✅ AI Search complete: ${filteredEquipment.length} relevant items found`);

    let summary = '';
    try {
      const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content: 'You provide concise summaries of outdoor gear search results.'
            },
            {
              role: 'user',
              content: `Summarize the search results for "${query}" in 1-3 sentences.`
            }
          ],
          temperature: 0.6,
          max_tokens: 120,
          response_format: { type: 'text' }
        }),
      });

      if (summaryResponse.ok) {
        const summaryJson = await summaryResponse.json();
        summary = summaryJson.choices[0].message.content.trim();
      }
    } catch (summaryErr) {
      console.error('Summary generation failed:', summaryErr);
    }

    return new Response(
      JSON.stringify({
        results: filteredEquipment,
        total_analyzed: equipment.length,
        relevant_found: filteredEquipment.length,
        summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI Search error:', error);
    const fallbackResults = fallbackSearch(query, equipment);

    return new Response(
      JSON.stringify({
        results: fallbackResults,
        total_analyzed: equipment.length,
        relevant_found: fallbackResults.length,
        fallback: true,
        error: 'AI search failed',
        details: error.message
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
