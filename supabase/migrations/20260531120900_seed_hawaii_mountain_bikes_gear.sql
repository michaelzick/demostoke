-- Seed migration: Hawaii mountain-bikes gear
-- Batch: hawaii_surf_mtb
-- Created: 2026-05-31
-- Depends on: 20260531120700_seed_hawaii_surf_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260531120900_seed_hawaii_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batch is category-homogeneous: mountain-bikes.
-- mountain-bikes primary image:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
-- mountain-bikes secondary image: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

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
      (E'michaelzick+mauisunriderskihei@gmail.com'),
      (E'michaelzick+mauisunriderskapalua@gmail.com'),
      (E'michaelzick+bikemauihaiku@gmail.com'),
      (E'michaelzick+bigislandbiketourswaimea@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+mauisunriderskihei@gmail.com',
        E'Santa Cruz Hightower D',
        E'mountain-bikes',
        E'Santa Cruz Hightower D is listed by Maui Sunriders as a full-suspension mountain-bike rental available from the Kihei bike shop. The public mountain-bike rate starts at $90 per day.',
        90.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        20.733737033898, -156.452718222034,
        E'1847 S. Kihei Rd, Kihei, HI 96753',
        E'full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mauisunriderskihei@gmail.com',
        E'Liv Giant Embolden 1',
        E'mountain-bikes',
        E'Liv Giant Embolden 1 is listed by Maui Sunriders as a full-suspension mountain-bike rental available from the Kihei bike shop. The public mountain-bike rate starts at $90 per day.',
        90.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Beginner, Intermediate',
        E'available',
        20.733737033898, -156.452718222034,
        E'1847 S. Kihei Rd, Kihei, HI 96753',
        E'full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mauisunriderskapalua@gmail.com',
        E'Trek Fuel EX 7',
        E'mountain-bikes',
        E'Trek Fuel EX 7 is listed by Maui Sunriders as a full-suspension mountain-bike rental available from the Kapalua bike shop. The public mountain-bike rate starts at $90 per day.',
        90.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        21.001457082778, -156.655730096767,
        E'800 Office Rd, Lahaina, HI 96761',
        E'full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mauisunriderskapalua@gmail.com',
        E'Giant Trance X Advanced E+ 2',
        E'mountain-bikes',
        E'Giant Trance X Advanced E+ 2 is listed by Maui Sunriders as a full-suspension e-MTB rental at the Kapalua bike shop. The public e-MTB rate starts at $139 per day.',
        139.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        21.001457082778, -156.655730096767,
        E'800 Office Rd, Lahaina, HI 96761',
        E'electric full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mauisunriderskapalua@gmail.com',
        E'Santa Cruz Vala 70 eMTB',
        E'mountain-bikes',
        E'Santa Cruz Vala 70 eMTB is listed by Maui Sunriders as a premium full-suspension e-MTB rental at the Kapalua bike shop. The public premium e-MTB rate starts at $159 per day.',
        159.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Advanced',
        E'available',
        21.001457082778, -156.655730096767,
        E'800 Office Rd, Lahaina, HI 96761',
        E'electric full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mauisunriderskapalua@gmail.com',
        E'Liv Intrigue X Advanced Elite 2 eMTB',
        E'mountain-bikes',
        E'Liv Intrigue X Advanced Elite 2 eMTB is listed by Maui Sunriders as a premium full-suspension e-MTB rental at the Kapalua bike shop. The public premium e-MTB rate starts at $159 per day.',
        159.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        21.001457082778, -156.655730096767,
        E'800 Office Rd, Lahaina, HI 96761',
        E'electric full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bikemauihaiku@gmail.com',
        E'Kona Blast',
        E'mountain-bikes',
        E'Kona Blast is listed by Bike Maui on its public bike rental page with a displayed $39 rental price and mountain-bike description for Haleakala-area rides.',
        39.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Beginner, Intermediate',
        E'available',
        20.914998474308, -156.322991879543,
        E'810 Haiku Rd #120, Haiku, HI 96708',
        E'hardtail mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bikemauihaiku@gmail.com',
        E'Kona Hei Hei',
        E'mountain-bikes',
        E'Kona Hei Hei is listed by Bike Maui on its public bike rental page with a displayed $89 rental price and an all-around mountain-bike description.',
        89.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        20.914998474308, -156.322991879543,
        E'810 Haiku Rd #120, Haiku, HI 96708',
        E'full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bikemauihaiku@gmail.com',
        E'Kona El Kahuna E-Bike',
        E'mountain-bikes',
        E'Kona El Kahuna E-Bike is listed by Bike Maui on its public bike rental page with a displayed $89 rental price and an electric mountain-bike description.',
        89.00::numeric, NULL::numeric, NULL::numeric,
        NULL,
        NULL, NULL,
        E'Beginner, Intermediate',
        E'available',
        20.914998474308, -156.322991879543,
        E'810 Haiku Rd #120, Haiku, HI 96708',
        E'electric hardtail mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bigislandbiketourswaimea@gmail.com',
        E'Specialized E-tero',
        E'mountain-bikes',
        E'Specialized E-Tero is listed by Big Island Bike Tours under available rental bikes. The public mountain-bike rental page lists mountain-bike pricing at $75-$100 per day and $325 per week; this seed uses the lower e-bike daily rate shown for the E-Tero tier.',
        75.00::numeric, NULL::numeric, 325.00::numeric,
        NULL,
        NULL, NULL,
        E'Beginner, Intermediate',
        E'available',
        20.025925849372, -155.687371668464,
        E'65-1480 Kawaihae Rd, Waimea, HI 96743',
        E'electric mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bigislandbiketourswaimea@gmail.com',
        E'Specialized Turbo Levo',
        E'mountain-bikes',
        E'Specialized Turbo Levo is listed by Big Island Bike Tours under available rental bikes. The public mountain-bike rental page lists mountain-bike pricing at $75-$100 per day; this seed uses the upper daily rate for the Turbo Levo e-MTB tier.',
        100.00::numeric, NULL::numeric, 450.00::numeric,
        NULL,
        NULL, NULL,
        E'Intermediate, Advanced',
        E'available',
        20.025925849372, -155.687371668464,
        E'65-1480 Kawaihae Rd, Waimea, HI 96743',
        E'electric full-suspension mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+bigislandbiketourswaimea@gmail.com',
        E'Polygon Acoustic Mountain Bike',
        E'mountain-bikes',
        E'Polygon acoustic mountain bike is listed by Big Island Bike Tours under available rental bikes. The public mountain-bike rental page lists mountain-bike pricing at $75-$100 per day and $325 per week; this seed uses the lower daily rate for the non-electric mountain-bike tier.',
        75.00::numeric, NULL::numeric, 325.00::numeric,
        NULL,
        NULL, NULL,
        E'Beginner, Intermediate',
        E'available',
        20.025925849372, -155.687371668464,
        E'65-1480 Kawaihae Rd, Waimea, HI 96743',
        E'mountain bike', NULL::numeric, true
      )
  ),
  inserted AS (
    INSERT INTO public.equipment (id, user_id, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map)
    SELECT gen_random_uuid(), au.id, s.name, s.category, s.description, s.price_per_day, s.price_per_hour, s.price_per_week, s.size, s.weight, s.material, s.suitable_skill_level, s.status, s.location_lat, s.location_lng, s.location_address, s.subcategory, s.damage_deposit, s.visible_on_map
    FROM seed_equipment s
    JOIN auth.users au ON au.email = s.seed_email
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment e WHERE e.user_id = au.id AND lower(btrim(e.name)) = lower(btrim(s.name)))
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, E'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0)
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, E'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1)
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Hawaii mountain-bikes inserted=%, primary_images_added=%, secondary_images_added=%', v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
