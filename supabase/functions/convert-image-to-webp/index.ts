import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MAX_WIDTH = 2000;
const WEBP_QUALITY = 85;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();

    console.log('Converting image:', { imageUrl, sourceTable, sourceColumn, sourceRecordId });

    // Step 1: Download the image
    console.log('Downloading image from:', imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageConverter/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log('Downloaded image size:', originalSize, 'bytes');

    // Step 2: Process the image with ImageScript
    console.log('Processing image...');
    const originalImage = await Image.decode(new Uint8Array(imageBuffer));
    const originalWidth = originalImage.width;
    const originalHeight = originalImage.height;
    
    console.log('Original dimensions:', originalWidth, 'x', originalHeight);

    // Step 3: Resize if necessary (maintain aspect ratio)
    let processedImage = originalImage;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > MAX_WIDTH) {
      const aspectRatio = originalHeight / originalWidth;
      newWidth = MAX_WIDTH;
      newHeight = Math.round(MAX_WIDTH * aspectRatio);
      
      console.log('Resizing to:', newWidth, 'x', newHeight);
      processedImage = originalImage.resize(newWidth, newHeight);
    }

    // Step 4: Convert to WebP
    console.log('Converting to WebP...');
    const webpBuffer = await processedImage.encodeWebP(WEBP_QUALITY);
    const webpSize = webpBuffer.byteLength;
    
    console.log('WebP size:', webpSize, 'bytes', 'Compression ratio:', Math.round((1 - webpSize / originalSize) * 100) + '%');

    // Step 5: Generate file path for storage
    const timestamp = Date.now();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.webp`;

    // Step 5: Create WebP blob
    const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });

    // Step 6: Upload to Supabase storage
    console.log('Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('webp-images')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      throw new Error(`Failed to upload WebP image: ${uploadError.message}`);
    }

    // Step 7: Get public URL
    const { data: urlData } = supabase.storage
      .from('webp-images')
      .getPublicUrl(uploadData.path);

    const webpUrl = urlData.publicUrl;
    console.log('WebP uploaded to:', webpUrl);

    // Step 8: Save conversion record to database
    const { error: dbError } = await supabase
      .from('webp_images')
      .insert({
        original_url: imageUrl,
        webp_url: webpUrl,
        source_table: sourceTable,
        source_column: sourceColumn,
        source_record_id: sourceRecordId,
        original_size: originalSize,
        webp_size: webpSize,
        original_width: originalWidth,
        original_height: originalHeight,
        webp_width: newWidth,
        webp_height: newHeight,
      });

    if (dbError) {
      console.error('Failed to save conversion record:', dbError);
      // Continue even if logging fails
    }

    // Step 9: Update the original record with new WebP URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: webpUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Step 10: Clean up any temp records
    await supabase
      .from('temp_images')
      .delete()
      .eq('original_url', imageUrl);

    console.log('Conversion completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        originalUrl: imageUrl,
        webpUrl: webpUrl,
        originalSize: originalSize,
        webpSize: webpSize,
        compressionRatio: Math.round((1 - webpSize / originalSize) * 100),
        dimensions: {
          original: { width: originalWidth, height: originalHeight },
          webp: { width: newWidth, height: newHeight }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in convert-image-to-webp function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});