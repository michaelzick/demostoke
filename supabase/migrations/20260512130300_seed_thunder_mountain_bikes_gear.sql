-- Seed migration: Thunder Mountain Bikes — mountain bike gear (Sedona, AZ)
-- Batch: arizona_mountain_bikes
-- Created: 2026-05-12
-- Depends on: 20260512130000_seed_arizona_mountain_bikes_shops.sql
-- Gear basis: rentals.thundermountainbikes.com/rentals (retrieved 2026-05-12)
-- 23 adult models across Dream / E-Bike / Premium / Performance / Hardtail tiers.
-- Excluded: Kids tier (3 children's bikes), Forbidden Druid GX RS S+ (expired 10/26/25).
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512130300_seed_thunder_mountain_bikes_gear.sql"
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
  WHERE email = 'michaelzick+thundermountainbikessedona@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+thundermountainbikessedona@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_tmb_bikes (
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

  -- ============================================================
  -- DREAM TIER — $119.99/day (8 models)
  -- ============================================================
  INSERT INTO _seed_tmb_bikes VALUES
  (
    'Evil The Following LS AXS',
    'mountain-bikes',
    'Top-tier 29in carbon trail bike with 120mm rear / 130mm fork travel. SRAM X0 Eagle T-Type 12-speed wireless drivetrain, SRAM Code/G2 4-piston brakes, and I9 Enduro S Hydra hub wheelset. Dropper post and tubeless tires included. Helmet provided.',
    119.99, NULL, NULL,
    'Super Boost carbon frameset; 120mm rear / RockShox Pike Ultimate fork 130mm; SRAM X0 Eagle T-Type 12s; I9 Enduro S wheelset; Small, Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Evil The Offering V3 AXS',
    'mountain-bikes',
    'High-end 29in carbon enduro bike with 140mm rear / 150mm fork travel. SRAM X0 Eagle T-Type 12-speed wireless drivetrain, SRAM G2/Code 4-piston brakes, and I9 Enduro S Hydra hub wheelset. Dropper post and tubeless tires included. Helmet provided.',
    119.99, NULL, NULL,
    'Super Boost carbon frameset; 140mm rear / RockShox Lyrik Ultimate fork 150mm; SRAM X0 Eagle T-Type 12s; I9 Enduro S wheelset; Small, Medium, Large, X-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Evil The Offering V4 AXS',
    'mountain-bikes',
    '2026 carbon enduro machine with 151mm rear / 160mm fork travel. SRAM X0 Eagle T-Type 12-speed wireless drivetrain, SRAM Maven Silver 4-piston brakes, and I9 DHS 1/1 hub wheelset. Dropper post, tubeless tires, and AB oval chainring included. Helmet provided.',
    119.99, NULL, NULL,
    'Boost carbon frameset; 151mm rear / RockShox Lyrik Ultimate fork 160mm; SRAM X0 Eagle T-Type 12s; I9 DHS wheelset; Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Ibis Ripley V5 Di2',
    'mountain-bikes',
    '2026 29in carbon XC/trail bike with 130mm rear / 140mm fork travel and Shimano XT M8200 Di2 electronic 12-speed drivetrain. Fox 36 SL Factory fork, Shimano XT M8220 4-piston brakes, and Ibis 933 aluminum wheels. Dropper post and tubeless tires included. Helmet provided.',
    119.99, NULL, NULL,
    'Boosted Carbon frameset; 130mm rear / Fox 36 SL Factory fork 140mm; Shimano XT M8200 Di2 12s; Ibis 933 aluminum wheels; Medium, X-Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Ibis Ripmo V3',
    'mountain-bikes',
    '2026 29in carbon long-travel enduro bike with 150mm rear / 160mm fork travel. Shimano XT M8200 Di2 electronic 12-speed drivetrain, Fox Float X Factory shock, Shimano XT M8220 4-piston brakes, and Ibis Blackbird Send aluminum wheels. Dropper post and tubeless tires. Helmet provided.',
    119.99, NULL, NULL,
    'Boosted Carbon frameset; 150mm rear / Fox 36 Factory fork 160mm; Shimano XT M8200 Di2 12s; Ibis Blackbird Send aluminum wheels; Medium, X-Medium, Large, X-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Santa Cruz Bronson X0 AXS',
    'mountain-bikes',
    '2025 mixed-wheel (MX) enduro bike on carbon with 150mm rear / 160mm fork travel. SRAM X0 T-Type AXS 12-speed wireless drivetrain, SRAM Maven Silver brakes, Fox 36 Factory X2 fork, and Race Face ARC 30 / i9 1/1 hub wheelset. Dropper post and tubeless tires. Helmet provided.',
    119.99, NULL, NULL,
    'Boost carbon frameset; 150mm rear / Fox 36 Factory X2 fork 160mm; SRAM X0 T-Type AXS 12s; Race Face ARC 30 / i9 1/1 hub wheelset; Medium, Large; MX wheel size',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Transition Spur Deore XT Di2',
    'mountain-bikes',
    '2026 lightweight 29in carbon XC/trail bike with 120mm rear / 130mm fork travel. Shimano XT Di2 electronic 12-speed drivetrain, Shimano XT M8220 4-piston brakes, Fox 34 SL Factory fork, and DT Swiss XR 1700/350 wheelset. Dropper post and tubeless tires. Helmet provided.',
    119.99, NULL, NULL,
    'Boost carbon frameset; 120mm rear / Fox 34 SL Factory fork 130mm; Shimano XT Di2 12s; DT Swiss XR 1700/350 wheelset; Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Top Fuel 9.8 Di2',
    'mountain-bikes',
    '2026 XC race bike on carbon with 120mm rear / 130mm fork travel. Shimano Deore XT M8200 Di2 electronic 12-speed drivetrain, Shimano Deore XT M8200 4-piston brakes, RockShox Pike Select+ fork, and Bontrager Line Comp 30 wheels. Dropper post and tubeless tires. Helmet provided.',
    119.99, NULL, NULL,
    'Boost carbon frameset; 120mm rear / RockShox Pike Select+ fork 130mm; Shimano Deore XT M8200 Di2 12s; Bontrager Line Comp 30 wheels; Small (27.5in), Medium / Medium-Large / Large (29in)',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  -- ============================================================
  -- E-BIKE TIER — $99.99–$129.99/day (5 models)
  -- ============================================================
  (
    'Santa Cruz Vala AL 70',
    'mountain-bikes',
    'E-mountain bike with Bosch Performance CX BDU38 motor, 150mm rear / 160mm fork travel, and SRAM Eagle 70 12-speed drivetrain. SRAM DB8 4-piston brakes and Reserve 30 HD AL wheelset. Dropper post and tubeless tires. Charger available ($175 deposit). Cannot be transported via trunk mount rack. Helmet provided.',
    109.99, NULL, NULL,
    'Boosted Aluminum frameset; 150mm rear / RockShox Zeb Base fork 160mm; Bosch Performance CX BDU38 motor; SRAM Eagle 70 12s; Reserve 30 HD AL wheelset; Small, Medium, X-Large; MX wheel size',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Santa Cruz Vala C 90',
    'mountain-bikes',
    '2025 carbon-frame e-mountain bike with Bosch Performance CX BDU38 motor, 150mm rear / 160mm fork travel, and SRAM Eagle 90 12-speed drivetrain. Fox 38 Performance fork, SRAM Maven Base Stealth brakes, Reserve 30 HD alloy / E13 wheelset. Dropper post and tubeless tires. Charger available ($175 deposit). Helmet provided.',
    129.99, NULL, NULL,
    'Boost carbon frameset; 150mm rear / Fox 38 Performance fork 160mm; Bosch Performance CX BDU38 motor; SRAM Eagle 90 12s; Reserve 30 HD alloy / E13 wheelset; Medium, Large, X-Large; MX wheel size',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Transition Regulator CX XT',
    'mountain-bikes',
    '2026 high-end carbon e-mountain bike with Bosch Performance Line CX BDU38 motor, 150mm rear / 160mm fork travel, and Shimano Deore XT M8100 12-speed drivetrain. RockShox Zeb Ultimate fork, TRP EVO Pro 4-piston brakes, DT Swiss H 1900/370 hub wheelset. Dropper post and tubeless tires. Charger available ($175 deposit). Helmet provided.',
    129.99, NULL, NULL,
    'Boost carbon frameset; 150mm rear / RockShox Zeb Ultimate fork 160mm; Bosch Performance Line CX BDU38 motor; Shimano Deore XT M8100 12s; DT Swiss H 1900/370 hub wheelset; Small, Medium, Large; MX wheel size',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Fuel+ EX 8',
    'mountain-bikes',
    '2026 e-mountain bike with TQ-HPR60 motor, 145mm rear / 150mm fork travel, and SRAM Eagle 70 12-speed drivetrain. Fox Rhythm 36 fork, SRAM DB8 4-piston brakes, and Bontrager Line TLR 30 wheels. Dropper post and tubeless tires. Charger available ($175 deposit). Cannot be transported via trunk mount rack. Helmet provided.',
    109.99, NULL, NULL,
    'Boosted Aluminum frameset; 145mm rear / Fox Rhythm 36 fork 150mm; TQ-HPR60 motor; SRAM Eagle 70 12s; Bontrager Line TLR 30 wheels; Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Rail 7',
    'mountain-bikes',
    '2025 e-mountain bike with Bosch Performance Line CX motor, 150mm rear / 160mm fork travel, and Shimano 12-speed drivetrain. RockShox Domain RC fork, Shimano M6120 4-piston brakes, and Bontrager Line Comp 30 wheels. Dropper post and tubeless tires. Charger available ($175 deposit). Cannot be transported via trunk mount rack. Helmet provided.',
    99.99, NULL, NULL,
    'Boosted Aluminum frameset; 150mm rear / RockShox Domain RC fork 160mm; Bosch Performance Line CX motor; Shimano Deore/SLX/XT 12s; Bontrager Line Comp 30 wheels; Small, X-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  -- ============================================================
  -- PREMIUM TIER — $99.99/day (3 models)
  -- ============================================================
  (
    'Santa Cruz Hightower C 70',
    'mountain-bikes',
    '2026 long-travel 29in trail bike on carbon with 150mm rear / 160mm fork travel. SRAM Eagle 70 T-Type drivetrain, SRAM DB8 4-piston brakes, Fox Float Rhythm shock, and Reserve 30 Alloy / SRAM MTH wheelset. Dropper post and tubeless tires. Helmet provided.',
    99.99, NULL, NULL,
    'Boosted Carbon C frameset; 150mm rear / RockShox Lyrik Base fork 160mm; SRAM Eagle 70 T-Type 12s; Reserve 30 Alloy / SRAM MTH wheelset; Medium, Large, X-Large, XX-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Transition Spur Deore',
    'mountain-bikes',
    '2025 lightweight 29in carbon XC/trail bike with 120mm rear and fork travel. Shimano Deore 12-speed drivetrain, Shimano Deore M6120 4-piston brakes, Fox Performance DPS shock, and WTB ST i27 / Novatech wheelset. Dropper post and tubeless tires. Helmet provided.',
    99.99, NULL, NULL,
    'Boosted carbon frameset; 120mm rear / Fox 34 Rhythm fork 120mm; Shimano Deore 12s; WTB ST i27 / Novatech wheelset; Small, Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Transition Spur Eagle 70',
    'mountain-bikes',
    '2026 lightweight 29in carbon XC/trail bike with 120mm rear / 130mm fork travel. SRAM Eagle 70 12-speed drivetrain, SRAM Motive Base 4-piston brakes, Fox Performance SL shock, and WTB ST i30 / Novatech wheelset. Dropper post and tubeless tires. Helmet provided.',
    99.99, NULL, NULL,
    'Boosted carbon frameset; 120mm rear / Fox 34 SL Performance fork 130mm; SRAM Eagle 70 12s; WTB ST i30 / Novatech wheelset; Small, Medium, Large, X-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  -- ============================================================
  -- PERFORMANCE TIER — $79.99/day (5 models)
  -- ============================================================
  (
    'Ibis Ripley AF Deore',
    'mountain-bikes',
    '2026 aluminum 29in full-suspension trail bike with 130mm rear / 140mm fork travel. Shimano Deore 12-speed drivetrain, SRAM G2 4-piston brakes, RockShox Deluxe Select shock, and Ibis 933 aluminum wheelset. Dropper post and tubeless tires. Helmet provided.',
    79.99, NULL, NULL,
    'Boosted Aluminum frameset; 130mm rear / RockShox Pike fork 140mm; Shimano Deore 12s; Ibis 933 aluminum wheelset; Small, Medium, X-Medium, Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Rocky Mountain Instinct A30',
    'mountain-bikes',
    'Versatile aluminum trail bike with 140mm rear / 150mm fork travel. Shimano Deore 12-speed drivetrain, RockShox 35 Gold RL fork, RockShox Deluxe Select RT shock, and WTB ST i30 TCS wheelset. Available in 27.5in (Small) and 29in (Medium–X-Large). Dropper post and tubeless tires. Helmet provided.',
    79.99, NULL, NULL,
    'Boosted aluminum frameset; 140mm rear / RockShox 35 Gold RL fork 150mm; Shimano Deore 12s; WTB ST i30 TCS wheelset; Small (27.5in), Medium–X-Large (29in)',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Transition Scout Deore',
    'mountain-bikes',
    '2026 27.5in aluminum enduro bike with 150mm front and rear travel. Shimano Deore M6100 12-speed drivetrain, Shimano Deore M6120 4-piston brakes, RockShox Psylo Gold RC fork, RockShox Deluxe Select+ shock, and WTB ST i30 / Novatech wheels. Dropper post and tubeless tires. Helmet provided.',
    79.99, NULL, NULL,
    'Boosted aluminum frameset; 150mm rear / RockShox Psylo Gold RC fork 150mm; Shimano Deore M6100 12s; WTB ST i30 / Novatech wheels; X-Small, Small, Medium (27.5in)',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Fuel EX 8',
    'mountain-bikes',
    '2026 versatile 29in full-suspension trail bike with 145mm rear / 150mm fork travel. SRAM Eagle 70 12-speed drivetrain, SRAM DB8 4-piston brakes, Fox Performance Float X shock, and Bontrager Line TLR 30 wheelset. Dropper post and tubeless tires. Helmet provided.',
    79.99, NULL, NULL,
    'Boosted aluminum frameset; 145mm rear / Fox Rhythm 36 fork 150mm; SRAM Eagle 70 12s; Bontrager Line TLR 30 wheelset; Medium, Large, X-Large',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Top Fuel 8',
    'mountain-bikes',
    '2025 XC/trail bike with 120mm rear / 130mm fork travel and Shimano 12-speed drivetrain. Fox Rhythm 34 fork, Fox Performance Float DPS shock, Shimano M6120 4-piston brakes, and Bontrager Line Comp 30 wheelset. Available in 27.5in (Small) or 29in (Medium–Large). Dropper post and tubeless tires. Helmet provided.',
    79.99, NULL, NULL,
    'Boosted aluminum frameset; 120mm rear / Fox Rhythm 34 fork 130mm; Shimano Deore/SLX/XT 12s; Bontrager Line Comp 30 wheelset; Small (27.5in), Medium / Medium-Large / Large (29in)',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  -- ============================================================
  -- HARDTAIL TIER — $59.99/day (2 models)
  -- ============================================================
  (
    'Trek Roscoe 7',
    'mountain-bikes',
    'MY2024/2025 hardtail trail bike on 27.5in (X-Small) or 29in wheels with 140mm RockShox Recon Silver RL fork. Shimano Deore 12-speed drivetrain and Shimano MT200 disc brakes. Dropper post and tubeless tires. Helmet provided.',
    59.99, NULL, NULL,
    'Boosted aluminum frameset; RockShox Recon Silver RL fork 140mm; Shimano Deore 12s; X-Small (27.5in), Small–X-Large (29in)',
    NULL, NULL,
    'Beginner, Intermediate',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
    NULL, NULL, true
  ),
  (
    'Trek Roscoe 7 2026',
    'mountain-bikes',
    'MY2026 hardtail trail bike on 29in wheels with 150mm RockShox Recon Silver RL fork. Shimano Cues 10-speed drivetrain and Shimano MT200 disc brakes. Dropper post included. Helmet provided.',
    59.99, NULL, NULL,
    'Boosted aluminum frameset; RockShox Recon Silver RL fork 150mm; Shimano Cues 10s; Small, Medium (29in)',
    NULL, NULL,
    'Beginner, Intermediate',
    'available',
    34.8631, -111.7897,
    '1695 W. State Route 89A, Sedona, AZ 86336',
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
    FROM _seed_tmb_bikes s
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

  RAISE NOTICE 'Thunder Mountain Bikes gear: inserted=%, primary_images=%, secondary_images=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
