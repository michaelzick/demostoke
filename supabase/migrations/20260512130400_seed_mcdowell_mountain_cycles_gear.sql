-- =============================================
-- SEED: McDowell Mountain Cycles — Gear
-- Shop: McDowell Mountain Cycles (Fountain Hills, AZ)
-- Email: michaelzick+mcdowellmountaincyclesfountainhills@gmail.com
-- Items: 2 mountain bikes
-- Images: 2 per bike (4 total)
-- Source: User-provided screenshot of live booking UI (MTB Full Suspension category)
-- NOTE: Original file failed with "column specs does not exist". This is the corrected version.
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512130400_seed_mcdowell_mountain_cycles_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
-- =============================================

DO $$
DECLARE
  v_user_id           uuid;
  v_equip_id          uuid;
  v_location_address  text    := '11879 N. Saguaro Blvd, Fountain Hills, AZ 85268';
  v_location_lat      numeric := 33.6267;
  v_location_lng      numeric := -111.7341;
  v_img_primary       text    := 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg';
  v_img_secondary     text    := 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg';
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+mcdowellmountaincyclesfountainhills@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for McDowell Mountain Cycles — run shops migration first';
  END IF;

  -- -----------------------------------------------
  -- Bike 1: Trek Fuel EX 8
  -- -----------------------------------------------
  INSERT INTO public.equipment (
    id, user_id, name, description, category, status,
    price_per_day, damage_deposit,
    location_address, location_lat, location_lng,
    visible_on_map, suitable_skill_level, size
  )
  SELECT
    gen_random_uuid(),
    v_user_id,
    'Trek Fuel EX 8',
    'A versatile trail bike built on Alpha Aluminum with 140mm front and 130mm rear travel. Powered by SRAM GX Eagle 12-speed drivetrain for reliable performance on Fountain Hills technical desert singletrack and McDowell Sonoran trails.',
    'mountain-bikes',
    'available',
    95.00,
    50.00,
    v_location_address, v_location_lat, v_location_lng,
    true,
    'Beginner, Intermediate, Advanced',
    'XS, Small, Medium, Large, XL'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment
    WHERE user_id = v_user_id AND name = 'Trek Fuel EX 8'
  );

  SELECT id INTO v_equip_id
  FROM public.equipment
  WHERE user_id = v_user_id AND name = 'Trek Fuel EX 8';

  INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
  SELECT v_equip_id, v_img_primary, 0, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment_images
    WHERE equipment_id = v_equip_id AND display_order = 0
  );

  INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
  SELECT v_equip_id, v_img_secondary, 1, false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment_images
    WHERE equipment_id = v_equip_id AND display_order = 1
  );

  -- -----------------------------------------------
  -- Bike 2: Specialized Stumpjumper 15 Comp Alloy
  -- -----------------------------------------------
  INSERT INTO public.equipment (
    id, user_id, name, description, category, status,
    price_per_day, damage_deposit,
    location_address, location_lat, location_lng,
    visible_on_map, suitable_skill_level, size
  )
  SELECT
    gen_random_uuid(),
    v_user_id,
    'Specialized Stumpjumper 15 Comp Alloy',
    'The latest-generation Stumpjumper built on alloy with a FOX Float 36 Rhythm GRIP fork and X-Fusion Manic dropper post. SWAT door integration keeps trail essentials stowed. Ideal for McDowell Sonoran and Browns Ranch singletrack.',
    'mountain-bikes',
    'available',
    95.00,
    50.00,
    v_location_address, v_location_lat, v_location_lng,
    true,
    'Beginner, Intermediate, Advanced',
    'Small, Medium, Large'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment
    WHERE user_id = v_user_id AND name = 'Specialized Stumpjumper 15 Comp Alloy'
  );

  SELECT id INTO v_equip_id
  FROM public.equipment
  WHERE user_id = v_user_id AND name = 'Specialized Stumpjumper 15 Comp Alloy';

  INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
  SELECT v_equip_id, v_img_primary, 0, true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment_images
    WHERE equipment_id = v_equip_id AND display_order = 0
  );

  INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
  SELECT v_equip_id, v_img_secondary, 1, false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.equipment_images
    WHERE equipment_id = v_equip_id AND display_order = 1
  );

  RAISE NOTICE 'McDowell Mountain Cycles gear seeded: 2 bikes, 4 images';
END $$;
