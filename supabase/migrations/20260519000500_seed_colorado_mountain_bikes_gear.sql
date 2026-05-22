-- Seed migration: Colorado mountain bikes gear
-- Batch: colorado_ski_snowboard_mtb
-- Created: 2026-05-19
-- Depends on: 20260519000200_seed_colorado_ski_snowboard_mtb_shops.sql (apply shops first)
-- Remote apply record: see demostoke_seed_batches/colorado_ski_snowboard_mtb/remote_validation_report.md
-- Do NOT use supabase db push or supabase migration up.
-- Image URLs (mountain-bikes): https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg and https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Venture Sports Avon (Avon, CO) - Mountain bikes
-- Email: michaelzick+venturesportsavon@gmail.com
-- Price basis: public mountain-bike rental page listing demo carbon, demo alloy, and trail day rates with featured models.
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

  CREATE TEMP TABLE _seed_colorado_mtb_venture (
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

  INSERT INTO _seed_colorado_mtb_venture VALUES
    ('Yeti SB140', 'mountain-bikes', E'The Yeti SB140 is a premium trail demo bike for riders who want a responsive full-suspension platform across flowing singletrack and rougher Colorado descents. It is a strong fit for riders seeking a lively bike that still feels composed when trails get technical.', 135, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Yeti SB120', 'mountain-bikes', E'The Yeti SB120 is a shorter-travel trail demo bike for efficient climbs, fast rolling terrain, and technical singletrack. It suits riders who want Yeti handling in a lighter-feeling platform without giving up confidence on descents.', 135, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Yeti SB135', 'mountain-bikes', E'The Yeti SB135 is a playful trail demo bike built for riders who like quick handling, side hits, and varied terrain. It is suited to Avon and Vail Valley riders looking for a premium full-suspension bike that stays lively on climbs and descents.', 135, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Yeti SB150', 'mountain-bikes', E'The Yeti SB150 is a long-travel demo bike for aggressive trail riding, lift-served laps, and fast technical descents. It gives advanced riders a composed platform for steeper terrain while remaining pedalable for bigger mountain rides.', 135, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Yeti SB160', 'mountain-bikes', E'The Yeti SB160 is a premium long-travel mountain bike for riders prioritizing descending confidence and control on demanding singletrack. It is a capable choice for technical Colorado trails and bike-park style days around the Vail Valley.', 135, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Giant Reign', 'mountain-bikes', E'The Giant Reign is a full-suspension enduro bike for riders focused on aggressive descents, park laps, and rugged trail rides. Its alloy demo tier makes it a practical option for riders who want long-travel performance at a lower day rate than the premium carbon fleet.', 90, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true),
    ('Giant Trance', 'mountain-bikes', E'The Giant Trance is a trail-oriented full-suspension rental bike for singletrack, rolling terrain, and everyday off-road rides. It is a versatile choice for riders who want an approachable bike with active suspension and confident handling.', 80, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'full-suspension', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_colorado_mtb_venture s
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
    FROM _seed_colorado_mtb_venture s
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
    SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Venture Sports Avon mountain bikes inserted=%, updated_descriptions=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;

-- =============================================
-- EQUIPMENT: Cripple Creek Bike and Backcountry Aspen (Aspen, CO) - Mountain bikes
-- Email: michaelzick+cripplecreekbikebackcountryaspen@gmail.com
-- Price basis: public Aspen bike rental model page plus premium full-suspension 24-hour rental rate.
-- NOTE: Coordinates sourced from Nominatim street-level geocode for 400 E Hopkins Ave, Aspen, CO.
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
  WHERE email = 'michaelzick+cripplecreekbikebackcountryaspen@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %', 'michaelzick+cripplecreekbikebackcountryaspen@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_colorado_mtb_cripple_creek_aspen (
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

  INSERT INTO _seed_colorado_mtb_cripple_creek_aspen VALUES
    ('Pivot Trailcat LT', 'mountain-bikes', E'The Pivot Trailcat LT is a premium full-suspension trail bike for Aspen singletrack, technical climbs, and confident descending. It is a capable rental for riders who want one mountain bike for Hunter Creek, Government Trail, and Snowmass-style terrain.', 150, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.1902641, -106.8204409, '400 E Hopkins Ave, Aspen, CO 81611', 'full-suspension', NULL, true),
    ('Specialized Levo', 'mountain-bikes', E'The Specialized Levo is a premium e-mountain bike for riders who want more range, climbing support, and trail time around Aspen. It is suited to mixed-ability groups and longer mountain bike rides where pedal assist helps cover more terrain.', 150, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.1902641, -106.8204409, '400 E Hopkins Ave, Aspen, CO 81611', 'e-mountain-bike', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_colorado_mtb_cripple_creek_aspen s
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
    FROM _seed_colorado_mtb_cripple_creek_aspen s
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
    SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Cripple Creek Bike and Backcountry Aspen mountain bikes inserted=%, updated_descriptions=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;
