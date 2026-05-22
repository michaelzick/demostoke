-- Seed migration: Texas mountain-bike gear
-- Batch: texas_surfboards_mountain_bikes
-- Created: 2026-05-20
-- Depends on: 20260520232000_seed_texas_surfboards_mountain_bikes_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/Agentic Harnesses/Hermes/projects/demostoke/migrations/20260520232100_seed_texas_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Mountain-bikes primary image:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
-- Mountain-bikes secondary image: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Spider Mountain Bike Park (Burnet, TX) - mountain-bikes
-- Email: michaelzick+spidermountainbikeparkburnet@gmail.com
-- Price basis: Spider Mountain official rentals page, adult full-day walk-up bike rental, retrieved 2026-05-20.
-- Coordinates sourced from Nominatim street-level geocode for 200 Greenwood Hills Trail, Burnet, TX 78611.
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
  WHERE email = 'michaelzick+spidermountainbikeparkburnet@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: michaelzick+spidermountainbikeparkburnet@gmail.com';
  END IF;

  WITH seed_equipment (
    name,
    category,
    description,
    price_per_day,
    price_per_hour,
    price_per_week,
    size,
    weight,
    material,
    suitable_skill_level,
    status,
    location_lat,
    location_lng,
    location_address,
    subcategory,
    damage_deposit,
    visible_on_map
  ) AS (
    VALUES
      (
        'Transition Spire Alloy GX Build',
        'mountain-bikes',
        'The Transition Spire Alloy GX Build is a full-suspension adult rental for lift-served bike-park laps. Its park-ready stance suits riders looking for a composed platform on Spider Mountain descents. It is a good fit for confident riders moving from blue trails into rougher downhill terrain.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'enduro', NULL::numeric, true
      ),
      (
        'Trek Slash 8',
        'mountain-bikes',
        'The Trek Slash 8 is a full-suspension adult mountain-bike rental aimed at aggressive trail and bike-park riding. It gives Spider Mountain riders a confident option for repeated lift-served descents. The model is best matched to riders who want stability for steeper and more technical lines.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'enduro', NULL::numeric, true
      ),
      (
        'Devinci Spartan',
        'mountain-bikes',
        'The Devinci Spartan is an adult full-suspension rental for downhill-focused park days. It is positioned for riders who want a planted bike on faster descents and rougher trail surfaces. The Spider Mountain setting makes it useful for progressing from controlled flow trails into bigger features.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'enduro', NULL::numeric, true
      ),
      (
        'Devinci Troy',
        'mountain-bikes',
        'The Devinci Troy is a full-suspension adult rental with a versatile trail-bike personality. It gives riders a balanced option for flow trails, rolling terrain, and moderate technical sections. It fits intermediate riders who want one bike for a broad range of Spider Mountain laps.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'full-suspension', NULL::numeric, true
      ),
      (
        'Rocky Mountain Altitude',
        'mountain-bikes',
        'The Rocky Mountain Altitude is an adult full-suspension rental for gravity-oriented mountain-bike terrain. It is suited to riders who want a stable bike for lift-served downhill days and repeated park laps. Its role in the fleet supports advanced progression on Spider Mountain trails.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'enduro', NULL::numeric, true
      ),
      (
        'Rocky Mountain Instinct',
        'mountain-bikes',
        'The Rocky Mountain Instinct is a full-suspension adult rental with a trail-focused ride character. It gives riders a dependable platform for mixed bike-park laps where flow, control, and comfort all matter. It is a practical fit for intermediate and advanced riders at Spider Mountain.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        30.8393020, -98.3399680,
        '200 Greenwood Hills Trail, Burnet, TX 78611',
        'full-suspension', NULL::numeric, true
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
      v_user_id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM seed_equipment s
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

  RAISE NOTICE 'Spider Mountain Bike Park mountain-bikes inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
