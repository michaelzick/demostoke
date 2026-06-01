-- Seed migration: U.S. Mountain timezone snowboard gear
-- Batch: us_mountain_winter_sports
-- Created: 2026-05-31
-- Depends on: 20260531120200_seed_us_mountain_winter_sports_shops.sql
-- Remote status: files only; not pushed, applied, or deployed.
-- Image URLs (snowboards): https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg and https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg

DO $seed_migration$
DECLARE
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  CREATE TEMP TABLE _seed_us_mountain_snowboards_gear (
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

  INSERT INTO _seed_us_mountain_snowboards_gear VALUES
    ('michaelzick+villageskishopangelfire@gmail.com', 'Burton Custom', $$The Burton Custom is listed on Village Ski Shop's snowboard inventory page and is a classic all-mountain board for riders who want dependable edge hold and pop across resort terrain.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Burton Process Flying V', $$The Burton Process Flying V is a playful all-mountain freestyle board from Village Ski Shop's public snowboard list, suited to riders who want easy turn initiation and park-friendly flex.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain-freestyle'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Never Summer Proto Synthesis', $$The Never Summer Proto Synthesis is listed by Village Ski Shop as an advanced snowboard option for riders who want an energetic all-mountain twin for carving, freestyle, and mixed terrain.$$, 69, 'Intermediate, Advanced, Expert', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain-twin'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Never Summer Harpoon', $$The Never Summer Harpoon appears on Village Ski Shop's snowboard list and fits riders looking for a directional, surfy ride with strong float and carving capability.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'powder-freeride'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Never Summer Snowtrooper', $$The Never Summer Snowtrooper is listed in Village Ski Shop's men's snowboard inventory and offers an all-mountain profile for riders progressing from groomers into varied terrain.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Never Summer Westbound', $$The Never Summer Westbound is a directional all-mountain board listed by Village Ski Shop for riders who want a confident, freeride-leaning setup for New Mexico resort laps.$$, 69, 'Intermediate, Advanced, Expert', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'freeride'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Rossignol Sushi', $$The Rossignol Sushi is listed on Village Ski Shop's snowboard inventory page and gives riders a short, surfy powder board for soft snow and directional carving.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'powder'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Salomon Assassin', $$The Salomon Assassin is a Village Ski Shop snowboard option for riders who want an all-mountain freestyle board with enough backbone for faster groomer and side-hit laps.$$, 69, 'Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain-freestyle'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Burton Hideaway', $$The Burton Hideaway appears in Village Ski Shop's women's snowboard list and provides an approachable all-mountain ride for beginner and intermediate riders.$$, 69, 'Beginner, Intermediate', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+villageskishopangelfire@gmail.com', 'Never Summer Infinity', $$The Never Summer Infinity is listed in Village Ski Shop's women's snowboard inventory and offers a forgiving but capable all-terrain ride.$$, 69, 'Beginner, Intermediate, Advanced', 36.3876434, -105.2753910, '26 Aspen St, Angel Fire, NM 87710', 'all-mountain'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Lib Tech TRice Pro', $$The Lib Tech TRice Pro is part of Arizona Snowbowl Agassiz Pro Shop's 2025/2026 demo snowboard menu and is listed as a lightweight all-mountain freestyle twin.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-freestyle'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Lib Tech Orca', $$The Lib Tech Orca is listed on Arizona Snowbowl's demo snowboard menu as a directional all-mountain powder board for intermediate to advanced riders.$$, 30, 'Intermediate, Advanced, Expert', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'powder-freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Gnu Gremlin', $$The Gnu Gremlin appears in the Agassiz Pro Shop demo snowboard menu as an all-mountain directional board for riders seeking float, pop, and edge hold.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Nitro T1', $$The Nitro T1 is listed by Arizona Snowbowl as a freestyle snowboard with a twin shape and forgiving, responsive camber profile.$$, 30, 'Beginner, Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'freestyle'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Capita Slush Slasherz', $$The Capita Slush Slasherz is in Arizona Snowbowl's demo menu as a directional powder and spring-slush board with a surfy freeride feel.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'powder'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Capita Indoor Survival', $$The Capita Indoor Survival appears on the Agassiz demo menu as a true twin board for controlled groomer and freestyle riding.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'freestyle'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'United Shapes Horizon', $$The United Shapes Horizon is listed in Arizona Snowbowl's demo menu as a directional all-mountain and freestyle board with traditional camber and early-rise nose.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-freestyle'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Rossignol Sushi', $$The Rossignol Sushi is listed in Arizona Snowbowl's Agassiz demo menu as a surfy powder board with a smooth, versatile ride.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'powder'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Salomon Dance Haul', $$The Salomon Dance Haul appears in the Agassiz Pro Shop demo list as a tapered directional board with a wide platform for float and pop.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-freeride'),
    ('michaelzick+arizonasnowbowlagassiz@gmail.com', 'Never Summer V Twin', $$The Never Summer V Twin is listed by Arizona Snowbowl as an energetic twin-shaped board with a hybrid triple camber profile for capable all-mountain riding.$$, 30, 'Intermediate, Advanced', 35.3303900, -111.7106600, '9300 N Snowbowl Rd, Flagstaff, AZ 86002', 'all-mountain-twin');

  IF EXISTS (
    SELECT 1
    FROM _seed_us_mountain_snowboards_gear g
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users au WHERE au.email = g.seed_email
    )
  ) THEN
    RAISE EXCEPTION 'Required shop user missing for U.S. Mountain snowboard gear batch';
  END IF;

  WITH source_rows AS (
    SELECT au.id AS user_id, g.*
    FROM _seed_us_mountain_snowboards_gear g
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
      gen_random_uuid(), s.user_id, s.name, 'snowboards', s.description,
      s.price_per_day, NULL, NULL,
      NULL, NULL, NULL, s.suitable_skill_level, 'available',
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      NULL, true
    FROM source_rows s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = s.user_id
        AND e.category = 'snowboards'
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

  RAISE NOTICE 'U.S. Mountain snowboard gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
