-- Seed migration: Oregon Mountain Bikes gear
-- Batch: oregon_mountain_bikes
-- Created: 2026-05-15
-- Depends on: 20260515180000_seed_oregon_mountain_bikes_shops.sql
-- Gear basis: Cog Wild official rental pages, Sunnyside Sports official rental page, and Sunnyside public rental widget (retrieved 2026-05-15).
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/workspace/projects/demostoke/migrations/20260515180100_seed_oregon_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
-- Image URLs (mountain-bikes): https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg and https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Cog Wild Bend — Mountain bikes
-- Email: michaelzick+cogwildbend@gmail.com
-- Price basis: public 24-hour/day rental rates from official rental sources.
-- =============================================
DO $$
DECLARE
  v_user_id uuid; v_updated int := 0; v_equipment_inserted int := 0; v_primary_images_added int := 0; v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'michaelzick+cogwildbend@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found: michaelzick+cogwildbend@gmail.com'; END IF;

  CREATE TEMP TABLE _seed_oregon_bikes_cw_bend (name text, category text, description text, price_per_day numeric, price_per_hour numeric, price_per_week numeric, size text, weight text, material text, suitable_skill_level text, status text, location_lat numeric, location_lng numeric, location_address text, subcategory text, damage_deposit numeric, visible_on_map boolean) ON COMMIT DROP;
  TRUNCATE _seed_oregon_bikes_cw_bend;
  INSERT INTO _seed_oregon_bikes_cw_bend VALUES
  ('Santa Cruz Vala', 'mountain-bikes', E'The Santa Cruz Vala is the perfect all-mountain bike that combines comfort from dual suspension with the lightness of a carbon fiber frame. It is a versatile pick for riders balancing descents with fast, smooth climbs across mixed terrain.', 130, NULL, NULL, 'Small, Medium, Large, XL', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0426911, -121.3151335, '115 SW Columbia Street, Bend, OR 97702', 'e-mountain-bike', NULL, true),
  ('Santa Cruz Chameleon', 'mountain-bikes', E'The Santa Cruz Chameleon is a confidence-building hardtail with responsive handling and efficient trail manners. Its playful build makes it a practical daily rider for both technical sections and fast, fun descents.', 55, NULL, NULL, 'Small, Medium, Large, XL', NULL, NULL, 'Beginner, Intermediate', 'available', 44.0426911, -121.3151335, '115 SW Columbia Street, Bend, OR 97702', 'hardtail', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_oregon_bikes_cw_bend s
  WHERE e.user_id = v_user_id
    AND e.name = s.name
    AND e.description IS DISTINCT FROM s.description;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  WITH inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), v_user_id, s.name, s.category, s.description, s.price_per_day, s.price_per_hour, s.price_per_week, s.size, s.weight, s.material, s.suitable_skill_level, s.status, s.location_lat, s.location_lng, s.location_address, s.subcategory, s.damage_deposit, s.visible_on_map FROM _seed_oregon_bikes_cw_bend s
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = v_user_id AND e.name = s.name) RETURNING id
  ), ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0) RETURNING equipment_id
  ), ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1) RETURNING equipment_id
  ) SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2) INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
  RAISE NOTICE 'Cog Wild Bend gear: inserted=%, updated_descriptions=%, primary_images=%, secondary_images=%', v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;

