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
      "category": "beginner/intermediate/advanced gear category",
      "title": "Specific gear name/model if possible",
      "description": "Detailed explanation of why this gear fits their profile",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "suitableFor": "Specific scenarios/conditions where this gear excels"
    }
  ],
  "personalizedAdvice": "Custom advice based on their profile",
  "skillDevelopment": "Tips for progressing with their current skill level",
  "locationConsiderations": "Specific advice for their riding locations"
}

Focus on practical, actionable recommendations that match their skill level, physical characteristics, and local conditions.`;

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
          category: "General Recommendation",
          title: "Personalized Gear Analysis",
          description: analysisResult,
          keyFeatures: [],
          suitableFor: `${quizData.skillLevel} ${quizData.category} enthusiast`
        }],
        personalizedAdvice: "Based on your profile, focus on gear that matches your skill level and local conditions.",
        skillDevelopment: `As a ${quizData.skillLevel} rider, continue developing your skills with appropriate gear.`,
        locationConsiderations: `Consider the specific conditions in: ${quizData.locations}`
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