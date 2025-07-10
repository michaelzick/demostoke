import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const MAX_WIDTH = 2000;
const WEBP_QUALITY = 85;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();
    if (!imageUrl || !sourceTable || !sourceColumn || !sourceRecordId) {
      throw new Error('Missing required fields in request body');
    }

    console.log('Starting conversion:', { imageUrl, sourceTable, sourceColumn, sourceRecordId });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Download
    const imageResponse = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageConverter/1.0)' }
    });
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
    const originalSize = imageBuffer.byteLength;

    // Step 2: Decode
    const originalImage = await Image.decode(imageBuffer);
    let width = originalImage.width;
    let height = originalImage.height;

    // Step 3: Resize if needed
    let processedImage = originalImage;
    if (width > MAX_WIDTH) {
      const aspectRatio = height / width;
      width = MAX_WIDTH;
      height = Math.round(MAX_WIDTH * aspectRatio);
      processedImage = processedImage.resize(width, height);
      console.log(`Resized to: ${width}x${height}`);
    }

    // Step 4: Encode to true WebP
    const webpBuffer = await processedImage.encodeWEBP(WEBP_QUALITY);
    const webpSize = webpBuffer.byteLength;
    console.log(`WebP size: ${webpSize} bytes (original was ${originalSize} bytes)`);

    // Step 5: Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${sourceTable}/${sourceRecordId}/${timestamp}.webp`;
    const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('webp-images')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000'
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: urlData } = supabase
      .storage
      .from('webp-images')
      .getPublicUrl(uploadData.path);

    const webpUrl = urlData.publicUrl;
    console.log(`WebP stored at: ${webpUrl}`);

    // Step 6: Log conversion in webp_images table
    const { error: logError } = await supabase.from('webp_images').insert({
      original_url: imageUrl,
      webp_url: webpUrl,
      source_table: sourceTable,
      source_column: sourceColumn,
      source_record_id: sourceRecordId,
      original_size: originalSize,
      webp_size: webpSize,
      original_width: originalImage.width,
      original_height: originalImage.height,
      webp_width: width,
      webp_height: height
    });
    if (logError) console.warn('Warning: Failed to log conversion record', logError);

    // Step 7: Update source record with new WebP URL
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: webpUrl })
      .eq('id', sourceRecordId);

    if (updateError) throw new Error(`Failed to update record: ${updateError.message}`);

    console.log('Conversion completed successfully');
    return new Response(JSON.stringify({
      success: true,
      webpUrl,
      compressionRatio: Math.round((1 - webpSize / originalSize) * 100),
      dimensions: {
        original: { width: originalImage.width, height: originalImage.height },
        webp: { width, height }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in convert-to-webp function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
