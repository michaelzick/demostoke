import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BUCKET = "downloaded-images";

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

    console.log('Downloading image:', { imageUrl, sourceTable, sourceColumn, sourceRecordId });

    // Step 1: Download the image
    console.log('Downloading image from:', imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageDownloader/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const originalSize = imageBuffer.byteLength;
    console.log('Downloaded image size:', originalSize, 'bytes');

    // Step 2: Detect file type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const fileType = contentType.split('/')[1].toUpperCase();
    console.log('File type:', fileType);

    // Step 3: Create blob with original content type
    const blob = new Blob([imageBuffer], { type: contentType });

    // Step 4: Generate file path for storage
    const timestamp = Date.now();
    const fileExtension = fileType.toLowerCase() === 'jpeg' ? 'jpg' : fileType.toLowerCase();
    const fileName = `${sourceTable}/${sourceRecordId || 'unknown'}/${timestamp}.${fileExtension}`;

    // Step 5: Upload to Supabase storage
    console.log('Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        contentType: contentType,
        cacheControl: '31536000', // 1 year
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Step 6: Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    const downloadedUrl = urlData.publicUrl;
    console.log('Image uploaded to:', downloadedUrl);

    // Step 7: Save download record to database
    const { error: dbError } = await supabase
      .from('downloaded_images')
      .insert({
        original_url: imageUrl,
        downloaded_url: downloadedUrl,
        source_table: sourceTable,
        source_column: sourceColumn,
        source_record_id: sourceRecordId,
        original_size: originalSize,
        downloaded_size: originalSize, // Same size since no processing
        file_type: fileType,
      });

    if (dbError) {
      console.error('Failed to save download record:', dbError);
      // Continue even if logging fails
    }

    // Step 8: Update the original record with new URL
    console.log('Updating original record...');
    const { error: updateError } = await supabase
      .from(sourceTable)
      .update({ [sourceColumn]: downloadedUrl })
      .eq('id', sourceRecordId);

    if (updateError) {
      throw new Error(`Failed to update original record: ${updateError.message}`);
    }

    // Security audit log
    await supabase.rpc('log_security_event', {
      action_type: 'download_store_image',
      table_name: sourceTable,
      record_id: sourceRecordId,
      old_values: null,
      new_values: { [sourceColumn]: downloadedUrl }
    });

    console.log('Image download completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        downloadedUrl: downloadedUrl,
        originalSize: originalSize,
        downloadedSize: originalSize,
        fileType: fileType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in download-store-image function:', error);
    
    // Log the error to database if possible
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { imageUrl, sourceTable, sourceColumn, sourceRecordId } = await req.json();
      
      await supabase
        .from('downloaded_images')
        .insert({
          original_url: imageUrl,
          downloaded_url: imageUrl, // Keep original URL
          source_table: sourceTable,
          source_column: sourceColumn,
          source_record_id: sourceRecordId,
          file_type: 'UNKNOWN',
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