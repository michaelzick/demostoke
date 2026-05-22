-- Seed migration: Colorado snowboards gear
-- Batch: colorado_ski_snowboard_mtb
-- Created: 2026-05-19
-- Depends on: 20260519000200_seed_colorado_ski_snowboard_mtb_shops.sql (apply shops first)
-- Remote apply record: see demostoke_seed_batches/colorado_ski_snowboard_mtb/remote_validation_report.md
-- Do NOT use supabase db push or supabase migration up.
-- Image URLs (snowboards): https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg and https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg

-- =============================================
-- EQUIPMENT: Venture Sports Avon (Avon, CO) - Snowboards
-- Email: michaelzick+venturesportsavon@gmail.com
-- Price basis: public demo snowboard rental package walk-in day rate.
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

  CREATE TEMP TABLE _seed_colorado_snowboards_venture (
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

  INSERT INTO _seed_colorado_snowboards_venture VALUES
    ('Never Summer Proto Synthesis', 'snowboards', E'The Never Summer Proto Synthesis is an all-mountain twin snowboard for riders who want energetic edge hold and park-to-groomer versatility. It is a strong demo option for progressing riders who want one board for side hits, carves, and mixed resort laps.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'all-mountain-twin', NULL, true),
    ('Never Summer Women''s Infinity', 'snowboards', E'The Never Summer Women''s Infinity is an all-terrain snowboard for riders who want a proven, confidence-building deck across hardpack, powder, and park terrain. Its mid-flex personality makes it approachable while still giving advanced riders enough response for fast laps.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'all-mountain', NULL, true),
    ('Never Summer Mini Proto Synthesis', 'snowboards', E'The Never Summer Mini Proto Synthesis brings the Proto Synthesis ride style into a youth-friendly board. It is built for younger riders who are ready to move beyond basic rentals and want a real all-mountain freestyle feel.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'youth-all-mountain', NULL, true),
    ('Weston Backwoods', 'snowboards', E'The Weston Backwoods is a powder and freeride snowboard for trees, steeps, and deeper storm days. It gives riders a float-focused shape with enough control for chopped snow and variable resort conditions.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'powder-freeride', NULL, true),
    ('Weston Range', 'snowboards', E'The Weston Range is a directional twin all-mountain snowboard for groomers, cliffs, and side-hit terrain. It is a versatile rental for riders who want familiarity when landing switch plus enough setback for softer Colorado days.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'all-mountain', NULL, true),
    ('Weston Rise', 'snowboards', E'The Weston Rise is an all-mountain splitboard for riders seeking uphill access and steeper backcountry-style lines. It carries a directional twin feel for confident descents while keeping the touring format needed for skin-track travel.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced, Expert', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'splitboard', NULL, true),
    ('Rossignol Retox', 'snowboards', E'The Rossignol Retox is a freestyle snowboard for park, pipe, and urban-inspired riding. It is a good fit for riders who want pop, twin balance, and confidence for jumps and features.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'freestyle', NULL, true),
    ('Rossignol Experience', 'snowboards', E'The Rossignol Experience is an approachable all-mountain snowboard aimed at making turns easier and more intuitive. It suits beginner and intermediate riders looking for a forgiving deck with enough progression room for more confident riding.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'all-mountain', NULL, true),
    ('Rossignol Experience Junior', 'snowboards', E'The Rossignol Experience Junior is a youth freestyle-friendly snowboard for younger riders building control and confidence. It gives developing riders an easier platform for regular descents while leaving room for playful progression.', 85, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate', 'available', 39.6357554, -106.5238712, '100 W Beaver Creek Blvd, Avon, CO 81620', 'youth-all-mountain', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_colorado_snowboards_venture s
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
    FROM _seed_colorado_snowboards_venture s
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
    SELECT i.id, 'https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg', 0, true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg', 1, false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Venture Sports Avon snowboards inserted=%, updated_descriptions=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;
