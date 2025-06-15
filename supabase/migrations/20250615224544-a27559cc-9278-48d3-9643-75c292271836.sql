
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_trending_equipment(integer);

-- Add view_count column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_equipment_view_count(equipment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.equipment 
  SET view_count = view_count + 1 
  WHERE id = equipment_id;
END;
$$ LANGUAGE plpgsql;

-- Create the new get_trending_equipment function with correct return type
CREATE OR REPLACE FUNCTION public.get_trending_equipment(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  equipment_id UUID,
  view_count INTEGER
) AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- Initialize view_count for existing equipment based on current equipment_views data
UPDATE public.equipment 
SET view_count = (
  SELECT COUNT(*) 
  FROM public.equipment_views ev 
  WHERE ev.equipment_id = equipment.id
)
WHERE id IN (
  SELECT DISTINCT equipment_id 
  FROM public.equipment_views
);
