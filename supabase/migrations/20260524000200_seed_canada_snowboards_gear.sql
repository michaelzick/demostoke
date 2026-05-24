-- Seed migration: Canada snowboards gear
-- Batch: canada_ski_snowboard_surf_mtb
-- Created: 2026-05-24
-- Depends on: 20260524000000_seed_canada_ski_snowboard_surf_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260524000200_seed_canada_snowboards_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Snowboards primary image:   https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg
-- Snowboards secondary image: https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg

-- =============================================
-- EQUIPMENT: Canada accepted snowboards shops
-- Price basis: official Canada rental pages retrieved 2026-05-24.
-- Coordinates sourced from Nominatim street-level geocodes for each shop address.
-- Wax Bench rows retarget existing profile 60877048-53da-4efb-842f-2d22e98caef0; no duplicate shop/user is created.
-- =============================================
DO $$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (
    VALUES
      (E'michaelzick+gearhubsportsfernie@gmail.com'),
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
        E'Jones Frontier',
        E'snowboards',
        E'The Jones Frontier is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Burton Deep Thinker',
        E'snowboards',
        E'The Burton Deep Thinker is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Jones Flagship',
        E'snowboards',
        E'The Jones Flagship is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Jones Dream Weaver',
        E'snowboards',
        E'The Jones Dream Weaver is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Lib Tech Orca',
        E'snowboards',
        E'The Lib Tech Orca is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Jones Stratos',
        E'snowboards',
        E'The Jones Stratos is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Burton Custom Camber',
        E'snowboards',
        E'The Burton Custom Camber is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'Burton Custom Flying V',
        E'snowboards',
        E'The Burton Custom Flying V is a model-level snowboard rental listed by The Wax Bench. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
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
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'K2 Raygun',
        E'snowboards',
        E'The K2 Raygun is a model-level snowboard rental listed by GearHub Sports. It gives riders a source-backed board option with official day pricing tied to the shop rental program.',
        49.99::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'all-mountain', NULL::numeric, true
      )
  ),
  resolved AS (
    SELECT au.id AS user_id, s.* FROM seed_equipment s JOIN auth.users au ON au.email = s.seed_email
  ),
  inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), r.user_id, r.name, r.category, r.description, r.price_per_day, r.price_per_hour, r.price_per_week, r.size, r.weight, r.material, r.suitable_skill_level, r.status, r.location_lat, r.location_lng, r.location_address, r.subcategory, r.damage_deposit, r.visible_on_map
    FROM resolved r
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = r.user_id AND e.name = r.name)
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/7406683/pexels-photo-7406683.jpeg', 0, true FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0)
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/7166118/pexels-photo-7166118.jpeg', 1, false FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1)
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Canada snowboards inserted=%, primary_images_added=%, secondary_images_added=%', v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
