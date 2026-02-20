-- Fix function search path security issue
-- Set search_path for functions that don't have it set

CREATE OR REPLACE FUNCTION public.get_app_setting(key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN (SELECT setting_value FROM public.app_settings WHERE setting_key = key LIMIT 1);
END;
$function$;;
