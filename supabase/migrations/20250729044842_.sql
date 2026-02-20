-- Add performance-enhancing indexes for common query patterns

-- Index for equipment queries by user_id (for user equipment lists)
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON public.equipment(user_id);

-- Index for equipment queries by category and status (for browse/search)
CREATE INDEX IF NOT EXISTS idx_equipment_category_status ON public.equipment(category, status);

-- Index for equipment queries by location (for map view)
CREATE INDEX IF NOT EXISTS idx_equipment_location ON public.equipment(location_lat, location_lng) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Index for equipment by visibility and status (for public listing)
CREATE INDEX IF NOT EXISTS idx_equipment_visible_status ON public.equipment(visible_on_map, status);

-- Index for equipment by view_count for trending queries
CREATE INDEX IF NOT EXISTS idx_equipment_view_count ON public.equipment(view_count DESC) WHERE view_count > 0;

-- Index for equipment_images by equipment_id (for image fetching)
CREATE INDEX IF NOT EXISTS idx_equipment_images_equipment_id ON public.equipment_images(equipment_id);

-- Index for equipment_images by primary flag (for primary image queries)
CREATE INDEX IF NOT EXISTS idx_equipment_images_primary ON public.equipment_images(equipment_id, is_primary) WHERE is_primary = true;

-- Index for equipment_reviews by equipment_id (for review fetching)
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_equipment_id ON public.equipment_reviews(equipment_id);

-- Index for equipment_reviews by reviewer_id (for user review history)
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_reviewer_id ON public.equipment_reviews(reviewer_id);

-- Index for pricing_options by equipment_id (for pricing queries)
CREATE INDEX IF NOT EXISTS idx_pricing_options_equipment_id ON public.pricing_options(equipment_id);

-- Index for user_roles by user_id (for role checking)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Index for profiles by name for search functionality
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name) WHERE name IS NOT NULL;

-- Index for blog_posts by published date for recent posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Index for blog_posts by category and published date
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published ON public.blog_posts(category, published_at DESC);

-- Composite index for equipment search and filtering
CREATE INDEX IF NOT EXISTS idx_equipment_search ON public.equipment(status, visible_on_map, category, created_at DESC);

-- Index for equipment by featured status
CREATE INDEX IF NOT EXISTS idx_equipment_featured ON public.equipment(is_featured, status) WHERE is_featured = true;

-- Index for equipment_views for analytics
CREATE INDEX IF NOT EXISTS idx_equipment_views_equipment_date ON public.equipment_views(equipment_id, viewed_at);

-- Analyze tables to update query planner statistics
ANALYZE public.equipment;
ANALYZE public.equipment_images;
ANALYZE public.equipment_reviews;
ANALYZE public.profiles;
ANALYZE public.user_roles;
ANALYZE public.pricing_options;
ANALYZE public.blog_posts;;
