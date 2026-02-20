-- Allow anyone (including anonymous users) to read basic profile information
-- This is necessary for public-facing gear owner profiles in the marketplace
CREATE POLICY "Anyone can view public profile information"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);;
