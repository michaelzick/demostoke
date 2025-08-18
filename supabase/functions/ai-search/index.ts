
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
    address: string;
  };
}

interface SearchAnalysis {
  equipment_id: string;
  relevance_score: number;
  reasoning: string;
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
      location: item.location?.address || '',
      price: item.price_per_day,
      rating: item.rating
    }));

    // Comprehensive location detection
    const locationTerms = [
      // Hawaii
      'hawaii', 'hawaiian', 'maui', 'oahu', 'big island', 'kauai', 'molokai', 'lanai', 'honolulu', 'waikiki', 'north shore', 'hilo', 'kona',
      // California
      'california', 'ca', 'los angeles', 'la', 'san francisco', 'sf', 'san diego', 'orange county', 'oc', 'malibu', 'huntington beach', 
      'santa monica', 'venice', 'manhattan beach', 'hermosa beach', 'redondo beach', 'santa barbara', 'carmel', 'monterey', 'big sur', 
      'santa cruz', 'half moon bay', 'pacifica', 'berkeley', 'oakland', 'san jose', 'sacramento', 'fresno',
      // Lake Tahoe
      'lake tahoe', 'tahoe', 'south lake tahoe', 'north lake tahoe', 'truckee', 'heavenly', 'northstar', 'kirkwood',
      // Oregon/Washington
      'oregon', 'portland', 'bend', 'mount hood', 'crater lake', 'washington', 'seattle', 'tacoma', 'spokane', 'mount rainier',
      // Colorado
      'colorado', 'denver', 'boulder', 'aspen', 'vail', 'telluride', 'breckenridge', 'keystone', 'copper mountain',
      // Utah
      'utah', 'salt lake city', 'park city', 'alta', 'snowbird', 'deer valley', 'sundance',
      // Other major locations
      'new york', 'ny', 'florida', 'fl', 'texas', 'tx', 'nevada', 'nv', 'arizona', 'az'
    ];

    // Enhanced surfboard term recognition
    const surfboardTerms = ['surfboard', 'shortboard', 'longboard', 'funboard', 'fish', 'gun', 'step-up', 'groveler', 'hybrid', 'performance board', 'beginner board', 'soft top', 'soft-top', 'foam board'];
    const snowboardTerms = ['snowboard', 'freestyle', 'all-mountain', 'freeride', 'splitboard', 'powder board'];
    const bikeTerms = ['mountain bike', 'mtb', 'road bike', 'gravel bike', 'fat bike', 'e-bike', 'electric bike'];

    // Detect equipment type from query
    const queryLower = query.toLowerCase();
    let equipmentTypeContext = '';
    
    if (surfboardTerms.some(term => queryLower.includes(term))) {
      equipmentTypeContext = 'EQUIPMENT TYPE: User is searching for SURFBOARDS specifically. Only return surfboard results from the surfboards category.';
    } else if (snowboardTerms.some(term => queryLower.includes(term))) {
      equipmentTypeContext = 'EQUIPMENT TYPE: User is searching for SNOWBOARDS specifically. Only return snowboard results from the snowboards category.';
    } else if (bikeTerms.some(term => queryLower.includes(term))) {
      equipmentTypeContext = 'EQUIPMENT TYPE: User is searching for BIKES specifically. Only return bike results from the mountain-bikes category.';
    }

    // Location detection and context
    const mentionedLocation = locationTerms.find(term => queryLower.includes(term));
    let locationContext = 'USER LOCATION: Not provided';
    let locationInstructions = '';

    if (queryLower.includes('near me')) {
      if (userLocation) {
        locationContext = `USER LOCATION: Exact coordinates - Latitude ${userLocation.lat}, Longitude ${userLocation.lng}`;
        locationInstructions = `
🎯 CRITICAL LOCATION FILTERING: User searched "near me" with coordinates provided. Apply STRICT 30-mile radius filtering. Equipment outside this radius should receive score 0.`;
      } else {
        locationInstructions = `
🎯 LOCATION PRIORITY: User searched "near me" but no coordinates available. This is a location-based search that cannot be fulfilled properly.`;
      }
    } else if (mentionedLocation) {
      locationContext = `USER LOCATION: "${mentionedLocation}" mentioned in search query`;
      locationInstructions = `
🎯 LOCATION FILTERING: User specified "${mentionedLocation}" location. Strongly prioritize equipment in ${mentionedLocation} area and surrounding regions. Equipment in distant states should get lower scores, but don't automatically score 0 unless clearly inappropriate (e.g., Hawaii equipment for Colorado search).`;
    } else if (userLocation) {
      locationContext = `USER LOCATION: Coordinates available - Latitude ${userLocation.lat}, Longitude ${userLocation.lng}`;
      locationInstructions = `
🎯 LOCATION AWARENESS: User location known but not specifically requested. Prioritize nearby equipment but don't exclude distant items entirely.`;
    } else {
      // Auto-fallback to location-based search for better relevance
      locationInstructions = `
🎯 LOCATION AWARENESS: No specific location mentioned. Prefer equipment from major population centers and popular recreation areas.`;
    }

    const prompt = `You are an expert outdoor gear search assistant. Analyze the following search query and equipment inventory to determine relevance scores.

SEARCH QUERY: "${query}"
${locationContext}${locationInstructions}
${equipmentTypeContext}

EQUIPMENT INVENTORY:
${JSON.stringify(equipmentSummary, null, 2)}

🎯 CRITICAL SCORING RULES (IN ORDER OF PRIORITY):

1. **LOCATION FILTERING** - Apply based on search context:
   - If user searched "near me" with coordinates: Equipment outside 30-mile radius gets score 0
   - If specific location mentioned in query: Prioritize equipment in that region, distant equipment gets lower scores (but not 0 unless clearly inappropriate)
   - If user location available but not requested: Prioritize nearby equipment (higher scores) but don't exclude distant items
   - Match location names to addresses, zip codes, and geographic regions
   - Geographic logic: surfboards near coasts, snowboards near mountains

2. **EQUIPMENT TYPE MATCHING** - Second priority:
   - If "shortboard", "longboard", "funboard" mentioned: ONLY return surfboards
   - If "snowboard" mentioned: ONLY return snowboards
   - If "mountain bike", "bike", "mtb" mentioned: ONLY return mountain-bikes
   - Wrong equipment type gets score 0

3. **SKILL LEVEL MATCHING** - Third priority:
   - "beginner" searches OR "soft top" surfboards: ONLY return beginner-suitable equipment
   - "advanced" searches: ONLY return advanced equipment  
   - Soft-top surfboards are always beginner-friendly
   - Mismatched skill level gets score 0

4. **CONTENT RELEVANCE** - Final consideration:
   - Name matching, description keywords, brand names
   - Equipment specifications and attributes

🚫 ABSOLUTE REQUIREMENTS:
- Equipment outside 30-mile radius when "near me" specified = score 0
- Wrong equipment category when specified = score 0  
- Wrong skill level when specified = score 0
- Use EXACT equipment IDs from the data, never make up IDs

RESPOND WITH VALID JSON ONLY in this exact format:
{
  "results": [
    {
      "equipment_id": "use_the_exact_id_field_from_equipment_data_NOT_the_name",
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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a search relevance expert. Always respond with valid JSON only. \
            Pay special attention to location such as proximity, regional preferences, and specific \
            location mentions. Also consider category, skill level matching, and anything related to \
            equipment attributes. For location searches, prioritize nearby equipment but use flexible matching unless "near me" is specifically requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
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
      // Handle markdown-wrapped JSON responses
      let jsonContent = aiContent.trim();
      if (jsonContent.startsWith('```json') && jsonContent.endsWith('```')) {
        // Extract JSON from markdown code blocks
        jsonContent = jsonContent.slice(7, -3).trim(); // Remove ```json and ```
      } else if (jsonContent.startsWith('```') && jsonContent.endsWith('```')) {
        // Handle generic code blocks
        jsonContent = jsonContent.slice(3, -3).trim();
      }

      const parsedResponse = JSON.parse(jsonContent);
      searchResults = parsedResponse.results || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI content:', aiContent);
      // Fallback to empty results if AI response is malformed
      searchResults = [];
    }

    // Create a map for quick lookup
    const scoreMap = new Map<string, { score: number; reasoning: string; }>();
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

    return new Response(
      JSON.stringify({
        results: filteredEquipment,
        total_analyzed: equipment.length,
        relevant_found: filteredEquipment.length
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
