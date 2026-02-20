-- Fix the security definer warning by explicitly setting the view to use SECURITY INVOKER
-- This ensures the view respects the permissions of the querying user, not the view creator

-- Recreate the view with explicit SECURITY INVOKER
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  member_since,
  name,
  avatar_url,
  about,
  hero_image_url,
  -- Only show phone if user has opted in
  CASE WHEN show_phone = true THEN phone ELSE NULL END as phone,
  -- Only show address if user has opted in
  CASE WHEN show_address = true THEN address ELSE NULL END as address,
  -- Only show website if user has opted in
  CASE WHEN show_website = true THEN website ELSE NULL END as website,
  -- Only show location coordinates if user has opted in
  CASE WHEN show_location = true THEN location_lat ELSE NULL END as location_lat,
  CASE WHEN show_location = true THEN location_lng ELSE NULL END as location_lng,
  -- Include the privacy flags themselves so clients know what's visible
  show_phone,
  show_address,
  show_website,
  show_location,
  privacy_acknowledgment
FROM public.profiles;;
