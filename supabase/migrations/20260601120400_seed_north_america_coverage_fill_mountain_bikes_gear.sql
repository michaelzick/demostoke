-- Seed migration: North America coverage fill mountain-bike gear
-- Batch: north_america_coverage_fill
-- Created: 2026-06-01
-- Depends on: 20260601120000_seed_north_america_coverage_fill_shops.sql
-- Remote status: applied to linked Supabase project on 2026-06-01.
-- Image URLs (mountain-bikes): https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg and https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

DO $seed_migration$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (
    VALUES
      (E'michaelzick+bikeflowoaxaca@gmail.com'),
      (E'michaelzick+bikedenali@gmail.com'),
      (E'michaelzick+dismounttoronto@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+bikeflowoaxaca@gmail.com',
        E'Trek Marlin',
        E'mountain-bikes',
        E'BikeFlow Oaxaca lists the Trek Marlin as a 24-hour mountain-bike rental starting from 600 MXN. It is presented as a hardtail for local trails and scenic paths.',
        600.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        17.0621249, -96.7179305,
        E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikeflowoaxaca@gmail.com',
        E'Specialized Rockhopper',
        E'mountain-bikes',
        E'BikeFlow Oaxaca lists the Specialized Rockhopper as a 24-hour mountain-bike rental starting from 600 MXN. It is a trail-capable hardtail for Oaxaca routes and mixed terrain.',
        600.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        17.0621249, -96.7179305,
        E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikeflowoaxaca@gmail.com',
        E'Scott Aspect',
        E'mountain-bikes',
        E'BikeFlow Oaxaca lists the Scott Aspect as a 24-hour mountain-bike rental starting from 600 MXN. It is described as a lightweight option for cross-country rides and valley exploration.',
        600.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        17.0621249, -96.7179305,
        E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
        E'cross-country hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikeflowoaxaca@gmail.com',
        E'Cube Access WS EAZ',
        E'mountain-bikes',
        E'BikeFlow Oaxaca lists the Cube Access WS EAZ as a 24-hour mountain-bike rental starting from 600 MXN. It is described as a responsive trail bike for climbing and descending.',
        600.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        17.0621249, -96.7179305,
        E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikeflowoaxaca@gmail.com',
        E'Belfort Alom',
        E'mountain-bikes',
        E'BikeFlow Oaxaca lists the Belfort Alom as a 24-hour mountain-bike rental starting from 600 MXN. It is described as a versatile Mexican-designed bike for Oaxaca terrain.',
        600.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        17.0621249, -96.7179305,
        E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikedenali@gmail.com',
        E'Trek Marlin 5',
        E'mountain-bikes',
        E'Bike Denali lists Trek Marlin 5 mountain bikes for Denali Park rides. Alaska.org publishes the single-day package rate at 85 USD for one day, with helmet, lock, rear rack, day pannier, bear spray, repair kit, rain poncho, and car rack if needed.',
        85.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        63.7453222, -148.9011115,
        E'Mile 238.5 Parks Hwy, Denali Park, AK 99755',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+dismounttoronto@gmail.com',
        E'Norco Fluid FS A2',
        E'mountain-bikes',
        E'Dismount Bike Shop lists the Norco Fluid FS A2 in its public rental inventory and pricing page. The published bike daily rate is 80 CAD for same-day pickup and return.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        43.6798533, -79.4352123,
        E'936 St Clair Ave W, Toronto, ON M6C 1C8, Canada',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+dismounttoronto@gmail.com',
        E'Norco Bigfoot 2',
        E'mountain-bikes',
        E'Dismount Bike Shop lists the Norco Bigfoot 2 in its public rental inventory and pricing page. The published bike daily rate is 80 CAD for same-day pickup and return.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        43.6798533, -79.4352123,
        E'936 St Clair Ave W, Toronto, ON M6C 1C8, Canada',
        E'fat bike', NULL::numeric, true
      ),
      (
        E'michaelzick+dismounttoronto@gmail.com',
        E'Salsa Heyday Advent',
        E'mountain-bikes',
        E'Dismount Bike Shop lists the Salsa Heyday Advent in its public rental inventory and pricing page. The published bike daily rate is 80 CAD for same-day pickup and return.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        43.6798533, -79.4352123,
        E'936 St Clair Ave W, Toronto, ON M6C 1C8, Canada',
        E'fat bike', NULL::numeric, true
      )
  ),
  inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(),
      au.id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM seed_equipment s
    JOIN auth.users au ON au.email = s.seed_email
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = au.id
        AND e.category = s.category
        AND lower(btrim(e.name)) = lower(btrim(s.name))
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'North America coverage mountain-bike gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
