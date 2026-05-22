-- Seed migration: Ventura County surfboard gear
-- Batch: ventura_county_surfboards
-- Created: 2026-05-19
-- Depends on: 20260519213202_seed_ventura_county_surfboards_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/Agentic Harnesses/Hermes/projects/demostoke/migrations/20260519213302_seed_ventura_county_surfboards_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Surfboards primary image:   https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg
-- Surfboards secondary image: https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg

-- =============================================
-- EQUIPMENT: Walden Surfboards (Ventura, CA) - surfboards
-- Email: michaelzick+waldensurfboardsventura@gmail.com
-- Price basis: waldensurfboards.com/pages/surfboard-demo, one-day surfboard demo, retrieved 2026-05-19
-- Coordinates sourced from Nominatim street-level geocode for 853 E Front Street, Ventura, CA 93001.
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
  WHERE email = 'michaelzick+waldensurfboardsventura@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: michaelzick+waldensurfboardsventura@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_equipment_walden_surfboards (
    name text,
    category text,
    description text,
    price_per_day numeric,
    price_per_hour numeric,
    price_per_week numeric,
    size text,
    weight text,
    material text,
    suitable_skill_level text,
    status text,
    location_lat numeric,
    location_lng numeric,
    location_address text,
    subcategory text,
    damage_deposit numeric,
    visible_on_map boolean
  ) ON COMMIT DROP;

  INSERT INTO _seed_equipment_walden_surfboards VALUES
    (
      'Walden Mega Magic Softop',
      'surfboards',
      'The Walden Mega Magic Softop is a friendly soft-top surfboard based on the high-volume Mega Magic platform. It adds forgiving Surftech Softop construction to a stable shape with plenty of float for relaxed beach-day demos. Its Magic Model-inspired hull, rocker, and rails keep the board easy to paddle while preserving a responsive feel.',
      40.00, NULL, NULL,
      NULL,
      NULL, NULL,
      'Beginner, Intermediate',
      'available',
      34.2770938, -119.2876903,
      '853 E. Front Street, Ventura, CA 93001',
      'soft-top', NULL, true
    ),
    (
      'Walden Mini Mega',
      'surfboards',
      'The Walden Mini Mega is a mid-size version of the Mega Magic with a shorter, sportier outline. Its pulled-in nose and extra volume create flotation without losing maneuverability. It fits surfers who want a higher-volume shortboard feel in everyday Ventura waves.',
      40.00, NULL, NULL,
      NULL,
      NULL, NULL,
      'Beginner, Intermediate, Advanced',
      'available',
      34.2770938, -119.2876903,
      '853 E. Front Street, Ventura, CA 93001',
      'mid-length', NULL, true
    ),
    (
      'Walden Mega Magic',
      'surfboards',
      'The Walden Mega Magic is a high-volume compact surfboard built for stability, paddle power, and performance in a shorter shape. It uses the Magic Model design language with a concave bottom, hard rails, and plenty of rocker. The result is a board for surfers who want to go shorter without giving up float.',
      40.00, NULL, NULL,
      NULL,
      NULL, NULL,
      'Beginner, Intermediate, Advanced, Expert',
      'available',
      34.2770938, -119.2876903,
      '853 E. Front Street, Ventura, CA 93001',
      'longboard', NULL, true
    ),
    (
      'Walden Magic Model',
      'surfboards',
      'The Walden Magic Model is the brand''s original modern longboard and an all-around performance noserider. Its single-to-double concave hull, hard rails, and full rocker are designed for speed, stability, and smooth rail-to-rail turns. It is suited to a wide range of wave sizes and skill levels.',
      40.00, NULL, NULL,
      NULL,
      NULL, NULL,
      'Beginner, Intermediate, Advanced, Expert',
      'available',
      34.2770938, -119.2876903,
      '853 E. Front Street, Ventura, CA 93001',
      'longboard', NULL, true
    )
  ;

  WITH inserted AS (
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
    FROM _seed_equipment_walden_surfboards s
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

  RAISE NOTICE 'Walden Surfboards surfboards inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
