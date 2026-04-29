-- Read Performance Optimization
-- Applied via: supabase db query --linked -f <this-file>
-- Do NOT use supabase db push (migration drift between CLI and Studio).
--
-- Safety: DROP INDEX only removes lookup shortcuts, never data.
-- All public read RLS policies (USING (true)) are preserved.
-- Only admin write policies are rewritten to use is_admin().

-- =============================================================
-- PART 1: DROP DEAD INDEXES
-- Tables are small (< 2500 rows each) so brief ACCESS SHARE locks
-- from non-CONCURRENTLY drops are milliseconds.
-- IF EXISTS = safe even if Studio already dropped some.
-- =============================================================

-- equipment (~5.7 MB of unused GIN + partial indexes)
DROP INDEX IF EXISTS public.idx_equipment_text_search;
DROP INDEX IF EXISTS public.idx_equipment_search_composite;
DROP INDEX IF EXISTS public.idx_equipment_location_category;
DROP INDEX IF EXISTS public.idx_equipment_location;
DROP INDEX IF EXISTS public.idx_equipment_pagination_price;
DROP INDEX IF EXISTS public.idx_equipment_images_display_order;
DROP INDEX IF EXISTS public.idx_equipment_images_primary;
DROP INDEX IF EXISTS public.idx_equipment_pagination_views;
DROP INDEX IF EXISTS public.idx_equipment_view_count;
DROP INDEX IF EXISTS public.idx_equipment_available_featured;
DROP INDEX IF EXISTS public.idx_equipment_featured;

-- blog_posts (~640 kB)
DROP INDEX IF EXISTS public.idx_blog_posts_text_search;
DROP INDEX IF EXISTS public.idx_blog_posts_tags;
DROP INDEX IF EXISTS public.idx_blog_posts_category_published;
DROP INDEX IF EXISTS public.idx_blog_posts_pagination;
DROP INDEX IF EXISTS public.idx_blog_posts_published_at;

-- profiles (~216 kB)
DROP INDEX IF EXISTS public.idx_profiles_text_search;
DROP INDEX IF EXISTS public.idx_profiles_search_covering;

-- small/empty tables (minor, belt-and-suspenders)
DROP INDEX IF EXISTS public.idx_demo_calendar_is_featured;
DROP INDEX IF EXISTS public.idx_demo_event_candidates_event_date;
DROP INDEX IF EXISTS public.idx_demo_event_candidates_last_seen_at;
DROP INDEX IF EXISTS public.idx_demo_event_candidates_gear_category;
DROP INDEX IF EXISTS public.idx_shop_gear_feed_mappings_is_active;
DROP INDEX IF EXISTS public.idx_app_settings_updated_by;
DROP INDEX IF EXISTS public.idx_user_roles_assigned_by;
DROP INDEX IF EXISTS public.idx_scraped_retailers_status;
DROP INDEX IF EXISTS public.idx_scraped_retailers_business_url;
DROP INDEX IF EXISTS public.idx_scraped_retailers_created_at;

-- =============================================================
-- PART 2: ADD MISSING USEFUL INDEXES
-- =============================================================

-- demo_calendar: forward-event range scans (SSR sitemap + client useDemoEvents)
CREATE INDEX IF NOT EXISTS idx_demo_calendar_event_date
  ON public.demo_calendar (event_date ASC NULLS LAST)
  WHERE event_date IS NOT NULL;

-- equipment: SSR profile slug → equipment owner lookup
-- Covers: .eq('external_source_provider', ...).eq('external_source_shop_slug', ...)
CREATE INDEX IF NOT EXISTS idx_equipment_external_source_slug
  ON public.equipment (external_source_provider, external_source_shop_slug)
  WHERE external_source_shop_slug IS NOT NULL;

-- =============================================================
-- PART 3: pricing_options — add public SELECT, remove join-based SELECT
-- Pricing data is non-sensitive. The correlated join check on every
-- row caused 744 seq scans. Write policies are unchanged.
-- =============================================================

DROP POLICY IF EXISTS "Users can view pricing options for their own equipment" ON public.pricing_options;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pricing_options'
      AND policyname = 'Public can read pricing options'
  ) THEN
    CREATE POLICY "Public can read pricing options"
      ON public.pricing_options
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- =============================================================
-- PART 4: RLS admin write policies — convert inline EXISTS to is_admin()
--
-- is_admin() is SECURITY DEFINER STABLE, so PostgreSQL can optimise
-- its evaluation. The inline EXISTS subquery re-runs against user_roles
-- per row per query, causing 102K+ seq scans.
--
-- ONLY admin write/ALL policies are touched.
-- Public SELECT policies (USING (true)) are left untouched.
-- =============================================================

-- ---- app_settings ----
-- Drop the redundant NULL-qual SELECT policy (Allow public read access stays)
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;

-- Convert ALL + insert + update policies
DROP POLICY IF EXISTS "Admins can modify app settings" ON public.app_settings;
CREATE POLICY "Admins can modify app settings"
  ON public.app_settings
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can insert app settings" ON public.app_settings;
CREATE POLICY "Only admins can insert app settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can update app settings" ON public.app_settings;
CREATE POLICY "Only admins can update app settings"
  ON public.app_settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- equipment ----
DROP POLICY IF EXISTS "Admins can delete any equipment" ON public.equipment;
CREATE POLICY "Admins can delete any equipment"
  ON public.equipment
  FOR DELETE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update any equipment" ON public.equipment;
CREATE POLICY "Admins can update any equipment"
  ON public.equipment
  FOR UPDATE
  USING (is_admin());

-- ---- equipment_images (compound: user owns parent equipment OR admin) ----
DROP POLICY IF EXISTS "Users and admins can delete images for equipment" ON public.equipment_images;
CREATE POLICY "Users and admins can delete images for equipment"
  ON public.equipment_images
  FOR DELETE
  USING (
    (EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_images.equipment_id
        AND equipment.user_id = (SELECT auth.uid())
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS "Users and admins can insert images for equipment" ON public.equipment_images;
CREATE POLICY "Users and admins can insert images for equipment"
  ON public.equipment_images
  FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_images.equipment_id
        AND equipment.user_id = (SELECT auth.uid())
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS "Users and admins can update images for equipment" ON public.equipment_images;
CREATE POLICY "Users and admins can update images for equipment"
  ON public.equipment_images
  FOR UPDATE
  USING (
    (EXISTS (
      SELECT 1 FROM public.equipment
      WHERE equipment.id = equipment_images.equipment_id
        AND equipment.user_id = (SELECT auth.uid())
    ))
    OR is_admin()
  );

-- ---- profiles ----
DROP POLICY IF EXISTS "Admins can create profiles for users" ON public.profiles;
CREATE POLICY "Admins can create profiles for users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (is_admin());

-- ---- downloaded_images ----
DROP POLICY IF EXISTS "Admins can manage downloaded_images" ON public.downloaded_images;
CREATE POLICY "Admins can manage downloaded_images"
  ON public.downloaded_images
  FOR ALL
  USING (is_admin());

-- ---- design_system_components ----
DROP POLICY IF EXISTS "Admins can manage all components" ON public.design_system_components;
CREATE POLICY "Admins can manage all components"
  ON public.design_system_components
  FOR ALL
  USING (is_admin());

-- ---- security_audit_log ----
DROP POLICY IF EXISTS "Only admins can read security audit logs" ON public.security_audit_log;
CREATE POLICY "Only admins can read security audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (is_admin());
