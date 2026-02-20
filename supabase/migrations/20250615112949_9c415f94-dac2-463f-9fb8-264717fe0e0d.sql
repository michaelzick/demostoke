
-- Fix the mutability settings with proper search path configuration

-- Update the increment_equipment_view_count function with explicit search path
CREATE OR REPLACE FUNCTION public.increment_equipment_view_count(equipment_id UUID)
RETURNS VOID 
LANGUAGE plpgsql
VOLATILE -- Explicitly mark as volatile since it modifies data
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.equipment 
  SET view_count = view_count + 1 
  WHERE id = equipment_id;
END;
$$;

-- Update the get_trending_equipment function with explicit search path
CREATE OR REPLACE FUNCTION public.get_trending_equipment(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  equipment_id UUID,
  view_count INTEGER
) 
LANGUAGE plpgsql
STABLE -- Mark as stable since it only reads data
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as equipment_id,
    e.view_count
  FROM public.equipment e
  WHERE e.status = 'available' AND e.visible_on_map = true AND e.view_count > 0
  ORDER BY e.view_count DESC, e.name ASC
  LIMIT limit_count;
END;
$$;

-- Update the update_equipment_multiple_images_flag function with explicit search path
CREATE OR REPLACE FUNCTION public.update_equipment_multiple_images_flag()
RETURNS TRIGGER 
LANGUAGE plpgsql
VOLATILE -- Mark as volatile since it modifies data
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update the equipment table to reflect if it has multiple images
  UPDATE public.equipment 
  SET has_multiple_images = (
    SELECT COUNT(*) > 1 
    FROM public.equipment_images 
    WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
  )
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;
;
