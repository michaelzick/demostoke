-- Fix Function Search Path Mutable warnings by updating functions that don't have search_path set

-- Fix function: find_unused_downloaded_images
CREATE OR REPLACE FUNCTION public.find_unused_downloaded_images()
 RETURNS TABLE(file_path text, downloaded_url text, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Fix function: cleanup_unused_downloaded_images
CREATE OR REPLACE FUNCTION public.cleanup_unused_downloaded_images()
 RETURNS TABLE(deleted_files integer, deleted_records integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Fix function: log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(action_type text, table_name text DEFAULT NULL::text, record_id uuid DEFAULT NULL::uuid, old_values jsonb DEFAULT NULL::jsonb, new_values jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.security_audit_log 
  (user_id, action, table_name, record_id, old_values, new_values)
  VALUES 
  (auth.uid(), action_type, table_name, record_id, old_values, new_values);
END;
$function$;

-- Fix function: geocode_profile_address
CREATE OR REPLACE FUNCTION public.geocode_profile_address()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Only clear coordinates if address is being cleared/nullified
  -- Don't interfere if the app is trying to set both address and coordinates
  IF (OLD.address IS DISTINCT FROM NEW.address) AND 
     (NEW.address IS NULL OR trim(NEW.address) = '') THEN
    -- Clear coordinates when address is removed
    NEW.location_lat = NULL;
    NEW.location_lng = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;