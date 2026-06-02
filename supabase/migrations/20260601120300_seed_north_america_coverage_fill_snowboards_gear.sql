-- Seed migration: North America coverage fill snowboard gear
-- Batch: north_america_coverage_fill
-- Created: 2026-06-01
-- Depends on: 20260601120000_seed_north_america_coverage_fill_shops.sql
-- Remote status: applied to linked Supabase project on 2026-06-01.
-- Image URLs (snowboards): https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg and https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg

DO $seed_migration$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (VALUES (E'michaelzick+tacticsbend@gmail.com')) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Burton 3D Fish',
        E'snowboards',
        E'Tactics Bend lists the Burton 3D Fish in its official demo snowboard fleet. The official demo board rate is 40 USD per day, with an additional-day board rate of 20 USD.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Burton Family Tree Hometown Hero',
        E'snowboards',
        E'Tactics Bend lists the Burton Family Tree Hometown Hero in its official demo snowboard fleet. It is an all-mountain directional board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'CAPiTA DOA',
        E'snowboards',
        E'Tactics Bend lists the CAPiTA DOA in its official demo snowboard fleet in multiple sizes. It is a freestyle-friendly all-mountain board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain freestyle', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'CAPiTA Mega Mercury',
        E'snowboards',
        E'Tactics Bend lists the CAPiTA Mega Mercury in its official demo snowboard fleet. It is a high-performance all-mountain board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'CAPiTA Mercury',
        E'snowboards',
        E'Tactics Bend lists the CAPiTA Mercury in its official demo snowboard fleet in multiple sizes. It is an all-mountain directional twin available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Jones Frontier',
        E'snowboards',
        E'Tactics Bend lists the Jones Frontier in its official demo snowboard fleet. It is an all-mountain freeride board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Korua Shapes Cafe Racer Classic',
        E'snowboards',
        E'Tactics Bend lists the Korua Shapes Cafe Racer Classic in its official demo snowboard fleet. It is a carving-focused directional board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'carving freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Lib Tech Cold Brew C2',
        E'snowboards',
        E'Tactics Bend lists the Lib Tech Cold Brew C2 in its official demo snowboard fleet. It is a directional all-mountain board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Lib Tech T.Rice Orca C2X HP',
        E'snowboards',
        E'Tactics Bend lists the Lib Tech T.Rice Orca C2X HP in its official demo snowboard fleet. It is a short-wide powder and freeride board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'powder freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+tacticsbend@gmail.com',
        E'Ride Warpig',
        E'snowboards',
        E'Tactics Bend lists the Ride Warpig in its official demo snowboard fleet. It is a volume-shifted all-mountain and powder board available under the 40 USD daily board rate.',
        40.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        44.0593762, -121.3139605,
        E'933 NW Wall St, Bend, OR 97703',
        E'all-mountain powder', NULL::numeric, true
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
    SELECT id, 'https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'North America coverage snowboard gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
