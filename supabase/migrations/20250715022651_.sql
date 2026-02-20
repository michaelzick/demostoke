-- Migration to deprecate the image_url column in the equipment table
-- This column is no longer used since all images are now stored in equipment_images table

-- First, let's add a comment to mark the column as deprecated
COMMENT ON COLUMN public.equipment.image_url IS 'DEPRECATED: This column is no longer used. All equipment images are now stored in the equipment_images table.';

-- Optional: We could also remove the column entirely, but keeping it for now in case there's any legacy data
-- If you want to remove it completely, uncomment the following line:
-- ALTER TABLE public.equipment DROP COLUMN image_url;

-- Update any remaining equipment records that might still have image_url but no equipment_images
-- This ensures all equipment has at least one image record in equipment_images if they had an image_url
INSERT INTO public.equipment_images (equipment_id, image_url, is_primary, display_order)
SELECT 
    e.id,
    e.image_url,
    true, -- Set as primary
    0 -- First display order
FROM public.equipment e
WHERE e.image_url IS NOT NULL 
    AND e.image_url != ''
    AND NOT EXISTS (
        SELECT 1 FROM public.equipment_images ei 
        WHERE ei.equipment_id = e.id
    );

-- Update the has_multiple_images flag for all equipment
UPDATE public.equipment 
SET has_multiple_images = (
    SELECT COUNT(*) > 1 
    FROM public.equipment_images 
    WHERE equipment_id = equipment.id
);;
