-- Comprehensive Performance Optimization Plan
-- Phase 2: Advanced Indexing Strategy

-- Specialized composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_equipment_search_composite 
ON public.equipment(status, visible_on_map, category, location_lat, location_lng, created_at DESC) 
WHERE status = 'available' AND visible_on_map = true;

CREATE INDEX IF NOT EXISTS idx_equipment_user_category 
ON public.equipment(user_id, category, status);

CREATE INDEX IF NOT EXISTS idx_equipment_location_category 
ON public.equipment(category, location_lat, location_lng) 
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_equipment_available_featured 
ON public.equipment(created_at DESC, view_count DESC) 
WHERE status = 'available' AND is_featured = true;

CREATE INDEX IF NOT EXISTS idx_equipment_visible_trending 
ON public.equipment(view_count DESC, name) 
WHERE visible_on_map = true AND status = 'available' AND view_count > 0;

-- Covering indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_equipment_list_covering 
ON public.equipment(category, status, visible_on_map) 
INCLUDE (id, name, price_per_day, location_lat, location_lng, created_at, view_count);

CREATE INDEX IF NOT EXISTS idx_profiles_search_covering 
ON public.profiles(name) 
INCLUDE (id, avatar_url, address, location_lat, location_lng) 
WHERE name IS NOT NULL;

-- GIN indexes for text search capabilities
CREATE INDEX IF NOT EXISTS idx_equipment_text_search 
ON public.equipment USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_blog_posts_text_search 
ON public.blog_posts USING gin(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_profiles_text_search 
ON public.profiles USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(about, '')));

-- Array indexes for tags
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags 
ON public.blog_posts USING gin(tags) 
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0;

-- Phase 3: Query Performance Optimization

-- Materialized view for trending equipment
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trending_equipment AS
SELECT 
  e.id,
  e.name,
  e.category,
  e.price_per_day,
  e.view_count,
  e.location_lat,
  e.location_lng,
  p.name as owner_name,
  p.avatar_url as owner_avatar
FROM public.equipment e
LEFT JOIN public.profiles p ON e.user_id = p.id
WHERE e.status = 'available' 
  AND e.visible_on_map = true 
  AND e.view_count > 0
ORDER BY e.view_count DESC, e.name ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trending_equipment_id 
ON mv_trending_equipment(id);

-- Materialized view for equipment statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_equipment_stats AS
SELECT 
  category,
  COUNT(*) as total_equipment,
  AVG(price_per_day) as avg_price_per_day,
  AVG(view_count) as avg_view_count,
  COUNT(*) FILTER (WHERE status = 'available') as available_count
FROM public.equipment
GROUP BY category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_equipment_stats_category 
ON mv_equipment_stats(category);

-- Indexes for sorting and pagination operations
CREATE INDEX IF NOT EXISTS idx_equipment_pagination_created 
ON public.equipment(created_at DESC, id) 
WHERE status = 'available' AND visible_on_map = true;

CREATE INDEX IF NOT EXISTS idx_equipment_pagination_price 
ON public.equipment(price_per_day ASC, id) 
WHERE status = 'available' AND visible_on_map = true;

CREATE INDEX IF NOT EXISTS idx_equipment_pagination_views 
ON public.equipment(view_count DESC, id) 
WHERE status = 'available' AND visible_on_map = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_pagination 
ON public.blog_posts(published_at DESC, id);

CREATE INDEX IF NOT EXISTS idx_equipment_reviews_pagination 
ON public.equipment_reviews(created_at DESC, id);

-- Optimized indexes for JOIN operations
CREATE INDEX IF NOT EXISTS idx_equipment_images_join 
ON public.equipment_images(equipment_id, display_order, is_primary);

CREATE INDEX IF NOT EXISTS idx_pricing_options_join 
ON public.pricing_options(equipment_id, duration);

CREATE INDEX IF NOT EXISTS idx_equipment_views_analytics 
ON public.equipment_views(equipment_id, viewed_at DESC) 
INCLUDE (user_id, viewer_ip);

-- Phase 4: Maintenance Automation and Configuration

-- Configure autovacuum settings for high-traffic tables
ALTER TABLE public.equipment SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05,
  autovacuum_vacuum_threshold = 100,
  autovacuum_analyze_threshold = 50
);

ALTER TABLE public.equipment_views SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 50,
  autovacuum_analyze_threshold = 25
);

ALTER TABLE public.profiles SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

ALTER TABLE public.blog_posts SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- Set statistics targets for better query planning
ALTER TABLE public.equipment ALTER COLUMN category SET STATISTICS 1000;
ALTER TABLE public.equipment ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE public.equipment ALTER COLUMN location_lat SET STATISTICS 500;
ALTER TABLE public.equipment ALTER COLUMN location_lng SET STATISTICS 500;
ALTER TABLE public.equipment ALTER COLUMN price_per_day SET STATISTICS 500;
ALTER TABLE public.equipment ALTER COLUMN view_count SET STATISTICS 500;

ALTER TABLE public.profiles ALTER COLUMN name SET STATISTICS 500;
ALTER TABLE public.blog_posts ALTER COLUMN category SET STATISTICS 500;
ALTER TABLE public.blog_posts ALTER COLUMN tags SET STATISTICS 500;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_performance_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_trending_equipment;
  REFRESH MATERIALIZED VIEW mv_equipment_stats;
END;
$$;

-- Analyze all tables to update query planner statistics
ANALYZE public.equipment;
ANALYZE public.equipment_images;
ANALYZE public.equipment_reviews;
ANALYZE public.equipment_views;
ANALYZE public.profiles;
ANALYZE public.user_roles;
ANALYZE public.pricing_options;
ANALYZE public.blog_posts;
ANALYZE public.app_settings;
ANALYZE public.demo_calendar;
ANALYZE public.downloaded_images;
ANALYZE public.jpeg_images;
ANALYZE public.processed_images;
ANALYZE public.security_audit_log;
ANALYZE public.temp_images;
ANALYZE public.webp_images;;
