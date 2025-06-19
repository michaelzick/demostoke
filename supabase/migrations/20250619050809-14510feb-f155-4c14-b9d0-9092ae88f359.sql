
-- Add location columns to profiles table for caching geocoded coordinates
ALTER TABLE public.profiles 
ADD COLUMN location_lat numeric,
ADD COLUMN location_lng numeric;

-- Add map display mode setting to app_settings table
INSERT INTO public.app_settings (setting_key, setting_value, created_at, updated_at)
VALUES ('map_display_mode', '"gear_items"'::jsonb, now(), now())
ON CONFLICT (setting_key) DO NOTHING;

-- Create a function to geocode addresses when profiles are updated
CREATE OR REPLACE FUNCTION public.geocode_profile_address()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only geocode if address has changed and is not null/empty
  IF (OLD.address IS DISTINCT FROM NEW.address) AND 
     (NEW.address IS NOT NULL AND trim(NEW.address) != '') THEN
    -- Reset coordinates when address changes - they'll be updated by the app
    NEW.location_lat = NULL;
    NEW.location_lng = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically handle address changes
DROP TRIGGER IF EXISTS geocode_address_on_profile_update ON public.profiles;
CREATE TRIGGER geocode_address_on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.geocode_profile_address();
