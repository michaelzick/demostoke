-- Seed migration: Eastern Time Zone snowboard gear
-- Batch: eastern_time_zone_all_categories
-- Created: 2026-05-30
-- Depends on: 20260530120000_seed_eastern_time_zone_all_categories_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120300_seed_eastern_time_zone_snowboards_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Snowboards primary image:   https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg
-- Snowboards secondary image: https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg

-- =============================================
-- EQUIPMENT: Belleayre Mountain (Highmount, NY) - snowboards
-- Email: michaelzick+belleayremountainhighmount@gmail.com
-- Price basis: belleayre.com/tickets/high-performance-demos, adult snowboard demo package day rate, retrieved 2026-05-30.
-- Coordinates sourced from OpenStreetMap/Nominatim place match for Belleayre Mountain Ski Center.
-- =============================================
DO $$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (
    VALUES
      (E'michaelzick+belleayremountainhighmount@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Burton Custom',
        E'snowboards',
        E'The Burton Custom is Belleayre''s men''s all-mountain snowboard demo with Step On bindings. It is a poppy, versatile camber board for riders who want a responsive platform across groomers, side hits, and mixed resort terrain.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Burton Feelgood',
        E'snowboards',
        E'The Burton Feelgood is Belleayre''s women''s all-mountain snowboard demo with Step On bindings. Its camber feel, directional shaping, and powerful edge response make it a strong board for riders chasing lines and natural hits.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'all-mountain', NULL::numeric, true
      )
  ),
  inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(),
      su.id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM seed_equipment s
    JOIN auth.users su ON su.email = s.seed_email
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = su.id
        AND e.name = s.name
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT
      i.id,
      'https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg',
      0,
      true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id
        AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT
      i.id,
      'https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg',
      1,
      false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id
        AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT
    (SELECT count(*) FROM inserted),
    (SELECT count(*) FROM ins1),
    (SELECT count(*) FROM ins2)
  INTO
    v_equipment_inserted,
    v_primary_images_added,
    v_secondary_images_added;

  RAISE NOTICE 'Belleayre Mountain snowboards inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
