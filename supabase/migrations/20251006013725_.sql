-- Fix privacy exposure in profiles table by respecting privacy toggle fields
-- This migration creates a secure public view that only shows data users have opted to share

-- Step 1: Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Step 2: Create a secure public view that respects privacy toggles
CREATE OR REPLACE VIEW public.public_profiles AS
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
FROM public.profiles;

-- Step 3: Grant SELECT access to anonymous users on the public view only
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Step 4: Add a more restrictive policy for authenticated users viewing the full profiles table
-- Authenticated users can only see their own full profile or use the public view for others
CREATE POLICY "Authenticated users can view their own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Step 5: Add a comment explaining the security model
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles that respects user privacy preferences. Only shows contact information (phone, address, website, location) when users have explicitly opted in via privacy toggles. Use this view for public-facing profile displays. For full profile access, users must be authenticated and viewing their own profile.';;
