import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Inlined from src/types/quiz.ts — cannot import from src/ in Deno edge functions
interface GearCandidate {
  id: string;
  name: string;
  description: string | null;
  suitable_skill_level: string | null;
  price_per_day: number;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
}

interface QuizData {
  category: string;
  height: string;
  weight: string;
  age: string;
  sex: string;
  skillLevel: string;
  locations: string;
  currentGear: string;
  additionalNotes: string;
  availableGear?: GearCandidate[];
}

// Filter raw AI-returned IDs to only those present in the provided set
export const filterMatchedIds = (rawIds: string[], validIds: Set<string>): string[] => {
  return rawIds.filter(id => validIds.has(id));
};

// Input validation and sanitization
const FIELD_LIMITS = {
  locations: 500,
  currentGear: 1000,
  additionalNotes: 1000,
  weight: { min: 50, max: 400 },
  age: { min: 5, max: 100 }
};

const sanitizeText = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;', '>': '&gt;', '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .trim();
};

const validateQuizData = (data: QuizData): { isValid: boolean; error?: string } => {
  const requiredFields = ['category', 'height', 'weight', 'age', 'sex', 'skillLevel', 'locations', 'currentGear'];

  for (const field of requiredFields) {
    const value = data[field as keyof QuizData];
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { isValid: false, error: `${field} is required` };
    }
  }

  const weight = parseInt(data.weight, 10);
  if (isNaN(weight) || weight < FIELD_LIMITS.weight.min || weight > FIELD_LIMITS.weight.max) {
    return { isValid: false, error: `Weight must be between ${FIELD_LIMITS.weight.min} and ${FIELD_LIMITS.weight.max}` };
  }

  const age = parseInt(data.age, 10);
  if (isNaN(age) || age < FIELD_LIMITS.age.min || age > FIELD_LIMITS.age.max) {
    return { isValid: false, error: `Age must be between ${FIELD_LIMITS.age.min} and ${FIELD_LIMITS.age.max}` };
  }

  if (data.locations.length > FIELD_LIMITS.locations) {
    return { isValid: false, error: `Locations must be ${FIELD_LIMITS.locations} characters or less` };
  }

  if (data.currentGear.length > FIELD_LIMITS.currentGear) {
    return { isValid: false, error: `Current gear must be ${FIELD_LIMITS.currentGear} characters or less` };
  }

  if (data.additionalNotes && data.additionalNotes.length > FIELD_LIMITS.additionalNotes) {
    return { isValid: false, error: `Additional notes must be ${FIELD_LIMITS.additionalNotes} characters or less` };
  }

  return { isValid: true };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    console.log('Received quiz data:', rawData);

    const validation = validateQuizData(rawData);
    if (!validation.isValid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData: QuizData = {
      category: rawData.category,
      height: rawData.height,
      weight: rawData.weight,
      age: rawData.age,
      sex: rawData.sex,
      skillLevel: rawData.skillLevel,
      locations: sanitizeText(rawData.locations),
      currentGear: sanitizeText(rawData.currentGear),
      additionalNotes: sanitizeText(rawData.additionalNotes),
      availableGear: Array.isArray(rawData.availableGear) ? rawData.availableGear : undefined,
    };

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasAvailableGear = quizData.availableGear && quizData.availableGear.length > 0;
    let systemPrompt: string;

    if (hasAvailableGear) {
      const gearList = quizData.availableGear!
        .map((g, i) => {
          const raw = g.description ?? '';
          const desc = raw.length > 200 ? raw.substring(0, 200) + '...' : raw;
          return `${i + 1}. ID: ${g.id} | Name: ${g.name} | Skill Level: ${g.suitable_skill_level ?? 'any'} | Price/day: ${g.price_per_day} | Description: ${desc}`;
        })
        .join('\n');

      systemPrompt = [
        `You are an expert outdoor gear consultant with extensive knowledge of ${quizData.category}.`,
        `Analyze the user's profile and select the best matching gear from the provided inventory list.`,
        ``,
        `CRITICAL: Respond with a valid JSON object only. No text before or after the JSON.`,
        ``,
        `AVAILABLE GEAR INVENTORY (select from these only):`,
        gearList,
        ``,
        `Select items that best match the user's profile. Return their IDs in "matchedIds".`,
        `You may select 0 to all items — only include genuinely good fits.`,
        `Also provide 2-3 generic recommendations, personalized advice, skill development tips, and location considerations.`,
        ``,
        `{`,
        `  "matchedIds": ["id-from-list", "another-id-from-list"],`,
        `  "recommendations": [`,
        `    {`,
        `      "category": "${quizData.skillLevel}",`,
        `      "title": "Specific gear name/model",`,
        `      "description": "Why this gear fits their profile",`,
        `      "keyFeatures": ["feature1", "feature2", "feature3"],`,
        `      "suitableFor": "Scenarios where this gear excels"`,
        `    }`,
        `  ],`,
        `  "personalizedAdvice": "Personalized advice based on their profile.",`,
        `  "skillDevelopment": "Skill development tips for ${quizData.skillLevel} level riders.",`,
        `  "locationConsiderations": "Advice for riding in ${quizData.locations}."`,
        `}`,
        ``,
        `RULES: matchedIds must only contain IDs from the inventory above. Use "${quizData.skillLevel}" as the category value.`,
      ].join('\n');
    } else {
      systemPrompt = [
        `You are an expert outdoor gear consultant with extensive knowledge of ${quizData.category}.`,
        `Analyze the user's profile and provide 2-3 detailed gear recommendations.`,
        ``,
        `CRITICAL: Respond with a valid JSON object only. No text before or after the JSON.`,
        ``,
        `{`,
        `  "matchedIds": [],`,
        `  "recommendations": [`,
        `    {`,
        `      "category": "${quizData.skillLevel}",`,
        `      "title": "Specific gear name/model",`,
        `      "description": "Why this gear fits their profile",`,
        `      "keyFeatures": ["feature1", "feature2", "feature3"],`,
        `      "suitableFor": "Scenarios where this gear excels"`,
        `    }`,
        `  ],`,
        `  "personalizedAdvice": "Personalized advice based on their profile.",`,
        `  "skillDevelopment": "Skill development tips for ${quizData.skillLevel} level riders.",`,
        `  "locationConsiderations": "Advice for riding in ${quizData.locations}."`,
        `}`,
        ``,
        `Use "${quizData.skillLevel}" as the category value for all recommendations.`,
      ].join('\n');
    }

    const userPrompt = [
      `Please analyze this user profile and provide gear recommendations:`,
      ``,
      `Category: ${quizData.category}`,
      `Physical Stats: ${quizData.height} tall, ${quizData.weight} lbs, ${quizData.age} years old, ${quizData.sex}`,
      `Skill Level: ${quizData.skillLevel}`,
      `Riding Locations: ${quizData.locations}`,
      `Current Gear Preferences: ${quizData.currentGear}`,
      `Additional Notes: ${quizData.additionalNotes}`,
    ].join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 5000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorData}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisResult = aiResponse.choices[0].message.content.trim();
    console.log('Raw AI response:', analysisResult);

    let parsedResult;
    try {
      let cleanedResult = analysisResult;
      const firstBrace = cleanedResult.indexOf('{');
      if (firstBrace > 0) cleanedResult = cleanedResult.substring(firstBrace);
      const lastBrace = cleanedResult.lastIndexOf('}');
      if (lastBrace < cleanedResult.length - 1) cleanedResult = cleanedResult.substring(0, lastBrace + 1);

      parsedResult = JSON.parse(cleanedResult);

      if (!parsedResult.recommendations || !Array.isArray(parsedResult.recommendations)) {
        throw new Error('Invalid response structure');
      }

      const validIds = new Set((quizData.availableGear ?? []).map((g: GearCandidate) => g.id));
      parsedResult.matchedIds = filterMatchedIds(
        Array.isArray(parsedResult.matchedIds) ? parsedResult.matchedIds : [],
        validIds
      );

      console.log('Successfully parsed JSON response, matchedIds:', parsedResult.matchedIds);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);

      let fallbackDescription = analysisResult;
      const descriptionMatch = analysisResult.match(/"description":\s*"([^"]+)"/);
      if (descriptionMatch) fallbackDescription = descriptionMatch[1];

      parsedResult = {
        matchedIds: [],
        recommendations: [{
          category: quizData.skillLevel,
          title: `${quizData.skillLevel} ${quizData.category} Recommendations`,
          description: fallbackDescription.length > 100
            ? fallbackDescription
            : `Based on your profile as a ${quizData.skillLevel} ${quizData.category} enthusiast, here are personalized recommendations tailored to your experience level and riding locations in ${quizData.locations}.`,
          keyFeatures: ["Appropriate for your skill level", "Suited to your riding locations", "Matches your physical profile"],
          suitableFor: `Perfect for ${quizData.skillLevel} level ${quizData.category} enthusiasts`
        }],
        personalizedAdvice: `As a ${quizData.skillLevel} ${quizData.category} rider, focus on gear that matches your skill level and local conditions.`,
        skillDevelopment: `Focus on developing core techniques and building confidence as a ${quizData.skillLevel} rider.`,
        locationConsiderations: `For riding in ${quizData.locations}, research local conditions and connect with local riding communities.`
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing quiz:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze quiz results' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
