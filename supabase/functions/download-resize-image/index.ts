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
const BUCKET = "processed-images";

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
      equipment: ['image_url'],
      equipment_images: ['image_url'],
      profiles: ['avatar_url', 'hero_image_url']
    };
    if (!ALLOWED[sourceTable] || !ALLOWED[sourceTable].includes(sourceColumn)) {
      return new Response(JSON.stringify({ error: 'Invalid target' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Processing image:', { imageUrl, sourceTable, sourceColumn, sourceRecordId });

    // Step 1: Download the image
    console.log('Downloading image from:', imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProcessor/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log('Downloaded image size:', originalSize, 'bytes');

    // Step 2: Detect original format
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const originalFormat = contentType.split('/')[1].toUpperCase();
    console.log('Original format:', originalFormat);

    // Step 3: Process the image with ImageScript
    console.log('Processing image...');
    
    let originalImage;
    let wasResized = false;
    let processedBuffer = new Uint8Array(imageBuffer);
    let newWidth = 0;
    let newHeight = 0;
    
    try {
      originalImage = await Image.decode(new Uint8Array(imageBuffer));
      const originalWidth = originalImage.width;
      const originalHeight = originalImage.height;
      
      console.log('Original dimensions:', originalWidth, 'x', originalHeight);
      
      // Step 4: Resize if necessary (maintain aspect ratio and format)
      if (originalWidth > MAX_WIDTH) {
        const aspectRatio = originalHeight / originalWidth;
        newWidth = MAX_WIDTH;
        newHeight = Math.round(MAX_WIDTH * aspectRatio);
        
        console.log('Resizing to:', newWidth, 'x', newHeight);
        
        try {
          const resizedImage = originalImage.resize(newWidth, newHeight);
          
          // Encode in original format
          let encodedBuffer;
          if (originalFormat === 'PNG') {
            encodedBuffer = await resizedImage.encode(1); // PNG format
          } else if (originalFormat === 'WEBP') {
            encodedBuffer = await resizedImage.encode(3); // WebP format  
          } else if (originalFormat === 'GIF') {
            encodedBuffer = await resizedImage.encode(4); // GIF format
          } else {
            // Default to JPEG for other formats
            encodedBuffer = await resizedImage.encode(2, 85); // JPEG format with quality 85
          }
          
          processedBuffer = encodedBuffer;
          wasResized = true;
          
        } catch (resizeError) {
          console.error('Failed to resize image, using original:', resizeError);
          // Continue with original image
          newWidth = originalWidth;
          newHeight = originalHeight;
        }
      } else {
        newWidth = originalImage.width;
        newHeight = originalImage.height;
      }
      
    } catch (decodeError) {
      console.error('Failed to decode image, using original:', decodeError);
      // Use original buffer and try to extract basic info
      newWidth = 0;
      newHeight = 0;
    }
    
    const processedSize = processedBuffer.byteLength;
    console.log('Processed size:', processedSize, 'bytes', wasResized ? '(Resized)' : '(Original)');
    
    // Step 5: Create blob with appropriate content type
    const blob = new Blob([processedBuffer], { type: contentType });

    // Step 6: Generate file path for storage
    const timestamp = Date.now();
    const fileExtension = originalFormat.toLowerCase() === 'jpeg' ? 'jpg' : originalFormat.toLowerCase();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.${fileExtension}`;

    // Step 7: Upload to Supabase storage
    console.log('Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        contentType: contentType,
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      throw new Error(`Failed to upload processed image: ${uploadError.message}`);
    }

    // Step 8: Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    const processedUrl = urlData.publicUrl;
    console.log('Image uploaded to:', processedUrl);

    // Step 9: Save processing record to database
    const { error: dbError } = await supabase
      .from('processed_images')
      .insert({
        original_url: imageUrl,
        processed_url: processedUrl,
        source_table: sourceTable,
        source_column: sourceColumn,
        source_record_id: sourceRecordId,
        original_size: originalSize,
        processed_size: processedSize,
        original_width: originalImage?.width || 0,
        original_height: originalImage?.height || 0,
        processed_width: newWidth,
        processed_height: newHeight,
        original_format: originalFormat,
        processed_format: originalFormat,
        was_resized: wasResized,
      });

    if (dbError) {
      console.error('Failed to save processing record:', dbError);
      // Continue even if logging fails
    }

    // Step 10: Update the original record with new URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: processedUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Security audit log
    await supabase.rpc('log_security_event', {
      action_type: 'download_resize_image',
      table_name: sourceTable,
      record_id: sourceRecordId,
      old_values: null,
      new_values: { [sourceColumn]: processedUrl }
    });

    // Step 11: Clean up any temp records
    await supabase
      .from('temp_images')
      .delete()
      .eq('original_url', imageUrl);

    console.log('Image processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        processedUrl: processedUrl,
        originalSize: originalSize,
        processedSize: processedSize,
        wasResized: wasResized,
        compressionRatio: originalSize > 0 ? Math.round((1 - processedSize / originalSize) * 100) : 0,
        dimensions: {
          original: { width: originalImage?.width || 0, height: originalImage?.height || 0 },
          processed: { width: newWidth, height: newHeight }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in download-resize-image function:', error);
    
    // Log the error to database if possible
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();
      
      await supabase
        .from('processed_images')
        .insert({
          original_url: imageUrl,
          processed_url: imageUrl, // Keep original URL
          source_table: sourceTable,
          source_column: sourceColumn,
          source_record_id: sourceRecordId,
          original_format: 'UNKNOWN',
          processed_format: 'UNKNOWN',
          was_resized: false,
          error_message: error.message,
        });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
    
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