-- =============================================
-- EQUIPMENT: Cog Wild Oakridge — Mountain bikes
-- Email: michaelzick+cogwildoakridge@gmail.com
-- Price basis: public 24-hour/day rental rates from official rental sources.
-- =============================================
DO $$
DECLARE
  v_user_id uuid; v_updated int := 0; v_equipment_inserted int := 0; v_primary_images_added int := 0; v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'michaelzick+cogwildoakridge@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found: michaelzick+cogwildoakridge@gmail.com'; END IF;

  CREATE TEMP TABLE _seed_oregon_bikes_cw_oakridge (name text, category text, description text, price_per_day numeric, price_per_hour numeric, price_per_week numeric, size text, weight text, material text, suitable_skill_level text, status text, location_lat numeric, location_lng numeric, location_address text, subcategory text, damage_deposit numeric, visible_on_map boolean) ON COMMIT DROP;
  TRUNCATE _seed_oregon_bikes_cw_oakridge;
  INSERT INTO _seed_oregon_bikes_cw_oakridge VALUES
  ('Santa Cruz Vala Alloy 70', 'mountain-bikes', E'Built for all-day mountain sessions, the Santa Cruz Vala Alloy 70 balances comfort and control with a confidence-focused suspension tune. It is an excellent pickup for riders who want an agile e-mountain experience without overcomplication.', 130, NULL, NULL, 'Small, Medium, Large', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 43.7477643, -122.4566687, '48333 E. First St., Oakridge, OR 97463', 'e-mountain-bike', NULL, true),
  ('Santa Cruz Bullit Carbon 90', 'mountain-bikes', E'The Santa Cruz Bullit Carbon 90 delivers punchy acceleration and composed trail performance. Its compact agility and composed riding character make it a strong option for riders chasing a playful yet capable e-mountain ride.', 160, NULL, NULL, 'Medium, Large', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 43.7477643, -122.4566687, '48333 E. First St., Oakridge, OR 97463', 'e-mountain-bike', NULL, true),
  ('Santa Cruz Nomad', 'mountain-bikes', E'The Santa Cruz Nomad is a downhill-oriented trail machine tuned for confidence on steep, technical runs. It favors riders who want predictable handling and smooth traction when the terrain gets rough.', 100, NULL, NULL, 'Medium', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 43.7477643, -122.4566687, '48333 E. First St., Oakridge, OR 97463', 'full-suspension', NULL, true),
  ('Santa Cruz Bronson', 'mountain-bikes', E'The Santa Cruz Bronson brings planted, race-ready suspension behavior to everyday trail use. This model is well-suited for riders who want a stable platform for both technical sections and faster-paced riding.', 100, NULL, NULL, 'Large', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 43.7477643, -122.4566687, '48333 E. First St., Oakridge, OR 97463', 'full-suspension', NULL, true),
  ('Santa Cruz Megatower', 'mountain-bikes', E'The Santa Cruz Megatower is a long-travel trail bike built for bigger descents and playful jumping moments. It is a stable and capable option for riders who want support on demanding terrain.', 100, NULL, NULL, 'XL', NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 43.7477643, -122.4566687, '48333 E. First St., Oakridge, OR 97463', 'full-suspension', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_oregon_bikes_cw_oakridge s
  WHERE e.user_id = v_user_id
    AND e.name = s.name
    AND e.description IS DISTINCT FROM s.description;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  WITH inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), v_user_id, s.name, s.category, s.description, s.price_per_day, s.price_per_hour, s.price_per_week, s.size, s.weight, s.material, s.suitable_skill_level, s.status, s.location_lat, s.location_lng, s.location_address, s.subcategory, s.damage_deposit, s.visible_on_map FROM _seed_oregon_bikes_cw_oakridge s
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = v_user_id AND e.name = s.name) RETURNING id
  ), ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0) RETURNING equipment_id
  ), ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1) RETURNING equipment_id
  ) SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2) INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
  RAISE NOTICE 'Cog Wild Oakridge gear: inserted=%, updated_descriptions=%, primary_images=%, secondary_images=%', v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;

