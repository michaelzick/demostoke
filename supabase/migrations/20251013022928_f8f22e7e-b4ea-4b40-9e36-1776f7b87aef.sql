-- Drop obsolete image tracking tables that reference non-existent equipment.image_url column
-- These tables are no longer needed as the image conversion edge functions have been updated
-- to work directly with equipment_images table

DROP TABLE IF EXISTS public.jpeg_images CASCADE;
DROP TABLE IF EXISTS public.webp_images CASCADE;
DROP TABLE IF EXISTS public.temp_images CASCADE;