
-- 1. Add is_hidden column to profiles
ALTER TABLE public.profiles ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;

-- 2. Recreate public_profiles view to exclude hidden users
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT id,
    created_at,
    member_since,
    name,
    avatar_url,
    about,
    hero_image_url,
    CASE WHEN (show_phone = true) THEN phone ELSE NULL::text END AS phone,
    CASE WHEN (show_address = true) THEN address ELSE NULL::text END AS address,
    CASE WHEN (show_website = true) THEN website ELSE NULL::text END AS website,
    CASE WHEN (show_location = true) THEN location_lat ELSE NULL::numeric END AS location_lat,
    CASE WHEN (show_location = true) THEN location_lng ELSE NULL::numeric END AS location_lng,
    show_phone,
    show_address,
    show_website,
    show_location,
    privacy_acknowledgment
FROM profiles
WHERE is_hidden = false;

-- 3. Update get_trending_equipment to exclude hidden users
CREATE OR REPLACE FUNCTION public.get_trending_equipment(limit_count integer DEFAULT 3)
 RETURNS TABLE(equipment_id uuid, view_count integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as equipment_id,
    e.view_count
  FROM public.equipment e
  INNER JOIN public.profiles p ON p.id = e.user_id
  WHERE e.status = 'available' 
    AND e.visible_on_map = true 
    AND e.view_count > 0
    AND p.is_hidden = false
  ORDER BY e.view_count DESC, e.name ASC
  LIMIT limit_count;
END;
$function$;
;
