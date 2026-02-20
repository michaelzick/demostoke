
-- Add a hero_image_url column to profiles; nullable, since not all will use a hero image
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
;
