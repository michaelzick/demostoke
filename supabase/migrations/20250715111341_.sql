-- Create function to find unused downloaded images
CREATE OR REPLACE FUNCTION public.find_unused_downloaded_images()
RETURNS TABLE (
    file_path TEXT,
    downloaded_url TEXT,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        so.name as file_path,
        di.downloaded_url,
        CASE 
            WHEN di.id IS NULL THEN 'No record in downloaded_images table'
            WHEN di.source_table = 'equipment' AND NOT EXISTS (
                SELECT 1 FROM public.equipment e WHERE e.id = di.source_record_id::uuid
            ) THEN 'Source equipment record no longer exists'
            WHEN di.source_table = 'profiles' AND NOT EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = di.source_record_id::uuid
            ) THEN 'Source profile record no longer exists'
            WHEN di.source_table = 'equipment_images' AND NOT EXISTS (
                SELECT 1 FROM public.equipment_images ei WHERE ei.id = di.source_record_id::uuid
            ) THEN 'Source equipment_images record no longer exists'
            ELSE 'Other orphaned record'
        END as reason
    FROM storage.objects so
    LEFT JOIN public.downloaded_images di ON so.name = REPLACE(di.downloaded_url, 
        'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/downloaded-images/', '')
    WHERE so.bucket_id = 'downloaded-images'
    AND (
        di.id IS NULL -- No record in downloaded_images table
        OR (
            -- Check if source record still exists
            (di.source_table = 'equipment' AND NOT EXISTS (
                SELECT 1 FROM public.equipment e WHERE e.id = di.source_record_id::uuid
            ))
            OR (di.source_table = 'profiles' AND NOT EXISTS (
                SELECT 1 FROM public.profiles p WHERE p.id = di.source_record_id::uuid
            ))
            OR (di.source_table = 'equipment_images' AND NOT EXISTS (
                SELECT 1 FROM public.equipment_images ei WHERE ei.id = di.source_record_id::uuid
            ))
        )
    );
END;
$$;

-- Create function to cleanup unused downloaded images
CREATE OR REPLACE FUNCTION public.cleanup_unused_downloaded_images()
RETURNS TABLE (
    deleted_files INTEGER,
    deleted_records INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    file_count INTEGER := 0;
    record_count INTEGER := 0;
    unused_image RECORD;
BEGIN
    -- Delete storage objects and database records for unused images
    FOR unused_image IN 
        SELECT * FROM public.find_unused_downloaded_images()
    LOOP
        -- Delete from storage
        DELETE FROM storage.objects 
        WHERE bucket_id = 'downloaded-images' 
        AND name = unused_image.file_path;
        
        -- Delete from downloaded_images table if record exists
        DELETE FROM public.downloaded_images 
        WHERE downloaded_url = unused_image.downloaded_url;
        
        -- Count operations
        IF FOUND THEN
            record_count := record_count + 1;
        END IF;
        file_count := file_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT file_count, record_count;
END;
$$;

-- Also drop the image_url column from equipment table since it's no longer used
ALTER TABLE public.equipment DROP COLUMN IF EXISTS image_url;;
