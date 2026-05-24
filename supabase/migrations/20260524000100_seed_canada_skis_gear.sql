-- Seed migration: Canada skis gear
-- Batch: canada_ski_snowboard_surf_mtb
-- Created: 2026-05-24
-- Depends on: 20260524000000_seed_canada_ski_snowboard_surf_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260524000100_seed_canada_skis_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Skis primary image:   https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg
-- Skis secondary image: https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

-- =============================================
-- EQUIPMENT: Canada accepted skis shops
-- Price basis: official Canada rental pages retrieved 2026-05-24.
-- Coordinates sourced from Nominatim street-level geocodes for each shop address.
-- Wax Bench rows retarget existing profile 60877048-53da-4efb-842f-2d22e98caef0; no duplicate shop/user is created.
-- =============================================
DO $$
DECLARE
  missing_email text;
  v_equipment_updated int := 0;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (
    VALUES
      (E'michaelzick+crosscountryconnectionwhistler@gmail.com'),
      (E'michaelzick+thewaxbench@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Dynastar M-Cross',
        E'skis',
        E'The Dynastar M-Cross is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Atomic Maverick 88 CTI',
        E'skis',
        E'The Atomic Maverick 88 CTI is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Volkl Mantra 88',
        E'skis',
        E'The Volkl Mantra 88 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Head Kore 94 Ti',
        E'skis',
        E'The Head Kore 94 Ti is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Nordica Enforcer 94',
        E'skis',
        E'The Nordica Enforcer 94 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Fischer Ranger 96',
        E'skis',
        E'The Fischer Ranger 96 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Atomic Bent Chetler 100',
        E'skis',
        E'The Atomic Bent Chetler 100 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Elan Playmaker 101',
        E'skis',
        E'The Elan Playmaker 101 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'K2 Reckoner 102',
        E'skis',
        E'The K2 Reckoner 102 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Nordica Enforcer 104',
        E'skis',
        E'The Nordica Enforcer 104 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Ferreol Pionnier 104',
        E'skis',
        E'The Ferreol Pionnier 104 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Fischer Ranger 108',
        E'skis',
        E'The Fischer Ranger 108 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'freeride', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Atomic Bent Chetler 110',
        E'skis',
        E'The Atomic Bent Chetler 110 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'K2 Reckoner 110',
        E'skis',
        E'The K2 Reckoner 110 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Head Kore 112 Ti',
        E'skis',
        E'The Head Kore 112 Ti is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Volkl Revolt 114',
        E'skis',
        E'The Volkl Revolt 114 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Fischer Ranger 116',
        E'skis',
        E'The Fischer Ranger 116 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Atomic Bent Chetler 120',
        E'skis',
        E'The Atomic Bent Chetler 120 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        58.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'powder', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Head Instinct 83',
        E'skis',
        E'The Head Instinct 83 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        42.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'frontside', NULL::numeric, true
      ),
      (
        E'michaelzick+thewaxbench@gmail.com',
        E'Head Kore 80',
        E'skis',
        E'The Head Kore 80 is a model-level ski rental listed by The Wax Bench for Revelstoke resort conditions. It gives visitors a source-backed option with official day pricing tied to the shop rental program.',
        42.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        50.9982632, -118.1934102,
        E'106 Orton Avenue, Revelstoke, BC V0E 2S0, Canada',
        E'frontside', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol X5 Classic',
        E'skis',
        E'The Rossignol X5 Classic is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol X8 Classic',
        E'skis',
        E'The Rossignol X8 Classic is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol X10 Skate',
        E'skis',
        E'The Rossignol X10 Skate is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol Xium Skate',
        E'skis',
        E'The Rossignol Xium Skate is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol R-Skin Sport',
        E'skis',
        E'The Rossignol R-Skin Sport is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Rossignol Evo Positrack',
        E'skis',
        E'The Rossignol Evo Positrack is a model-level Nordic ski rental listed by Cross Country Connection for Whistler Lost Lake terrain. It gives visitors a source-backed option with official full-day pricing tied to the rental program.',
        35.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'cross-country', NULL::numeric, true
      )
  ),
  resolved AS (
    SELECT au.id AS user_id, s.* FROM seed_equipment s JOIN auth.users au ON au.email = s.seed_email
  ),
  wax_bench_matches (seed_name, existing_name, target_name) AS (
    VALUES
      (E'Dynastar M-Cross', E'Dynastar M-Cross', E'Dynastar M-Cross'),
      (E'Atomic Maverick 88 CTI', E'Atomic Maverick 88 CTI', E'Atomic Maverick 88 CTI'),
      (E'Volkl Mantra 88', E'Volkl Mantra 88', E'Volkl Mantra 88'),
      (E'Head Kore 94 Ti', E'Head Kore 93/94ti', E'Head Kore 93/94ti'),
      (E'Nordica Enforcer 94', E'Nordica Enforcer 94', E'Nordica Enforcer 94'),
      (E'Fischer Ranger 96', E'Fischer Ranger 96', E'Fischer Ranger 96'),
      (E'Atomic Bent Chetler 100', E'Atomic Bent 100', E'Atomic Bent Chetler 100'),
      (E'Elan Playmaker 101', E'Elan Playmaker 101', E'Elan Playmaker 101'),
      (E'K2 Reckoner 102', E'K2 Reckoner 102', E'K2 Reckoner 102'),
      (E'Nordica Enforcer 104', E'Nordica Enforcer 104', E'Nordica Enforcer 104'),
      (E'Ferreol Pionnier 104', E'Ferrol Pionnier 104', E'Ferreol Pionnier 104')
  ),
  matched_updates AS (
    UPDATE public.equipment e
      SET name = m.target_name,
          price_per_day = r.price_per_day,
          updated_at = now()
    FROM resolved r
    JOIN wax_bench_matches m ON m.seed_name = r.name
    WHERE r.seed_email = E'michaelzick+thewaxbench@gmail.com'
      AND e.user_id = r.user_id
      AND e.category = r.category
      AND e.name IN (m.existing_name, m.target_name)
    RETURNING e.id
  ),
  inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), r.user_id, r.name, r.category, r.description, r.price_per_day, r.price_per_hour, r.price_per_week, r.size, r.weight, r.material, r.suitable_skill_level, r.status, r.location_lat, r.location_lng, r.location_address, r.subcategory, r.damage_deposit, r.visible_on_map
    FROM resolved r
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = r.user_id AND e.name = r.name)
      AND NOT EXISTS (SELECT 1 FROM wax_bench_matches m WHERE r.seed_email = E'michaelzick+thewaxbench@gmail.com' AND m.seed_name = r.name)
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg', 0, true FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0)
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg', 1, false FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1)
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM matched_updates), (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_updated, v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Canada skis updated=%, inserted=%, primary_images_added=%, secondary_images_added=%', v_equipment_updated, v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
