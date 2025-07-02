
-- Step 1: Add the new location_address column
ALTER TABLE public.equipment ADD COLUMN location_address text;

-- Step 2: Populate location_address with data from associated profiles
UPDATE public.equipment 
SET location_address = profiles.address,
    location_lat = profiles.location_lat,
    location_lng = profiles.location_lng
FROM public.profiles 
WHERE equipment.user_id = profiles.id 
AND profiles.address IS NOT NULL;

-- Step 3: Drop the old location_zip column
ALTER TABLE public.equipment DROP COLUMN location_zip;
