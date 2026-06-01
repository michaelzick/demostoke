-- Seed migration: Eastern Time Zone ski gear
-- Batch: eastern_time_zone_all_categories
-- Created: 2026-05-30
-- Depends on: 20260530120000_seed_eastern_time_zone_all_categories_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120200_seed_eastern_time_zone_skis_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Skis primary image:   https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg
-- Skis secondary image: https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

-- =============================================
-- EQUIPMENT: Belleayre Mountain (Highmount, NY) - skis
-- Email: michaelzick+belleayremountainhighmount@gmail.com
-- Price basis: belleayre.com/tickets/high-performance-demos, Rossignol adult ski-only demo day rate, retrieved 2026-05-30.
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
        E'Rossignol Hero Elite MT TI C.A.M',
        E'skis',
        E'The Rossignol Hero Elite MT TI C.A.M is Belleayre''s race-inspired high-performance ski demo. It is built for precise on-trail turns and strong edge hold for skiers who want a quicker, more powerful carver.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'frontside carver', NULL::numeric, true
      ),
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Rossignol Forza 70 V-Ti',
        E'skis',
        E'The Rossignol Forza 70 V-Ti is Belleayre''s expert-focused carving demo ski. Its wide platform and race-proven construction support high-speed arcs and committed frontside turns.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'frontside carver', NULL::numeric, true
      ),
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Rossignol Forza 60 Ti',
        E'skis',
        E'The Rossignol Forza 60 Ti is a Belleayre on-piste demo ski for confident intermediate and advanced riders. It balances edge precision with approachable control for skiers working on stronger carving technique.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'frontside carver', NULL::numeric, true
      ),
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Rossignol Sender Soul 102',
        E'skis',
        E'The Rossignol Sender Soul 102 is Belleayre''s freeride demo for mixed snow and soft-snow days. It has enough width for fresh snow while staying versatile for trees, soft groomers, and variable afternoon conditions.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.1299384, -74.5060014,
        E'181 Galli Curci Road, Highmount, NY 12441',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+belleayremountainhighmount@gmail.com',
        E'Rossignol Arcade 84',
        E'skis',
        E'The Rossignol Arcade 84 is Belleayre''s all-mountain demo ski for advanced riders who want one ski for changing resort conditions. It blends frontside carving energy with enough width and rocker for mixed terrain.',
        70.00::numeric, NULL::numeric, NULL::numeric,
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
      'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg',
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
      'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg',
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

  RAISE NOTICE 'Belleayre Mountain skis inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
