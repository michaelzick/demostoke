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

    // Step 3: Resize if necessary (maintain aspect ratio)
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

    // Step 4: Convert to WebP using PNG encoding (ImageScript doesn't support WebP directly)
    console.log('Encoding image as PNG...');
    let pngBuffer: Uint8Array;
    try {
      pngBuffer = await processedImage.encode();
    } catch (encodeError: unknown) {
      console.error('Failed to encode image:', encodeError);
      const message = encodeError instanceof Error ? encodeError.message : 'Unknown encode error';
      throw new Error(`Failed to encode image: ${message}`);
    }
    
    const pngSize = pngBuffer.byteLength;
    console.log('PNG size:', pngSize, 'bytes');
    
    // Step 5: Create PNG blob (ImageScript outputs PNG by default)
    const pngBlob = new Blob([pngBuffer as BlobPart], { type: 'image/png' });

    // Step 6: Generate file path for storage
    const timestamp = Date.now();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.png`;

    // Step 6: Upload to Supabase storage
    console.log('Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('webp-images')
      .upload(fileName, pngBlob, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Step 7: Get public URL
    const { data: urlData } = supabase.storage
      .from('webp-images')
      .getPublicUrl(uploadData.path);

    const imagePublicUrl = urlData.publicUrl;
    console.log('Image uploaded to:', imagePublicUrl);

    // Step 8: Update the original record with new URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: imagePublicUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Security audit log
    await supabase.rpc('log_security_event', {
      action_type: 'convert_image_to_webp',
      table_name: sourceTable,
      record_id: sourceRecordId,
      old_values: null,
      new_values: { [sourceColumn]: imagePublicUrl }
    });

    console.log('Conversion completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        originalUrl: imageUrl,
        newUrl: imagePublicUrl,
        originalSize: originalSize,
        newSize: pngSize,
        compressionRatio: Math.round((1 - pngSize / originalSize) * 100),
        dimensions: {
          original: { width: originalWidth, height: originalHeight },
          new: { width: newWidth, height: newHeight }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    console.error('Error in convert-image-to-webp function:', error);
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
