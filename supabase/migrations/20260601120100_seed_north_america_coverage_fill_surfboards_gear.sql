-- Seed migration: North America coverage fill surfboard gear
-- Batch: north_america_coverage_fill
-- Created: 2026-06-01
-- Depends on: 20260601120000_seed_north_america_coverage_fill_shops.sql
-- Remote status: applied to linked Supabase project on 2026-06-01.
-- Image URLs (surfboards): https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg and https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg

DO $seed_migration$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (VALUES (E'michaelzick+surfmexicobucerias@gmail.com')) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Walden Magic',
        E'surfboards',
        E'Surf Mexico lists the Walden Magic as an 8 ft standard surfboard with 61.7 liters of volume. The official standard-board rental rate is 700 MXN for 1 day and 3000 MXN for 1 week.',
        700.00::numeric, NULL::numeric, 3000.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Walden Magic Blue Dark',
        E'surfboards',
        E'Surf Mexico lists the Walden Magic Blue Dark as a 9 ft standard surfboard with 67.6 liters of volume. The official standard-board rental rate is 700 MXN for 1 day and 3000 MXN for 1 week.',
        700.00::numeric, NULL::numeric, 3000.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Walden Magic Blue',
        E'surfboards',
        E'Surf Mexico lists the Walden Magic Blue as a 9 ft 6 in standard surfboard with 79.9 liters of volume. The official standard-board rental rate is 700 MXN for 1 day and 3000 MXN for 1 week.',
        700.00::numeric, NULL::numeric, 3000.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'NSP Protech Fish',
        E'surfboards',
        E'Surf Mexico lists the NSP Protech Fish white tint FTU as a 6 ft high-performance surfboard with 35.1 liters of volume. The official high-performance-board rental rate is 800 MXN for 1 day and 3500 MXN for 1 week.',
        800.00::numeric, NULL::numeric, 3500.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'fish', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'NSP Protech Tinder-D8',
        E'surfboards',
        E'Surf Mexico lists the NSP Protech Tinder-D8 white FTU in 6 ft 2 in and 6 ft 6 in high-performance sizes. The official high-performance-board rental rate is 800 MXN for 1 day and 3500 MXN for 1 week.',
        800.00::numeric, NULL::numeric, 3500.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'performance fish', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Walden Mini Mega Magic Tuflite',
        E'surfboards',
        E'Surf Mexico lists the Walden Mini Mega Magic Tuflite as a 6 ft 10 in high-performance board with 67.0 liters of volume. The official high-performance-board rental rate is 800 MXN for 1 day and 3500 MXN for 1 week.',
        800.00::numeric, NULL::numeric, 3500.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'mini longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Channel Islands Water',
        E'surfboards',
        E'Surf Mexico lists the Channel Islands Water as a 7 ft 10 in high-performance surfboard with 54.4 liters of volume. The official high-performance-board rental rate is 800 MXN for 1 day and 3500 MXN for 1 week.',
        800.00::numeric, NULL::numeric, 3500.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'mid-length', NULL::numeric, true
      ),
      (
        E'michaelzick+surfmexicobucerias@gmail.com',
        E'Robert August What I Ride',
        E'surfboards',
        E'Surf Mexico lists the Robert August What I Ride as a 9 ft high-performance longboard with 70 liters of volume. The official high-performance-board rental rate is 800 MXN for 1 day and 3500 MXN for 1 week.',
        800.00::numeric, NULL::numeric, 3500.00::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        20.7491125, -105.3155175,
        E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
        E'performance longboard', NULL::numeric, true
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
      au.id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM seed_equipment s
    JOIN auth.users au ON au.email = s.seed_email
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = au.id
        AND e.category = s.category
        AND lower(btrim(e.name)) = lower(btrim(s.name))
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'North America coverage surfboard gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
