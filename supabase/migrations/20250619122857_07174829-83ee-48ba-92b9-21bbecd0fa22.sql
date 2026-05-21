
-- Fix the geocoding trigger to not interfere with client-side geocoding
-- The trigger was resetting coordinates to NULL every time, preventing our app from saving them

-- Drop the existing trigger
DROP TRIGGER IF EXISTS geocode_address_on_profile_update ON public.profiles;

-- Update the function to only clear coordinates if they're being set to NULL explicitly
-- or if the address is being cleared, but allow the app to set coordinates
CREATE OR REPLACE FUNCTION public.geocode_profile_address()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
$$;

-- Recreate the trigger
CREATE TRIGGER geocode_address_on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.geocode_profile_address();
