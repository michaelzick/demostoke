-- Seed migration: North America coverage fill ski gear
-- Batch: north_america_coverage_fill
-- Created: 2026-06-01
-- Depends on: 20260601120000_seed_north_america_coverage_fill_shops.sql
-- Remote status: applied to linked Supabase project on 2026-06-01.
-- Image URLs (skis): https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg and https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

DO $seed_migration$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (VALUES (E'michaelzick+willissevensprings@gmail.com')) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Atomic Maverick 96 CTI',
        E'skis',
        E'Willi''s Seven Springs lists the Atomic Maverick 96 CTI in its official demo fleet. The demo program price is 75 USD for up to 5 hours on the mountain, represented here as the day price.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Atomic Maverick 88 CTI',
        E'skis',
        E'Willi''s Seven Springs lists the Atomic Maverick 88 CTI in its official demo fleet. It is a frontside-friendly all-mountain ski with the 75 USD demo program price.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Blizzard Black Pearl 84',
        E'skis',
        E'Willi''s Seven Springs lists the Blizzard Black Pearl 84 in its official demo ski fleet. It is a narrower all-mountain option for approachable East Coast carving and mixed conditions.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Blizzard Anomaly 88',
        E'skis',
        E'Willi''s Seven Springs lists the Blizzard Anomaly 88 in its official demo fleet. It is a strong all-mountain ski for confident resort skiers testing edge hold and variable-snow stability.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Elan Ripstick 96 Black Edition',
        E'skis',
        E'Willi''s Seven Springs lists the Elan Ripstick 96 Black Edition in its official demo fleet. It gives stronger skiers a wider all-mountain platform for soft snow and mixed resort terrain.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Head Supershape e-Rally',
        E'skis',
        E'Willi''s Seven Springs lists the Head Supershape e-Rally in its official demo fleet. It is a frontside carving ski for advanced skiers who want strong edge grip on groomers.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'frontside carver', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Nordica Enforcer 94',
        E'skis',
        E'Willi''s Seven Springs lists the Nordica Enforcer 94 in its official demo fleet. It is an all-mountain ski for advanced riders who want damp stability and edge confidence.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Rossignol Arcade 88',
        E'skis',
        E'Willi''s Seven Springs lists the Rossignol Arcade 88 in its official demo fleet. It is an all-mountain resort ski for skiers who want frontside energy with wider-mountain versatility.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Stockli Montero AR',
        E'skis',
        E'Willi''s Seven Springs lists the Stockli Montero AR in its official demo fleet. It is a premium all-mountain carving ski for advanced skiers who want precision and energy.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
        E'all-mountain carver', NULL::numeric, true
      ),
      (
        E'michaelzick+willissevensprings@gmail.com',
        E'Stockli Nela 88',
        E'skis',
        E'Willi''s Seven Springs lists the Stockli Nela 88 in its official demo fleet. It is a premium all-mountain ski for skiers seeking a lighter, precise ride across groomers and variable snow.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        40.0222800, -79.2962300,
        E'777 Water Wheel Dr, Champion, PA 15622',
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
    SELECT id, 'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'North America coverage ski gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
