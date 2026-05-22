-- Seed migration: Colorado skis gear
-- Batch: colorado_ski_snowboard_mtb
-- Created: 2026-05-19
-- Depends on: 20260519000200_seed_colorado_ski_snowboard_mtb_shops.sql (apply shops first)
-- Remote apply record: see demostoke_seed_batches/colorado_ski_snowboard_mtb/remote_validation_report.md
-- Do NOT use supabase db push or supabase migration up.
-- Image URLs (skis): https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg and https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

-- =============================================
-- EQUIPMENT: Venture Sports Avon (Avon, CO) - Skis
-- Email: michaelzick+venturesportsavon@gmail.com
-- Price basis: public demo ski rental package walk-in day rate.
-- NOTE: Coordinates sourced from Nominatim street-level geocode for 100 W Beaver Creek Blvd, Avon, CO.
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  v_updated int := 0;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+venturesportsavon@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %', 'michaelzick+venturesportsavon@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_colorado_skis_venture (
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

  INSERT INTO _seed_colorado_skis_venture VALUES
    ('Armada ARV 100', 'skis', E'The Armada ARV 100 is a freestyle-oriented all-mountain ski suited to park laps, soft snow, and playful resort days. It gives confident riders a wider platform than a narrow frontside ski while keeping a lively feel for side hits and variable conditions.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'freestyle-all-mountain', NULL, true),
    ('Armada ARV 94', 'skis', E'The Armada ARV 94 is an all-mountain park ski for riders who want one ski for groomers, jumps, rails, and light soft-snow days. Its versatile waist and freestyle personality make it a practical demo choice for skiers moving between playful laps and everyday resort terrain.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'freestyle-all-mountain', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_colorado_skis_venture s
  WHERE e.user_id = v_user_id
    AND e.name = s.name
    AND e.description IS DISTINCT FROM s.description;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  WITH inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(), v_user_id, s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM _seed_colorado_skis_venture s
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
    SELECT i.id, 'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg', 0, true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg', 1, false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Venture Sports Avon skis inserted=%, updated_descriptions=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;

-- =============================================
-- EQUIPMENT: Bentgate Mountaineering (Golden, CO) - Skis
-- Email: michaelzick+bentgatemountaineeringgolden@gmail.com
-- Price basis: public 24-hour downhill ski demo and alpine touring ski rental rates.
-- NOTE: Coordinates sourced from Nominatim street-level geocode for 1313 Washington Ave, Golden, CO.
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  v_updated int := 0;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+bentgatemountaineeringgolden@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %', 'michaelzick+bentgatemountaineeringgolden@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_colorado_skis_bentgate (
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

  INSERT INTO _seed_colorado_skis_bentgate VALUES
    ('Black Crows Atris', 'skis', E'The Black Crows Atris is a freeride-oriented downhill demo ski for soft snow, bowls, and mixed resort conditions. It suits skiers who want a composed platform that still feels agile when the day moves from powder to tracked-out snow.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'freeride', NULL, true),
    ('Atomic Bent 100', 'skis', E'The Atomic Bent 100 is a playful all-mountain freeride ski for skiers who want soft-snow confidence without giving up daily resort versatility. It is a good match for riders mixing trees, bowls, bumps, and groomer returns in the same day.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'freeride', NULL, true),
    ('Moment Countach 104', 'skis', E'The Moment Countach 104 is a directional all-mountain ski built for strong resort skiing and variable Colorado snow. It favors confident skiers who want edge support, stability, and enough width for days that are not strictly groomer-focused.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'all-mountain', NULL, true),
    ('Moment Deathwish 104', 'skis', E'The Moment Deathwish 104 is an all-mountain demo ski for playful skiers who like to move between soft snow, chop, and technical resort terrain. Its balanced feel makes it useful for riders who want a lively ski with enough backbone for faster lines.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'all-mountain', NULL, true),
    ('Icelantic Riveter 95', 'skis', E'The Icelantic Riveter 95 is a women-focused all-mountain demo ski for frontside laps, softer snow, and everyday resort exploration. It gives progressing and advanced skiers a confident platform for mixed conditions without stepping into a powder-only shape.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'all-mountain', NULL, true),
    ('Blizzard Rustler 10', 'skis', E'The Blizzard Rustler 10 is a freeride-minded all-mountain ski for skiers who want stability at speed with enough looseness for soft-snow turns. It is well-suited to advanced resort days where bowls, trees, and groomed exits all show up on the route.', 60, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'freeride', NULL, true),
    ('Moment Deathwish Tour 104', 'skis', E'The Moment Deathwish Tour 104 is an alpine touring ski for backcountry riders who want soft-snow capability with a lighter uphill-oriented setup. It is intended for skiers balancing climb efficiency with confidence on variable descents.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('Icelantic Maiden 94', 'skis', E'The Icelantic Maiden 94 is an alpine touring ski for riders who want a manageable platform for Colorado backcountry routes and resort uphill days. It pairs an approachable width with enough versatility for changing snow and mixed terrain.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('K2 Mindbender 106C', 'skis', E'The K2 Mindbender 106C is a touring-capable ski for soft-snow missions and bigger mountain days. It gives intermediate and advanced skiers a wider, confident platform for backcountry turns while staying practical for skin-track travel.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('Dynafit Ridge 95', 'skis', E'The Dynafit Ridge 95 is an alpine touring ski for efficient uphill travel and controlled backcountry descents. It is a practical choice for skiers who want a dedicated touring setup for Colorado passes, hut approaches, and fitness laps.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('Dynafit Tigard 107', 'skis', E'The Dynafit Tigard 107 is a wider touring ski for backcountry skiers prioritizing soft-snow float and downhill confidence. It fits riders who want to cover real terrain without giving up the composed feel expected from a premium touring rental.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('K2 Wayback 106', 'skis', E'The K2 Wayback 106 is an alpine touring ski for long approaches, soft-snow descents, and mixed backcountry objectives. It gives touring skiers a wider shape for variable snow while keeping the focus on uphill movement.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('Moment Wildcat 101', 'skis', E'The Moment Wildcat 101 is a playful touring ski for riders who want an energetic feel in soft snow, trees, and open backcountry terrain. It is suited to skiers who like a more freestyle-friendly ride without losing everyday touring usefulness.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('Salomon MTN 96', 'skis', E'The Salomon MTN 96 is an alpine touring ski for balanced uphill travel and predictable descents. Its moderate width makes it a sensible rental for skiers heading to Colorado backcountry zones with mixed snow and varied terrain.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true),
    ('K2 Women''s Wayback 98', 'skis', E'The K2 Women''s Wayback 98 is a women-specific alpine touring ski for backcountry days where climb efficiency and downhill composure both matter. It is a versatile rental for riders moving from resort uphill laps into broader Colorado touring objectives.', 75, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.7543014, -105.2198490, '1313 Washington Ave, Golden, CO 80401', 'touring', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_colorado_skis_bentgate s
  WHERE e.user_id = v_user_id
    AND e.name = s.name
    AND e.description IS DISTINCT FROM s.description;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  WITH inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(), v_user_id, s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM _seed_colorado_skis_bentgate s
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
    SELECT i.id, 'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg', 0, true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg', 1, false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Bentgate Mountaineering skis inserted=%, updated_descriptions=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;
