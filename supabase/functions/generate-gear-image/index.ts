
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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

    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!huggingFaceToken) {
      return new Response(
        JSON.stringify({ error: 'Hugging Face access token not configured' }),
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
      prompt += `, surfboard lying on sand or displayed against a clean white background, realistic lighting, product photography style`;
    } else if (category === 'snowboards') {
      prompt += `, snowboard displayed against a clean white background or snow, realistic lighting, product photography style`;
    } else if (category === 'skis') {
      prompt += `, skis displayed against a clean white background or snow, realistic lighting, product photography style`;
    } else if (category === 'mountain-bikes') {
      prompt += `, mountain bike displayed against a clean white background, realistic lighting, product photography style`;
    } else {
      prompt += `, outdoor gear displayed against a clean white background, realistic lighting, product photography style`;
    }

    if (description) {
      prompt += `. ${description.substring(0, 150)}`;
    }

    prompt += `, clean product shot, no text overlays, professional photography, 4k quality`;

    console.log('Generated prompt:', prompt);

    // Initialize Hugging Face inference
    const hf = new HfInference(huggingFaceToken);

    // Generate image using FLUX model
    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;

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
