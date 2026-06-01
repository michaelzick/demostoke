-- Seed migration: Eastern Time Zone surfboard gear
-- Batch: eastern_time_zone_all_categories
-- Created: 2026-05-30
-- Depends on: 20260530120000_seed_eastern_time_zone_all_categories_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120100_seed_eastern_time_zone_surfboards_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Surfboards primary image:   https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg
-- Surfboards secondary image: https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg

-- =============================================
-- EQUIPMENT: Eastern Time Zone surf shops - surfboards
-- Price basis: official Firewire Fleets / surfboard demo rental pages, retrieved 2026-05-30.
-- Coordinates sourced from OpenStreetMap/Nominatim for REAL Watersports and US Census Geocoder street-address/range matches for Warm Winds and Cinnamon Rainbows.
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
      (E'michaelzick+realwatersportswaves@gmail.com'),
      (E'michaelzick+warmwindssurfshopnarragansett@gmail.com'),
      (E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+realwatersportswaves@gmail.com',
        E'Firewire Seaside',
        E'surfboards',
        E'The Firewire Seaside is a fast quad-fish shape for small to medium Outer Banks surf. REAL Watersports lists a broad Seaside size range in its Firewire Fleets quiver, making it a strong travel-board choice for everyday beach-break sessions.',
        50.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        35.5659701, -75.4693984,
        E'25706 North Carolina Hwy 12, Waves, NC 27982',
        E'fish', NULL::numeric, true
      ),
      (
        E'michaelzick+realwatersportswaves@gmail.com',
        E'Firewire Groove',
        E'surfboards',
        E'The Firewire Groove is a punchy-wave shortboard in REAL Watersports'' Firewire Fleets quiver. It is set up for beach-break speed and control, with thruster baseline handling and quad-fin flexibility for hollower days.',
        50.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        35.5659701, -75.4693984,
        E'25706 North Carolina Hwy 12, Waves, NC 27982',
        E'performance shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+realwatersportswaves@gmail.com',
        E'Firewire TJ Twinzer',
        E'surfboards',
        E'The Firewire TJ Twinzer is a performance mid-length demo board in REAL Watersports'' Firewire Fleets lineup. It blends early glide with a twinzer feel that can trim easily or turn hard on Outer Banks walls.',
        50.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        35.5659701, -75.4693984,
        E'25706 North Carolina Hwy 12, Waves, NC 27982',
        E'mid-length', NULL::numeric, true
      ),
      (
        E'michaelzick+realwatersportswaves@gmail.com',
        E'Firewire Sunday',
        E'surfboards',
        E'The Firewire Sunday is a fast twin-fin mid-length in REAL Watersports'' Firewire Fleets quiver. REAL lists it as a proven small-to-medium surf option with enough volume and flow to suit a wide range of ability levels.',
        50.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        35.5659701, -75.4693984,
        E'25706 North Carolina Hwy 12, Waves, NC 27982',
        E'mid-length', NULL::numeric, true
      ),
      (
        E'michaelzick+realwatersportswaves@gmail.com',
        E'Firewire The Gem',
        E'surfboards',
        E'The Firewire The Gem is Dan Mann''s all-around longboard shape in REAL Watersports'' Firewire Fleets program. It is built for trimming, gliding, hard turns off the tail, and softer Outer Banks days when extra paddle power helps.',
        50.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        35.5659701, -75.4693984,
        E'25706 North Carolina Hwy 12, Waves, NC 27982',
        E'longboard', NULL::numeric, true
      ),
      (
        E'michaelzick+warmwindssurfshopnarragansett@gmail.com',
        E'Firewire Seaside',
        E'surfboards',
        E'The Firewire Seaside is part of Warm Winds Surf Shop''s premium Firewire Fleets rental stock. It is a speed-focused small-wave board that works well for New England summer surf and playful points.',
        60.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        41.4308365, -71.4587796,
        E'26 Kingstown Road, Narragansett, RI 02882',
        E'fish', NULL::numeric, true
      ),
      (
        E'michaelzick+warmwindssurfshopnarragansett@gmail.com',
        E'Firewire Sweet Potato',
        E'surfboards',
        E'The Firewire Sweet Potato is a high-volume groveler in Warm Winds Surf Shop''s premium rental fleet. Its wide outline and easy speed make it a useful choice for softer Narragansett conditions.',
        60.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        41.4308365, -71.4587796,
        E'26 Kingstown Road, Narragansett, RI 02882',
        E'groveler', NULL::numeric, true
      ),
      (
        E'michaelzick+warmwindssurfshopnarragansett@gmail.com',
        E'Firewire Dominator 2',
        E'surfboards',
        E'The Firewire Dominator 2 is a versatile all-around shortboard in Warm Winds Surf Shop''s Firewire Fleets stock. It gives progressing and experienced surfers a dependable board for mixed New England beach-break conditions.',
        60.00::numeric, NULL::numeric, 200.00::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        41.4308365, -71.4587796,
        E'26 Kingstown Road, Narragansett, RI 02882',
        E'all-around shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Firewire Sweet Potato',
        E'surfboards',
        E'The Firewire Sweet Potato is a high-end Cinnamon Rainbows demo board for weak or playful surf. The compact, wide groveler shape helps surfers keep speed when the New Hampshire beach break is soft.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'groveler', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Firewire Mashup',
        E'surfboards',
        E'The Firewire Mashup is a Cinnamon Rainbows demo board that blends Rob Machado and Dan Mann small-wave design ideas. It carries Seaside-inspired speed with added vertical performance for better sections.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'groveler', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Firewire S Boss',
        E'surfboards',
        E'The Firewire S Boss is a Cinnamon Rainbows high-end demo board for accessible performance surfing. Its forgiving outline and hidden volume make it a strong option for average-to-advanced surfers in varied Northeast surf.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'performance shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Firewire Seaside',
        E'surfboards',
        E'The Firewire Seaside is one of Cinnamon Rainbows'' high-end rental and demo boards. Its quad-fish speed and easy flow make it a useful demo choice for small to medium New Hampshire surf.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'fish', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Channel Islands G-Skate',
        E'surfboards',
        E'The Channel Islands G-Skate is a Cinnamon Rainbows high-end demo board for surfers who want skateboard-like speed and release. It fits smaller, bowly beach-break days while still giving stronger surfers room to push turns.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'performance shortboard', NULL::numeric, true
      ),
      (
        E'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
        E'Pyzel White Tiger',
        E'surfboards',
        E'The Pyzel White Tiger is a Cinnamon Rainbows demo board for everyday surf with enough foam to cover weaker sessions. It gives intermediate and advanced riders a lively board that still paddles well.',
        50.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        42.9968316, -70.8158301,
        E'62 Lafayette Road, North Hampton, NH 03862',
        E'all-around shortboard', NULL::numeric, true
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
      'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg',
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

  RAISE NOTICE 'Eastern Time Zone surfboards inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
