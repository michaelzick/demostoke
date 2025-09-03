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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quizData: QuizData = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert outdoor gear consultant with extensive knowledge of ${quizData.category}. Analyze the user's profile and provide detailed, specific gear recommendations. Structure your response as a JSON object with the following format:

{
  "recommendations": [
    {
      "category": "${quizData.skillLevel}",
      "title": "Specific gear name/model if possible",
      "description": "Detailed explanation of why this gear fits their profile, including specific technical details and why it's perfect for their skill level and riding style",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "suitableFor": "Specific scenarios/conditions where this gear excels"
    }
  ],
  "personalizedAdvice": "Comprehensive personalized advice based on their skill level, physical characteristics, and riding style. Include specific recommendations for gear setup, maintenance, and progression tips.",
  "skillDevelopment": "Detailed skill development advice with specific techniques, drills, and progression paths for ${quizData.skillLevel} level riders in ${quizData.category}.",
  "locationConsiderations": "Specific advice for riding in ${quizData.locations}, including terrain considerations, weather factors, and gear adaptations needed for local conditions."
}

IMPORTANT: Always use "${quizData.skillLevel}" exactly as the category value. Provide detailed, specific advice that's actionable and tailored to their profile.`;

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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorData}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisResult = aiResponse.choices[0].message.content.trim();

    // Try to parse as JSON, fall back to text if needed
    let parsedResult;
    try {
      parsedResult = JSON.parse(analysisResult);
    } catch {
      // If JSON parsing fails, return as structured text
      parsedResult = {
        recommendations: [{
          category: quizData.skillLevel,
          title: "Personalized Gear Analysis",
          description: analysisResult,
          keyFeatures: [],
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