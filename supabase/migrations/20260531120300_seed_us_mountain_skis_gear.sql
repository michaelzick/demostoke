-- Seed migration: U.S. Mountain timezone ski gear
-- Batch: us_mountain_winter_sports
-- Created: 2026-05-31
-- Depends on: 20260531120200_seed_us_mountain_winter_sports_shops.sql
-- Remote status: files only; not pushed, applied, or deployed.
-- Image URLs (skis): https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg and https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

DO $$
DECLARE
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  CREATE TEMP TABLE _seed_us_mountain_skis_gear (
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

  INSERT INTO _seed_us_mountain_skis_gear VALUES
    ('michaelzick+villageskishopangelfire@gmail.com', 'Armada ARV 94', $$The Armada ARV 94 is a versatile all-mountain freestyle ski from Village Ski Shop's advanced ski list. It suits skiers who want a playful platform for groomers, soft snow, and side hits at Angel Fire.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain-freestyle'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Armada Declivity 88', $$The Armada Declivity 88 is listed in Village Ski Shop's advanced men's ski inventory and fits skiers who want firm-snow edge hold with all-mountain versatility.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Atomic Bent 100', $$The Atomic Bent 100 appears on Village Ski Shop's advanced ski list for skiers who want a wider all-mountain platform with soft-snow capability and playful handling.$$, 69, 'Intermediate, Advanced, Expert', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'freeride'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Atomic Maverick 83', $$The Atomic Maverick 83 is a narrower all-mountain ski listed by Village Ski Shop for advanced rentals. It is a good fit for carving-focused resort days.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'frontside-all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Blizzard Anomaly 88', $$The Blizzard Anomaly 88 is listed in Village Ski Shop's advanced fleet and works well for stronger skiers looking for stability and edge grip across mixed resort conditions.$$, 69, 'Intermediate, Advanced, Expert', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Rossignol M-Cross 78', $$The Rossignol M-Cross 78 is an advanced rental option from Village Ski Shop for skiers who want a quick, frontside-oriented all-mountain ski.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'frontside'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Salomon QST 98', $$The Salomon QST 98 is listed in Village Ski Shop's advanced ski lineup and gives skiers a freeride-oriented platform for softer snow, bumps, and variable terrain.$$, 69, 'Intermediate, Advanced, Expert', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'freeride'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Blizzard Black Pearl 88', $$The Blizzard Black Pearl 88 is listed on Village Ski Shop's women's advanced ski list and offers approachable all-mountain performance for a broad range of conditions.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Rossignol Rallybird 90', $$The Rossignol Rallybird 90 appears on Village Ski Shop's women's advanced ski list as a playful, all-mountain option for progressing and confident skiers.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain-freeride'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Armada Reliance 88', $$The Armada Reliance 88 is listed in Village Ski Shop's women's advanced inventory and fits skiers looking for composed all-mountain turns on groomers and variable snow.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Atomic Bent 110', $$The Atomic Bent 110 is part of Arizona Snowbowl Agassiz Pro Shop's 2025/2026 demo ski menu. It is a wider, playful freeride ski for soft snow and advanced all-mountain use.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'powder-freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Dynastar M-Pro 94', $$The Dynastar M-Pro 94 is listed in the Agassiz Pro Shop demo menu as a playful freeride ski with enough width for mixed snow and enough hold for groomers.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Elan Playmaker 91', $$The Elan Playmaker 91 is listed in Arizona Snowbowl's demo menu as a nimble freeride twin for skiers who want pop, easy turn initiation, and all-mountain playfulness.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'freeride-twin'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Nordica Unleashed 98', $$The Nordica Unleashed 98 appears on the Agassiz Pro Shop demo menu as a maneuverable freeride ski for powder-oriented profiles and varied resort terrain.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Head Kore 94', $$The Head Kore 94 is listed by Arizona Snowbowl as a redesigned all-mountain ski for skiers who want control on groomers plus smooth handling in deeper snow.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Head Supershape E-Rally', $$The Head Supershape E-Rally is an Agassiz demo ski for frontside skiers who want race-inspired edge grip, easy initiation, and strong power delivery.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'frontside-carver'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Atomic Maverick 88 Ti', $$The Atomic Maverick 88 Ti is listed as a fan-favorite Agassiz demo ski for skiers who want a stiff, stable all-mountain option for groomers, moguls, and powder days.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Faction Prodigy 2', $$The Faction Prodigy 2 is listed in Arizona Snowbowl's demo menu as an all-mountain directional twin with park pedigree and a poppy, versatile feel.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-twin'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Salomon QST 94', $$The Salomon QST 94 is listed in the Agassiz demo menu as an all-mountain freeride ski bridging groomer control and soft-snow versatility.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Atomic Maven 86 C', $$The Atomic Maven 86 C is part of Arizona Snowbowl's demo menu and offers a lighter, responsive all-mountain feel for skiers seeking controlled turns and tip rocker.$$, 30, 'Beginner, Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Arcade 94', $$The Rossignol Arcade 94 is listed on Deer Valley's demo ski rental page as part of the Rossignol demo fleet. It is the widest Arcade option in this rental set for advanced resort versatility.$$, 84, 'Intermediate, Advanced, Expert', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'all-mountain'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Arcade 88', $$The Rossignol Arcade 88 is a Deer Valley demo ski for skiers seeking a stable all-mountain platform with frontside precision and enough width for mixed conditions.$$, 84, 'Intermediate, Advanced', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'all-mountain'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Arcade 84', $$The Rossignol Arcade 84 is listed in Deer Valley's demo ski product details as a narrower all-mountain option for quick resort turns and groomed snow.$$, 84, 'Beginner, Intermediate, Advanced', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'frontside-all-mountain'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Sender Soul 102', $$The Rossignol Sender Soul 102 is part of Deer Valley's public demo ski fleet and fits skiers looking for a freeride-oriented ride with more soft-snow support.$$, 84, 'Intermediate, Advanced, Expert', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'freeride'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Forza 70', $$The Rossignol Forza 70 is listed in Deer Valley's demo ski product details and suits advanced frontside skiers who want strong carving energy.$$, 84, 'Intermediate, Advanced, Expert', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'frontside-carver'),
    ('michaelzick+deervalleyrentalsparkcity@gmail.com', 'Rossignol Forza 60', $$The Rossignol Forza 60 is a Deer Valley Rossignol demo ski for skiers who want a precise, frontside-focused carving option with approachable performance.$$, 84, 'Beginner, Intermediate, Advanced', 40.6374025, -111.4782514, '2250 Deer Valley Drive S, Park City, UT 84060', 'frontside-carver');

  IF EXISTS (
    SELECT 1
    FROM _seed_us_mountain_skis_gear g
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users au WHERE au.email = g.seed_email
    )
  ) THEN
    RAISE EXCEPTION 'Required shop user missing for U.S. Mountain ski gear batch';
  END IF;

  WITH source_rows AS (
    SELECT au.id AS user_id, g.*
    FROM _seed_us_mountain_skis_gear g
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

  RAISE NOTICE 'U.S. Mountain ski gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
