-- Seed migration: U.S. Central timezone ski gear
-- Batch: us_central_winter_sports
-- Created: 2026-05-31
-- Depends on: 20260531120500_seed_us_central_winter_sports_shops.sql
-- Remote status: files only; not pushed, applied, or deployed.
-- Image URLs (skis): https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg and https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

DO $seed_migration$
DECLARE
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  CREATE TEMP TABLE _seed_us_central_skis_gear (
    seed_email text,
    name text,
    description text,
    price_per_day numeric,
    suitable_skill_level text,
    location_lat numeric,
    location_lng numeric,
    location_address text,
    subcategory text
  ) ON COMMIT DROP;

  INSERT INTO _seed_us_central_skis_gear VALUES
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Blizzard Anomaly 84', $$The Blizzard Anomaly 84 is listed in Hi Tempo's 2025 Quiver Performance Demo Skis and fits skiers who want a quick all-mountain ski for firm Midwest snow and travel days.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Blizzard Anomaly 88', $$The Blizzard Anomaly 88 is a Hi Tempo Quiver demo ski for riders who want a balanced all-mountain platform with stronger edge hold and stability.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Blizzard Anomaly 94', $$The Blizzard Anomaly 94 appears in Hi Tempo's performance demo list for skiers who want a wider all-mountain option for softer snow and western trips.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain-freeride'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Elan Ripstick 88', $$The Elan Ripstick 88 is listed by Hi Tempo as a Quiver demo ski and offers a light, agile all-mountain feel for quick turns.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Elan Ripstick 96', $$The Elan Ripstick 96 is part of Hi Tempo's demo inventory for skiers who want a wider, lightweight all-mountain ski with soft-snow capability.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain-freeride'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Elan Wingman 83 Ti', $$The Elan Wingman 83 Ti is listed in Hi Tempo's men's demo fleet and suits skiers who want frontside carving power with all-mountain versatility.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Nordica Enforcer 89', $$The Nordica Enforcer 89 is a Hi Tempo Quiver demo ski for skiers looking for a stable, powerful all-mountain ride.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Nordica Enforcer 99', $$The Nordica Enforcer 99 appears on Hi Tempo's 2025 demo list as a wider all-mountain option for stronger skiers and variable snow.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'freeride'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Rossignol Arcade 84', $$The Rossignol Arcade 84 is listed by Hi Tempo as a Quiver demo ski for quick resort turns and frontside all-mountain use.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Rossignol Arcade 88', $$The Rossignol Arcade 88 is part of Hi Tempo's demo lineup and fits skiers seeking a stable all-mountain ski for mixed resort conditions.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Rossignol Arcade 94', $$The Rossignol Arcade 94 appears in Hi Tempo's performance demo list for skiers who want more width and versatility than a frontside carver.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Rossignol Forza 70', $$The Rossignol Forza 70 is listed in Hi Tempo's demo inventory and suits skiers who want a precise, high-energy carving ski.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-carver'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Salomon Stance Pro 82', $$The Salomon Stance Pro 82 is a Hi Tempo performance demo ski for skiers seeking a narrower, controlled all-mountain ride.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Salomon Stance Pro 90', $$The Salomon Stance Pro 90 appears on Hi Tempo's demo list for skiers who want a wider Stance platform with confident edge hold and variable-snow performance.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Stockli Montero AX', $$The Stockli Montero AX is listed in Hi Tempo's men's demo fleet and is a premium frontside all-mountain ski for precise carving and smooth speed control.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Stockli Stormrider 88', $$The Stockli Stormrider 88 is a Hi Tempo Quiver demo ski for advanced skiers seeking a refined all-mountain ride with stability and edge grip.$$, 75, 'Intermediate, Advanced, Expert', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Blizzard Black Pearl 84', $$The Blizzard Black Pearl 84 is listed in Hi Tempo's women's demo fleet and gives skiers an approachable all-mountain platform for groomers and light variable snow.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Blizzard Black Pearl 88', $$The Blizzard Black Pearl 88 appears in Hi Tempo's women's performance demo inventory and is a versatile all-mountain ski for progressing and confident skiers.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Elan Ripstick 88 W', $$The Elan Ripstick 88 W is listed by Hi Tempo for skiers who want a light, lively women's all-mountain ski with quick handling.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Elan Wildcat 83 Ti', $$The Elan Wildcat 83 Ti is a Hi Tempo women's demo ski for frontside-oriented skiers who still want enough versatility for mixed resort conditions.$$, 75, 'Beginner, Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'frontside-all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Nordica Santa Ana 87', $$The Nordica Santa Ana 87 appears in Hi Tempo's women's demo fleet and offers a stable, versatile all-mountain profile.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain'),
    ('michaelzick+hitempowhitebearlake@gmail.com', 'Stockli Nela 88', $$The Stockli Nela 88 is listed in Hi Tempo's women's demo inventory as a premium all-mountain ski for smooth, confident turns.$$, 75, 'Intermediate, Advanced', 45.0603839, -93.0273197, '3959 Highway 61 N, White Bear Lake, MN 55110', 'all-mountain');

  IF EXISTS (
    SELECT 1
    FROM _seed_us_central_skis_gear g
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users au WHERE au.email = g.seed_email
    )
  ) THEN
    RAISE EXCEPTION 'Required shop user missing for U.S. Central ski gear batch';
  END IF;

  WITH source_rows AS (
    SELECT au.id AS user_id, g.*
    FROM _seed_us_central_skis_gear g
    JOIN auth.users au ON au.email = g.seed_email
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
      gen_random_uuid(), s.user_id, s.name, 'skis', s.description,
      s.price_per_day, NULL, NULL,
      NULL, NULL, NULL, s.suitable_skill_level, 'available',
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      NULL, true
    FROM source_rows s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = s.user_id
        AND e.category = 'skis'
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

  RAISE NOTICE 'U.S. Central ski gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
