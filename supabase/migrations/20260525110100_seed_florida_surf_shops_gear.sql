-- Seed migration: Florida surf-shop gear
-- Batch: florida_surf_shops
-- Created: 2026-05-25
-- Depends on: 20260525110000_seed_florida_surf_shops_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260525110100_seed_florida_surf_shops_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Surfboards primary image:   https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg
-- Surfboards secondary image: https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg

-- =============================================
-- EQUIPMENT: Spunky's Surf Shop (Fort Pierce, FL) - surfboards
-- Email: michaelzick+spunkyssurfshopfortpierce@gmail.com
-- Price basis: spunkyssurfshop.com/pages/rentals-lessons, full-day surfboard rental, retrieved 2026-05-25.
-- Coordinates sourced from US Census Geocoder street-address/range match for 1403 N US Hwy 1, Fort Pierce, FL 34950.
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
      (E'michaelzick+spunkyssurfshopfortpierce@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Hybrid',
        E'surfboards',
        E'The Torq Hybrid is a performance-board rental listed by Spunky''s Surf Shop. The public rental page lists the Hybrid with a compact shortboard length and 30.6 liters of volume, with full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'performance shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Multiplier',
        E'surfboards',
        E'The Torq Multiplier is a performance-board rental listed by Spunky''s Surf Shop. The public rental page lists the Multiplier with a compact shortboard length and 28.8 liters of volume, with full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'performance shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Fish',
        E'surfboards',
        E'The Torq Fish is a performance-board rental listed by Spunky''s Surf Shop. The public rental page lists the Fish with a 39.6-liter volume and full-day surfboard pricing for Fort Pierce surf rentals.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'fish', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Big Boy',
        E'surfboards',
        E'The Torq Big Boy is a fun-shape rental listed by Spunky''s Surf Shop. The public rental page lists the Big Boy with 43.5 liters of volume and full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'funboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Sunova Christian Fletcher Loose Juice',
        E'surfboards',
        E'The Sunova Christian Fletcher Loose Juice is a fun-shape rental listed by Spunky''s Surf Shop. The public rental page lists it with 36.9 liters of volume and full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'funboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Sunova Christian Fletcher Doheny',
        E'surfboards',
        E'The Sunova Christian Fletcher Doheny is a fun-shape rental listed by Spunky''s Surf Shop. The public rental page lists it with 38.1 liters of volume and full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'funboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Fun',
        E'surfboards',
        E'The Torq Fun is a fun-shape rental listed by Spunky''s Surf Shop. The public rental page lists the Fun with 41.8 liters of volume and full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'funboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq M2 V+',
        E'surfboards',
        E'The Torq M2 V+ is a larger fun-shape rental listed by Spunky''s Surf Shop. The public rental page lists the M2 V+ with 56 liters of volume and full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'funboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Torq Longboard',
        E'surfboards',
        E'The Torq Longboard is a longboard rental listed by Spunky''s Surf Shop. The public rental page lists multiple Longboard lengths and volumes with full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+spunkyssurfshopfortpierce@gmail.com',
        E'Catch Surf Soft Top',
        E'surfboards',
        E'The Catch Surf Soft Top is a soft-top longboard rental listed by Spunky''s Surf Shop. The public rental page lists multiple soft-top lengths and volumes with full-day surfboard pricing.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner',
        'available',
        27.4338466, -80.3259843,
        E'1403 N US Hwy 1, Fort Pierce, FL 34950',
        E'soft-top', NULL::numeric, true
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
      'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg',
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
      'https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg',
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

  RAISE NOTICE 'Spunky''s Surf Shop surfboards inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