-- =============================================
-- EQUIPMENT: Sunnyside Sports — Mountain bikes
-- Email: michaelzick+sunnysidesportsbend@gmail.com
-- Price basis: public 24-hour/day rental rates from official rental sources.
-- =============================================
DO $$
DECLARE
  v_user_id uuid; v_updated int := 0; v_equipment_inserted int := 0; v_primary_images_added int := 0; v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'michaelzick+sunnysidesportsbend@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found: michaelzick+sunnysidesportsbend@gmail.com'; END IF;

  CREATE TEMP TABLE _seed_oregon_bikes_sunnyside (name text, category text, description text, price_per_day numeric, price_per_hour numeric, price_per_week numeric, size text, weight text, material text, suitable_skill_level text, status text, location_lat numeric, location_lng numeric, location_address text, subcategory text, damage_deposit numeric, visible_on_map boolean) ON COMMIT DROP;
  TRUNCATE _seed_oregon_bikes_sunnyside;
  INSERT INTO _seed_oregon_bikes_sunnyside VALUES
  ('Ibis Ripley', 'mountain-bikes', E'The 2025 Ibis Ripley is a playful, confidence-inspiring trail bike that stays composed on mixed terrain. Its balanced geometry and responsive suspension make it a dependable choice for all-day flow riding.', 95, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'full-suspension', NULL, true),
  ('Ibis Ripmo', 'mountain-bikes', E'The Ibis Ripmo blends quick handling with sturdy suspension behavior for modern trail sessions. It is a well-rounded option for riders who want responsiveness on climbs and confidence on descents.', 95, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'full-suspension', NULL, true),
  ('Ibis Ripley SL', 'mountain-bikes', E'The Ibis Ripley SL delivers a smooth and playful ride character with a responsive trail focus. Its balanced setup is well-suited for riders moving between technical and cruising sections in one loop.', 95, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'full-suspension', NULL, true),
  ('Yeti SB140', 'mountain-bikes', E'The Yeti SB140 is a high-energy trail bike engineered for big hits and fast transitions through rough terrain. Its playful, aggressive personality is made for riders chasing confidence and control on demanding singletrack.', 95, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'full-suspension', NULL, true),
  ('Yeti SB120', 'mountain-bikes', E'The Yeti SB120 offers balanced trail performance with a playful yet stable feel on singletrack and descents. It is a solid pick for riders who want an adaptable platform across technical routes.', 95, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate, Advanced', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'full-suspension', NULL, true),
  ('Trek Marlin 8', 'mountain-bikes', E'The Trek Marlin 8 is an energetic hardtail that rewards confident body position and smooth lines. It is a practical race-minded trail bike for riders developing speed and handling on varied terrain.', 45, NULL, NULL, NULL, NULL, NULL, 'Beginner, Intermediate', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'hardtail', NULL, true),
  ('Trek Farley 7', 'mountain-bikes', E'The Trek Farley 7 is a playful hardtail fat-bike with broad tires and secure, stable handling. It is built for traction and comfort on loose surfaces, snow, and sandier off-road routes.', 45, NULL, NULL, 'Small, Medium, Large, XL', NULL, NULL, 'Beginner, Intermediate', 'available', 44.0626697, -121.3257029, '930 NW Newport Ave, Bend, OR 97703', 'fat-bike', NULL, true)
  ;

  UPDATE public.equipment e
  SET description = s.description
  FROM _seed_oregon_bikes_sunnyside s
  WHERE e.user_id = v_user_id
    AND e.name = s.name
    AND e.description IS DISTINCT FROM s.description;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  WITH inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), v_user_id, s.name, s.category, s.description, s.price_per_day, s.price_per_hour, s.price_per_week, s.size, s.weight, s.material, s.suitable_skill_level, s.status, s.location_lat, s.location_lng, s.location_address, s.subcategory, s.damage_deposit, s.visible_on_map FROM _seed_oregon_bikes_sunnyside s
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = v_user_id AND e.name = s.name) RETURNING id
  ), ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0) RETURNING equipment_id
  ), ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary) SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false FROM inserted i WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1) RETURNING equipment_id
  ) SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2) INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
  RAISE NOTICE 'Sunnyside Sports gear: inserted=%, updated_descriptions=%, primary_images=%, secondary_images=%', v_equipment_inserted, v_updated, v_primary_images_added, v_secondary_images_added;
END $$;
