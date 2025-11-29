import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
}

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
    if (!data[field as keyof QuizData] || (typeof data[field as keyof QuizData] === 'string' && !data[field as keyof QuizData].trim())) {
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

    // Validate and sanitize input data
    const validation = validateQuizData(rawData);
    if (!validation.isValid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize text fields
    const quizData: QuizData = {
      category: rawData.category,
      height: rawData.height,
      weight: rawData.weight,
      age: rawData.age,
      sex: rawData.sex,
      skillLevel: rawData.skillLevel,
      locations: sanitizeText(rawData.locations),
      currentGear: sanitizeText(rawData.currentGear),
      additionalNotes: sanitizeText(rawData.additionalNotes)
    };

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert outdoor gear consultant with extensive knowledge of ${quizData.category}. Analyze the user's profile and provide detailed, specific gear recommendations.

CRITICAL: You MUST respond with a valid JSON object that exactly matches this structure. Do not include any text before or after the JSON.

IMPORTANT: Provide 2-3 different gear recommendations to give the user variety and options. Each recommendation should represent different styles, approaches, or price points within the category.

{
  "recommendations": [
    {
      "category": "${quizData.skillLevel}",
      "title": "Specific gear name/model if possible",
      "description": "Detailed explanation of why this gear fits their profile, including specific technical details and why it's perfect for their skill level and riding style",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "suitableFor": "Specific scenarios/conditions where this gear excels"
    },
    {
      "category": "${quizData.skillLevel}",
      "title": "Different gear name/model representing another style or approach",
      "description": "Detailed explanation of why this alternative gear fits their profile, with different characteristics or use cases",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "suitableFor": "Different scenarios/conditions where this gear excels"
    },
    {
      "category": "${quizData.skillLevel}",
      "title": "Third gear option providing additional variety",
      "description": "Detailed explanation of this third option, offering another perspective or specialty focus",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "suitableFor": "Unique scenarios/conditions where this gear excels"
    }
  ],
  "personalizedAdvice": "Comprehensive personalized advice based on their skill level, physical characteristics, and riding style. Include specific recommendations for gear setup, maintenance, and progression tips.",
  "skillDevelopment": "Detailed skill development advice with specific techniques, drills, and progression paths for ${quizData.skillLevel} level riders in ${quizData.category}.",
  "locationConsiderations": "Specific advice for riding in ${quizData.locations}, including terrain considerations, weather factors, and gear adaptations needed for local conditions."
}

FORMATTING RULES:
- Start immediately with opening brace {
- End with closing brace }
- Use proper JSON syntax with double quotes
- Escape any quotes within strings using \"
- Do not truncate the response mid-sentence
- Ensure all JSON objects and arrays are properly closed
- Always use "${quizData.skillLevel}" exactly as the category value`;

    const userPrompt = `Please analyze this user profile and provide gear recommendations:

Category: ${quizData.category}
Physical Stats: ${quizData.height} tall, ${quizData.weight} lbs, ${quizData.age} years old, ${quizData.sex}
Skill Level: ${quizData.skillLevel}
Riding Locations: ${quizData.locations}
Current Gear Preferences: ${quizData.currentGear}
Additional Notes: ${quizData.additionalNotes}

Provide specific gear recommendations with explanations tailored to their profile.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000,
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

    // Enhanced JSON parsing with better error handling
    let parsedResult;
    try {
      // Clean up potential JSON formatting issues
      let cleanedResult = analysisResult;

      // Remove any text before the first {
      const firstBrace = cleanedResult.indexOf('{');
      if (firstBrace > 0) {
        cleanedResult = cleanedResult.substring(firstBrace);
      }

      // Remove any text after the last }
      const lastBrace = cleanedResult.lastIndexOf('}');
      if (lastBrace < cleanedResult.length - 1) {
        cleanedResult = cleanedResult.substring(0, lastBrace + 1);
      }

      parsedResult = JSON.parse(cleanedResult);

      // Validate the structure
      if (!parsedResult.recommendations || !Array.isArray(parsedResult.recommendations)) {
        throw new Error('Invalid response structure');
      }

      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Attempting to extract useful content from raw response');

      // Enhanced fallback with better content extraction
      let fallbackDescription = analysisResult;

      // Try to extract meaningful content from malformed JSON
      const descriptionMatch = analysisResult.match(/"description":\s*"([^"]+)"/);
      if (descriptionMatch) {
        fallbackDescription = descriptionMatch[1];
      }

      parsedResult = {
        recommendations: [{
          category: quizData.skillLevel,
          title: `${quizData.skillLevel} ${quizData.category} Recommendations`,
          description: fallbackDescription.length > 100 ? fallbackDescription : `Based on your profile as a ${quizData.skillLevel} ${quizData.category} enthusiast, here are personalized recommendations tailored to your experience level and riding locations in ${quizData.locations}.`,
          keyFeatures: ["Appropriate for your skill level", "Suited to your riding locations", "Matches your physical profile"],
          suitableFor: `Perfect for ${quizData.skillLevel} level ${quizData.category} enthusiasts`
        }],
        personalizedAdvice: `Based on your profile as a ${quizData.skillLevel} ${quizData.category} rider, focus on gear that matches your skill level and local riding conditions. Consider equipment that will help you progress while remaining comfortable with your current abilities.`,
        skillDevelopment: `As a ${quizData.skillLevel} rider, focus on developing core techniques and building confidence. Consider taking lessons or riding with more experienced friends to accelerate your progression in ${quizData.category}.`,
        locationConsiderations: `For riding in ${quizData.locations}, research local conditions, weather patterns, and terrain types. Connect with local riding communities and consider gear specific to your region's unique challenges.`
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
