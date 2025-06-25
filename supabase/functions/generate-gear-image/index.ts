
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipmentId, gearName, category, description } = await req.json();

    if (!equipmentId || !gearName || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: equipmentId, gearName, and category are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generating image for ${category}: ${gearName}`);

    // Create a detailed prompt based on the gear type and description
    let prompt = `A high-quality, professional product photo of a ${gearName}`;
    
    if (category === 'surfboards') {
      prompt += `, surfboard lying on sand or displayed against a clean background, realistic lighting, product photography style`;
    } else if (category === 'snowboards') {
      prompt += `, snowboard displayed against a clean background or snow, realistic lighting, product photography style`;
    } else if (category === 'skis') {
      prompt += `, skis displayed against a clean background or snow, realistic lighting, product photography style`;
    } else if (category === 'mountain-bikes') {
      prompt += `, mountain bike displayed against a clean background, realistic lighting, product photography style`;
    } else {
      prompt += `, outdoor gear displayed against a clean background, realistic lighting, product photography style`;
    }

    if (description) {
      prompt += `. ${description.substring(0, 200)}`;
    }

    prompt += `, clean product shot, no text overlays, professional photography`;

    console.log('Generated prompt:', prompt);

    // Call OpenAI API to generate image
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const imageData = await response.json();
    
    if (!imageData.data || !imageData.data[0]) {
      throw new Error('No image data received from OpenAI');
    }

    // Get the base64 image data (gpt-image-1 returns base64)
    const base64Image = imageData.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('Image generated successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the equipment record with the new image URL
    const { error: updateError } = await supabase
      .from('equipment')
      .update({ image_url: imageUrl })
      .eq('id', equipmentId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update equipment: ${updateError.message}`);
    }

    console.log(`Successfully updated equipment ${equipmentId} with AI-generated image`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: imageUrl,
        equipmentId: equipmentId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-gear-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
