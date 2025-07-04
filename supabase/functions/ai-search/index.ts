
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, equipment, userLocation } = await req.json();
    
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
        model: 'gpt-4.1',
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
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;

    console.log('🤖 AI Response:', aiContent);

    // Parse AI response
    let searchResults: SearchAnalysis[];
    try {
      const parsedResponse = JSON.parse(aiContent);
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
          model: 'gpt-4.1',
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
    
    return new Response(
      JSON.stringify({ 
        error: 'AI search failed',
        details: error.message,
        fallback: true 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
