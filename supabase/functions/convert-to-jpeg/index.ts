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
const JPEG_QUALITY = 70;
const BUCKET = "jpeg-images";


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();

    // Auth: require admin
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: isAdmin, error: adminError } = await authClient.rpc('is_admin');
    if (adminError || isAdmin !== true) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Whitelist allowed targets
    const ALLOWED: Record<string, string[]> = {
      equipment_images: ['image_url'],
      profiles: ['avatar_url', 'hero_image_url']
    };
    if (!ALLOWED[sourceTable] || !ALLOWED[sourceTable].includes(sourceColumn)) {
      return new Response(JSON.stringify({ error: 'Invalid target' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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

    // Step 3: Process the image with ImageScript
    console.log('Processing image...');
    
    let originalImage;
    try {
      originalImage = await Image.decode(new Uint8Array(imageBuffer));
    } catch (decodeError: unknown) {
      console.error('Failed to decode image:', decodeError);
      const message = decodeError instanceof Error ? decodeError.message : 'Unknown decode error';
      throw new Error(`Failed to decode image: ${message}`);
    }
    
    const originalWidth = originalImage.width;
    const originalHeight = originalImage.height;
    
    console.log('Original dimensions:', originalWidth, 'x', originalHeight);

    // Step 4: Resize if necessary (maintain aspect ratio)
    let processedImage = originalImage;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > MAX_WIDTH) {
      const aspectRatio = originalHeight / originalWidth;
      newWidth = MAX_WIDTH;
      newHeight = Math.round(MAX_WIDTH * aspectRatio);
      
      console.log('Resizing to:', newWidth, 'x', newHeight);
      try {
        processedImage = originalImage.resize(newWidth, newHeight);
      } catch (resizeError: unknown) {
        console.error('Failed to resize image:', resizeError);
        const message = resizeError instanceof Error ? resizeError.message : 'Unknown resize error';
        throw new Error(`Failed to resize image: ${message}`);
      }
    }

    // Step 5: Encode as JPEG using encodeJPEG method
    console.log('Converting to JPEG...');
    let jpegBuffer: Uint8Array;
    try {
      jpegBuffer = await processedImage.encodeJPEG(JPEG_QUALITY);
    } catch (encodeError: unknown) {
      console.error('Failed to encode JPEG:', encodeError);
      const message = encodeError instanceof Error ? encodeError.message : 'Unknown encode error';
      throw new Error(`Failed to encode JPEG: ${message}`);
    }
    
    const jpegSize = jpegBuffer.byteLength;
    console.log('JPEG size:', jpegSize, 'bytes', 'Compression ratio:', Math.round((1 - jpegSize / originalSize) * 100) + '%');
    
    // Step 6: Create JPEG blob
    const jpegBlob = new Blob([jpegBuffer], { type: 'image/jpeg' });

    // Step 7: Generate file path for storage
    const timestamp = Date.now();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.jpg`;

    // Step 8: Upload to Supabase storage
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

    // Step 9: Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    const jpegUrl = urlData.publicUrl;
    console.log('JPEG uploaded to:', jpegUrl);

    // Step 8: Update the original record with new JPEG URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: jpegUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Security audit log
    await supabase.rpc('log_security_event', {
      action_type: 'convert_to_jpeg',
      table_name: sourceTable,
      record_id: sourceRecordId,
      old_values: null,
      new_values: { [sourceColumn]: jpegUrl }
    });

    console.log('JPEG conversion completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        jpegUrl: jpegUrl,
        originalSize: originalSize,
        jpegSize: jpegSize,
        compressionRatio: Math.round((1 - jpegSize / originalSize) * 100),
        dimensions: {
          original: { width: originalWidth, height: originalHeight },
          jpeg: { width: newWidth, height: newHeight }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    console.error('Error in convert-to-jpeg function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: message 
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
