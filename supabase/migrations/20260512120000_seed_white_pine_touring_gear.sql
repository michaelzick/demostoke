-- Seed migration: White Pine Touring — granular HP mountain bike gear
-- Batch: park_city_utah
-- Created: 2026-05-12
-- Depends on: 20260511120000_seed_park_city_utah_shops.sql (apply shop first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512120000_seed_white_pine_touring_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear basis: whitepinetouring.com/mountain-bike-rentals-park-city.php
--   Only the High Performance section lists individual brand+model names.
--   Generic tier bikes (Mountain Bike, E-Mountain Bike, Kids') have no model names and are excluded
--   per the granular brand+model listing standard.
--
-- Image URLs per AGENTS.md mapping:
--   mountain-bikes primary:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
--   mountain-bikes secondary: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: White Pine Touring (Park City, UT) — mountain-bikes (HP models)
-- Email: michaelzick+whitepinetouringparkcity@gmail.com
-- Price basis: whitepinetouring.com/mountain-bike-rentals-park-city.php, $149/day, retrieved 2026-05-12
-- Coordinates sourced from Google Maps embed on pcmsc.org/locations/white-pine-touring/
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+whitepinetouringparkcity@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: michaelzick+whitepinetouringparkcity@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_equipment_wpt_bikes (
    name text,
    category text,
    description text,
    price_per_day numeric,
    price_per_hour numeric,
    price_per_week numeric,
    size text,
    weight text,
    material text,
    suitable_skill_level text,
    status text,
    location_lat numeric,
    location_lng numeric,
    location_address text,
    subcategory text,
    damage_deposit numeric,
    visible_on_map boolean
  ) ON COMMIT DROP;

  INSERT INTO _seed_equipment_wpt_bikes VALUES
  (
    'Specialized Epic 8 Expert EVO',
    'mountain-bikes',
    'Top-of-the-line cross-country and trail race bike on 29in carbon wheels with 130mm front and 120mm rear travel. Lightweight and efficient for climbing Park City''s long ascents, composed and fast on technical descents. Helmet, pedals, and repair kit included.',
    149.00, NULL, NULL,
    '29in wheels; Carbon frame; 130mm front / 120mm rear travel',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.660554, -111.500644,
    '1790 Bonanza Drive, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Specialized Stumpjumper 15 Expert',
    'mountain-bikes',
    'Versatile all-mountain trail bike on 29in carbon wheels with 150mm front and 145mm rear travel. Handles everything from flowy singletrack to chunky natural features across Park City''s hundreds of miles of IMBA Gold-rated trails. Helmet, pedals, and repair kit included.',
    149.00, NULL, NULL,
    '29in wheels; Carbon frame; 150mm front / 145mm rear travel',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.660554, -111.500644,
    '1790 Bonanza Drive, Park City, UT 84060',
    NULL, NULL, true
  )
  ;

  WITH inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(),
      v_user_id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM _seed_equipment_wpt_bikes s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = v_user_id
        AND e.name = s.name
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT
      i.id,
      'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg',
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
      'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg',
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

  RAISE NOTICE 'White Pine Touring bikes inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

END $$;
