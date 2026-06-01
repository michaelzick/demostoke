-- Seed migration: Eastern Time Zone mountain-bike gear
-- Batch: eastern_time_zone_all_categories
-- Created: 2026-05-30
-- Depends on: 20260530120000_seed_eastern_time_zone_all_categories_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120400_seed_eastern_time_zone_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Mountain-bikes primary image:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
-- Mountain-bikes secondary image: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Eastern Time Zone bike parks - mountain-bikes
-- Price basis: official bike-rental pages for Highland Mountain Bike Park, Thunder Mountain Bike Park, and Ride Kanuga, retrieved 2026-05-30.
-- Coordinates sourced from US Census Geocoder street-address/range matches.
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
      (E'michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
      (E'michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
      (E'michaelzick+ridekanugahendersonville@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Santa Cruz V10',
        E'mountain-bikes',
        E'The Santa Cruz V10 is Highland Mountain Bike Park''s premium downhill rental. It is a lift-access race bike for steep park laps, rough braking bumps, and riders who want maximum stability at speed.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Specialized Status 2 170 DH',
        E'mountain-bikes',
        E'The Specialized Status 2 170 DH is Highland''s full-day downhill rental for bike-park terrain. It gives riders a gravity-focused platform with long travel and confident handling for chairlift laps.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Santa Cruz Bronson',
        E'mountain-bikes',
        E'The Santa Cruz Bronson is one of Highland''s premium enduro all-mountain rentals. It is built for riders who want a playful bike that still has enough travel for technical descents and park features.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Santa Cruz Megatower',
        E'mountain-bikes',
        E'The Santa Cruz Megatower is a premium Highland enduro rental for high-speed descents and rough trails. It suits riders who want a composed all-mountain bike with enough travel for aggressive park days.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Santa Cruz Nomad',
        E'mountain-bikes',
        E'The Santa Cruz Nomad is a premium Highland all-mountain rental with a freeride-friendly feel. It is a strong fit for riders mixing jump lines, chunky descents, and technical park laps.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Giant Reign',
        E'mountain-bikes',
        E'The Giant Reign is a Highland enduro all-mountain rental for riders who want dependable suspension travel without moving into the premium tier. It works well for bike-park laps, rough descents, and mixed terrain.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Norco Fluid',
        E'mountain-bikes',
        E'The Norco Fluid is part of Highland''s youth rental lineup. It gives younger riders a real trail-bike platform for learning bike-park skills with an appropriately sized full-suspension setup.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'youth trail', NULL::numeric, true
      ),
      (
        E'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
        E'Norco Sight',
        E'mountain-bikes',
        E'The Norco Sight is part of Highland''s youth and smaller-rider rental options. It offers trail-bike capability for progressing riders who need a smaller park-ready setup.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        43.4071495, -71.5548452,
        E'75 Ski Hill Drive, Northfield, NH 03276',
        E'youth trail', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Scott Gambler 920',
        E'mountain-bikes',
        E'The Scott Gambler 920 is Thunder Mountain Bike Park''s downhill rental option for gravity laps. It is a full-on park bike for riders who want a stable platform on lift-served descents.',
        145.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Santa Cruz V10 29',
        E'mountain-bikes',
        E'The Santa Cruz V10 29 is one of Thunder Mountain''s premium downhill rentals. It is built for fast lift-access terrain and riders who want a race-proven platform with big-wheel speed.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Transition TR11',
        E'mountain-bikes',
        E'The Transition TR11 is a Thunder Mountain premium downhill rental for bike-park terrain. It is a purpose-built gravity bike for riders who want a playful but capable setup on rough descents and jump lines.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Yeti SB160',
        E'mountain-bikes',
        E'The Yeti SB160 is part of Thunder Mountain''s premium enduro demo fleet. It suits riders who want a pedal-capable enduro bike that still feels composed on steep park trails.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Yeti SB165',
        E'mountain-bikes',
        E'The Yeti SB165 is part of Thunder Mountain''s premium enduro demo fleet. It gives aggressive riders a long-travel platform for steep, rough, and jump-heavy bike-park days.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Transition Patrol',
        E'mountain-bikes',
        E'The Transition Patrol is a Thunder Mountain premium enduro rental. It is a freeride-leaning all-mountain bike for riders who want stability on chunky descents with enough pop for park features.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Rocky Mountain Instinct',
        E'mountain-bikes',
        E'The Rocky Mountain Instinct is Thunder Mountain''s trail rental option for smaller riders. It gives riders a full-suspension platform for smoother park trails, progression laps, and all-mountain control.',
        110.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
        E'Rocky Mountain Reaper',
        E'mountain-bikes',
        E'The Rocky Mountain Reaper is Thunder Mountain''s youth rental bike for junior riders. It gives younger riders real suspension and trail geometry for bike-park progression.',
        105.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        42.6225361, -72.8782811,
        E'66 Thunder Mountain Road, Charlemont, MA 01339',
        E'youth trail', NULL::numeric, true
      ),
      (
        E'michaelzick+ridekanugahendersonville@gmail.com',
        E'Specialized Turbo Levo Gen 4 Premium',
        E'mountain-bikes',
        E'The Specialized Turbo Levo Gen 4 Premium is Ride Kanuga''s top e-bike rental. It gives riders pedal-assist range and modern trail capability for a full day on Kanuga''s climbing and descending network.',
        149.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        35.2676542, -82.5140571,
        E'1249 Kanuga Lake Road, Hendersonville, NC 28739',
        E'e-mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+ridekanugahendersonville@gmail.com',
        E'Specialized Turbo Levo',
        E'mountain-bikes',
        E'The Specialized Turbo Levo is Ride Kanuga''s standard e-bike rental for full-day trail access. It is a pedal-assist mountain bike for riders who want extra range on the climb before descending Kanuga''s gravity trails.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        E'XS',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        35.2676542, -82.5140571,
        E'1249 Kanuga Lake Road, Hendersonville, NC 28739',
        E'e-mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+ridekanugahendersonville@gmail.com',
        E'Specialized Turbo Levo SL Kids',
        E'mountain-bikes',
        E'The Specialized Turbo Levo SL Kids is Ride Kanuga''s youth e-bike rental. It gives younger riders pedal-assist support for the climb and a lighter trail platform for full-day park sessions.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        35.2676542, -82.5140571,
        E'1249 Kanuga Lake Road, Hendersonville, NC 28739',
        E'youth e-mountain bike', NULL::numeric, true
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

  RAISE NOTICE 'Eastern Time Zone mountain bikes inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
