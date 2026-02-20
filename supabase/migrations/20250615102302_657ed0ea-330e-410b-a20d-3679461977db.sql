
-- Fix the get_trending_equipment function to properly handle the GROUP BY clause
CREATE OR REPLACE FUNCTION public.get_trending_equipment(limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  equipment_id UUID,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ev.equipment_id,
    COUNT(*) as view_count
  FROM public.equipment_views ev
  JOIN public.equipment e ON e.id = ev.equipment_id
  WHERE e.status = 'available' AND e.visible_on_map = true
  GROUP BY ev.equipment_id
  ORDER BY COUNT(*) DESC, 
           (SELECT name FROM public.equipment WHERE id = ev.equipment_id) ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
;
