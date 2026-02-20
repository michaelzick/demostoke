
-- Create equipment_views table to track view counts
CREATE TABLE public.equipment_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries on equipment_id
CREATE INDEX idx_equipment_views_equipment_id ON public.equipment_views(equipment_id);

-- Add index for deduplication queries (equipment_id + viewer_ip + viewed_at)
CREATE INDEX idx_equipment_views_dedup ON public.equipment_views(equipment_id, viewer_ip, viewed_at);

-- Create a function to get trending equipment (top viewed items)
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
  ORDER BY COUNT(*) DESC, e.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable Row Level Security (though we'll keep it permissive for views)
ALTER TABLE public.equipment_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert views (for tracking)
CREATE POLICY "Anyone can record equipment views" 
  ON public.equipment_views 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow reading view data (for trending calculations)
CREATE POLICY "Anyone can read equipment views" 
  ON public.equipment_views 
  FOR SELECT 
  USING (true);
;
