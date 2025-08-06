-- Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Move mv_equipment_stats to private schema
CREATE MATERIALIZED VIEW private.mv_equipment_stats AS
SELECT 
  equipment_id,
  view_count,
  review_count,
  rating
FROM public.mv_equipment_stats;

-- Move mv_trending_equipment to private schema  
CREATE MATERIALIZED VIEW private.mv_trending_equipment AS
SELECT 
  equipment_id,
  view_count
FROM public.mv_trending_equipment;

-- Drop the public materialized views
DROP MATERIALIZED VIEW public.mv_equipment_stats;
DROP MATERIALIZED VIEW public.mv_trending_equipment;

-- Revoke any remaining access (cleanup)
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;