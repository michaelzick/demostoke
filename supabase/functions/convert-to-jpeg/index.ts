import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { ImageMagick, initialize, MagickFormat } from "https://deno.land/x/imagemagick@0.0.26/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MAX_WIDTH = 2000;
const JPEG_QUALITY = 70;
const BUCKET = "jpeg-images";

// Initialize ImageMagick WASM
await initialize();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();

    console.log('Converting image to JPEG:', { imageUrl, sourceTable, sourceColumn, sourceRecordId });

    // Step 1: Download the image
    console.log('Downloading image from:', imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JPEGConverter/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log('Downloaded image size:', originalSize, 'bytes');

    // Step 2: Check if image is already JPEG
    const contentType = imageResponse.headers.get('content-type');
    if (contentType && (contentType.includes('image/jpeg') || contentType.includes('image/jpg'))) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Image is already in JPEG format' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 3: Process the image with ImageMagick
    console.log('Processing image with ImageMagick...');
    
    let jpegBuffer: Uint8Array;
    let originalWidth: number;
    let originalHeight: number;
    let newWidth: number;
    let newHeight: number;

    try {
      ImageMagick.read(new Uint8Array(imageBuffer), (img) => {
        originalWidth = img.width;
        originalHeight = img.height;
        
        console.log('Original dimensions:', originalWidth, 'x', originalHeight);

        // Calculate new dimensions if resizing is needed
        newWidth = originalWidth;
        newHeight = originalHeight;

        if (originalWidth > MAX_WIDTH) {
          const aspectRatio = originalHeight / originalWidth;
          newWidth = MAX_WIDTH;
          newHeight = Math.round(MAX_WIDTH * aspectRatio);
          
          console.log('Resizing to:', newWidth, 'x', newHeight);
          img.resize(newWidth, newHeight);
        }

        // Strip all metadata
        img.strip();
        
        // Set JPEG quality
        img.quality = JPEG_QUALITY;
        
        // Set progressive encoding (interlace Plane)
        img.interlace = 'Plane' as any;
        
        // Convert to JPEG
        jpegBuffer = img.write(MagickFormat.Jpeg);
      });
    } catch (processError) {
      console.error('Failed to process image:', processError);
      throw new Error(`Failed to process image: ${processError.message}`);
    }
    
    const jpegSize = jpegBuffer.byteLength;
    console.log('JPEG size:', jpegSize, 'bytes', 'Compression ratio:', Math.round((1 - jpegSize / originalSize) * 100) + '%');
    
    // Step 4: Create JPEG blob
    const jpegBlob = new Blob([jpegBuffer], { type: 'image/jpeg' });

    // Step 5: Generate file path for storage
    const timestamp = Date.now();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.jpg`;

    // Step 6: Upload to Supabase storage
    console.log('Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, jpegBlob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      throw new Error(`Failed to upload JPEG image: ${uploadError.message}`);
    }

    // Step 7: Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    const jpegUrl = urlData.publicUrl;
    console.log('JPEG uploaded to:', jpegUrl);

    // Step 8: Save conversion record to database
    const { error: dbError } = await supabase
      .from('jpeg_images')
      .insert({
        original_url: imageUrl,
        jpeg_url: jpegUrl,
        source_table: sourceTable,
        source_column: sourceColumn,
        source_record_id: sourceRecordId,
        original_size: originalSize,
        jpeg_size: jpegSize,
        original_width: originalWidth!,
        original_height: originalHeight!,
        jpeg_width: newWidth!,
        jpeg_height: newHeight!,
      });

    if (dbError) {
      console.error('Failed to save conversion record:', dbError);
      // Continue even if logging fails
    }

    // Step 9: Update the original record with new JPEG URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: jpegUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Step 10: Clean up any temp records
    await supabase
      .from('temp_images')
      .delete()
      .eq('original_url', imageUrl);

    console.log('JPEG conversion completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        jpegUrl: jpegUrl,
        originalSize: originalSize,
        jpegSize: jpegSize,
        compressionRatio: Math.round((1 - jpegSize / originalSize) * 100),
        dimensions: {
          original: { width: originalWidth!, height: originalHeight! },
          jpeg: { width: newWidth!, height: newHeight! }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in convert-to-jpeg function:', error);
    
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

/*
Example curl command for local testing:

curl -X POST 'http://localhost:54321/functions/v1/convert-to-jpeg' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "imageUrl": "https://example.com/image.png",
    "sourceTable": "equipment",
    "sourceColumn": "image_url", 
    "sourceRecordId": "123e4567-e89b-12d3-a456-426614174000"
  }'
*/