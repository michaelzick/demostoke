-- Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Drop the public materialized views first (this will also break any dependencies)
DROP MATERIALIZED VIEW IF EXISTS public.mv_equipment_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.mv_trending_equipment CASCADE;

-- Create new materialized views in private schema using original definitions
CREATE MATERIALIZED VIEW private.mv_equipment_stats AS
SELECT 
  equipment.category,
  count(*) AS total_equipment,
  avg(equipment.price_per_day) AS avg_price_per_day,
  avg(equipment.view_count) AS avg_view_count,
  count(*) FILTER (WHERE equipment.status = 'available'::text) AS available_count
FROM equipment
GROUP BY equipment.category;

CREATE MATERIALIZED VIEW private.mv_trending_equipment AS
SELECT 
  e.id,
  e.name,
  e.category,
  e.price_per_day,
  e.view_count,
  e.location_lat,
  e.location_lng,
  p.name AS owner_name,
  p.avatar_url AS owner_avatar
FROM equipment e
LEFT JOIN profiles p ON e.user_id = p.id
WHERE e.status = 'available'::text AND e.visible_on_map = true AND e.view_count > 0
ORDER BY e.view_count DESC, e.name;

-- Revoke any remaining access (cleanup)
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;;
