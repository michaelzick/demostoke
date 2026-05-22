-- Seed migration: Fair Wheel Bikes — mountain bike gear (Tucson, AZ)
-- Batch: arizona_mountain_bikes
-- Created: 2026-05-12
-- Depends on: 20260512130000_seed_arizona_mountain_bikes_shops.sql
-- Gear basis: fairwheelbikes.com/our-services/rental-bikes/mountain-bikes/ (retrieved 2026-05-12)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512130100_seed_fair_wheel_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Image URLs (mountain-bikes):
--   primary   (display_order=0): https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
--   secondary (display_order=1): https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

DO $$
DECLARE
  v_user_id uuid;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+fairwheelbikestucson@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+fairwheelbikestucson@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_fwb_bikes (
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

  INSERT INTO _seed_fwb_bikes VALUES
  (
    'Trek Fuel+ EX 8',
    'mountain-bikes',
    E'E-MTB with TQ-HPR60 motor and Fox 150mm front / 145mm rear travel. SRAM Eagle 70 12-speed drivetrain. Tackles Tucson''s Fantasy Island, Sweetwater Preserve, and Mt. Lemmon trails with pedal assistance. Helmet, flat kit, and choice of pedals included.',
    135.00, NULL, NULL,
    'Fox 150mm front / 145mm rear travel; TQ-HPR60 motor; SRAM Eagle 70 12-speed; M(17"), L(19")',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    32.2254, -110.9517,
    '1110 E 6th St, Tucson, AZ 85719',
    NULL, NULL, true
  ),
  (
    'Trek Fuel EX 8',
    'mountain-bikes',
    E'Full-suspension trail bike with Fox 150mm front / 140mm rear travel and GX Transmission wireless electronic shifting. Ideal for singletrack at Fantasy Island, Starr Pass, and Sweetwater Preserve. Helmet, flat kit, and choice of pedals included.',
    100.00, NULL, NULL,
    'Fox 150mm front / 140mm rear travel; GX Transmission wireless; S(15"), M(17"), L(19"), XL(21")',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    32.2254, -110.9517,
    '1110 E 6th St, Tucson, AZ 85719',
    NULL, NULL, true
  ),
  (
    'Specialized Chisel FS',
    'mountain-bikes',
    E'Lightweight full-suspension XC bike with RockShox 120mm front / 110mm rear travel and SRAM GX 12-speed drivetrain. Efficient climber built for Tucson''s fast desert singletrack. Helmet, flat kit, and choice of pedals included.',
    85.00, NULL, NULL,
    'RockShox 120mm front / 110mm rear travel; SRAM GX 12-speed; S(15"), M(17"), L(19"), XL(21")',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    32.2254, -110.9517,
    '1110 E 6th St, Tucson, AZ 85719',
    NULL, NULL, true
  ),
  (
    'Trek Procaliber',
    'mountain-bikes',
    E'Hardtail XC bike with 120mm RockShox Judy fork, Shimano Deore XT 1x12 drivetrain, and dropper post. Efficient and capable on Tucson''s smooth desert singletrack. Helmet, flat kit, and choice of pedals included.',
    65.00, NULL, NULL,
    'RockShox Judy 120mm fork; Shimano Deore XT 1x12; dropper post; S(15"), M(17"), M-L(18"), L(19"), XL(21")',
    NULL, NULL,
    'Beginner, Intermediate',
    'available',
    32.2254, -110.9517,
    '1110 E 6th St, Tucson, AZ 85719',
    NULL, NULL, true
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
      gen_random_uuid(), v_user_id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM _seed_fwb_bikes s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.user_id = v_user_id AND e.name = s.name
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
  SELECT
    (SELECT count(*) FROM inserted),
    (SELECT count(*) FROM ins1),
    (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Fair Wheel Bikes gear: inserted=%, primary_images=%, secondary_images=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
