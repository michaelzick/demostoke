import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GenerateRequest {
  gearName: string;
  gearType?: string;
  existingText?: string;
  mode?: 'generate' | 'rewrite';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gearName, gearType, existingText, mode = 'generate' }: GenerateRequest = await req.json();

    if (mode === 'rewrite' && !existingText) {
      return new Response(
        JSON.stringify({ error: 'existingText is required for rewrite mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'generate' && !gearName) {
      return new Response(
        JSON.stringify({ error: 'gearName is required for generate mode' }),
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

    let prompt: string;
    if (mode === 'rewrite') {
      prompt = `Rewrite the following product description to make it more compelling and professional while maintaining accuracy. Keep the same length or shorter. Original text: "${existingText}"${gearName ? ` (This is for gear named "${gearName}")` : ''}${gearType ? ` (This is a ${gearType})` : ''}`;
    } else {
      prompt = `Write a short, compelling product description for ${gearType ? `a ${gearType}` : 'this gear'} named "${gearName}". Keep it concise, highlighting key features and benefits that would appeal to outdoor enthusiasts. Focus on practical aspects and what makes this gear special.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: mode === 'rewrite' 
              ? 'You are an expert copywriter who rewrites product descriptions to make them more compelling while maintaining accuracy and keeping similar length.'
              : 'You generate concise marketing copy.'
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorData}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const description = aiResponse.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ description }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate description' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
