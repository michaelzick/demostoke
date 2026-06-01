-- Seed migration: U.S. Mountain timezone mountain-bike gear
-- Batch: us_mountain_mountain_bikes
-- Created: 2026-05-31
-- Depends on: 20260531120000_seed_us_mountain_mountain_bikes_shops.sql
-- Remote status: files only; not pushed, applied, or deployed.
-- Image URLs (mountain-bikes): https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg and https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

DO $seed_migration$
DECLARE
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  CREATE TEMP TABLE _seed_us_mountain_mtb_gear (
    seed_email text,
    name text,
    description text,
    price_per_day numeric,
    size text,
    suitable_skill_level text,
    location_lat numeric,
    location_lng numeric,
    location_address text,
    subcategory text
  ) ON COMMIT DROP;

  INSERT INTO _seed_us_mountain_mtb_gear VALUES
    ('michaelzick+danbaileyslivingston@gmail.com', 'Specialized Rockhopper Comp MTB', $$The Specialized Rockhopper Comp MTB is a hardtail mountain bike suited to Livingston singletrack and gravel rides. Dan Bailey's public bike rental page lists it as a mountain bike rental with a daily price and helmet included.$$, 40, NULL, 'Beginner, Intermediate', 45.6616265, -110.5623716, '209 W Park Street, Livingston, MT 59047', 'hardtail'),
    ('michaelzick+danbaileyslivingston@gmail.com', 'Specialized Turbo Levo', $$The Specialized Turbo Levo is a full-suspension electric mountain bike for riders who want powered help on longer or steeper Montana trail days. Dan Bailey's public page lists it as an e-bike rental with a daily rate.$$, 100, NULL, 'Beginner, Intermediate, Advanced', 45.6616265, -110.5623716, '209 W Park Street, Livingston, MT 59047', 'electric-mountain-bike'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Santa Cruz Carbon Tallboy', $$The Santa Cruz Carbon Tallboy is a short-travel carbon trail bike for efficient Fort Collins singletrack. proVelo lists the Carbon Tallboy in its rental and demo program under the carbon 24-hour pricing tier.$$, 150, 'Medium', 'Beginner, Intermediate, Advanced', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'carbon-trail'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Santa Cruz Carbon Hightower', $$The Santa Cruz Carbon Hightower is a versatile carbon all-mountain bike for rougher Front Range trail riding. proVelo lists Carbon Hightower sizes in its rental and demo program under the carbon bike rate.$$, 150, 'Large, XL', 'Intermediate, Advanced, Expert', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'carbon-all-mountain'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Ibis Carbon Ripley', $$The Ibis Carbon Ripley is a light and efficient trail bike for riders who want responsive climbing and quick handling. proVelo lists Carbon Ripley sizes in its public rental and demo selection.$$, 150, 'Small, Medium, Large', 'Beginner, Intermediate, Advanced', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'carbon-trail'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Ibis Carbon Ripmo', $$The Ibis Carbon Ripmo is a carbon all-mountain bike for bigger trail days and technical descents. proVelo lists Carbon Ripmo sizes in its public rental and demo selection.$$, 150, 'Medium, Large', 'Intermediate, Advanced, Expert', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'carbon-enduro'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Giant Trance X 29', $$The Giant Trance X 29 is an aluminum full-suspension trail bike with a broad fit range. proVelo lists Aluminum Trance X 29 under its rental selection and aluminum 24-hour pricing tier.$$, 100, 'Medium, Large, XL', 'Beginner, Intermediate, Advanced', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'aluminum-trail'),
    ('michaelzick+provelobicyclesfortcollins@gmail.com', 'Liv Intrigue 27.5', $$The Liv Intrigue 27.5 is an aluminum full-suspension trail bike with smaller size options. proVelo lists Aluminum Intrigue 27.5 sizes in its public rental and demo program.$$, 100, 'XS, Small, Medium', 'Beginner, Intermediate, Advanced', 40.5377487, -105.0949238, '1003 W Horsetooth Rd, Fort Collins, CO 80526', 'aluminum-trail'),
    ('michaelzick+habitatgrandtarghee@gmail.com', 'Specialized Status 170', $$The Specialized Status 170 is a downhill-focused mountain bike for lift-served laps and rough resort terrain. Habitat's Grand Targhee location lists it with three-hour and full-day public pricing.$$, 119, 'XS, Small, Medium, Large, XL', 'Intermediate, Advanced, Expert', 43.7849766, -110.9469857, '3300 E Ski Hill Rd, Alta, WY 83414', 'downhill'),
    ('michaelzick+habitatgrandtarghee@gmail.com', 'Kona Process 134 DL', $$The Kona Process 134 DL is a cross-country and trail-oriented full-suspension mountain bike for Grand Targhee's pedal-access and mixed trail network. Habitat lists it with three-hour and full-day public pricing.$$, 99, 'XS, Small, Medium, Large, XL', 'Beginner, Intermediate, Advanced', 43.7849766, -110.9469857, '3300 E Ski Hill Rd, Alta, WY 83414', 'trail');

  IF EXISTS (
    SELECT 1
    FROM _seed_us_mountain_mtb_gear g
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users au WHERE au.email = g.seed_email
    )
  ) THEN
    RAISE EXCEPTION 'Required shop user missing for U.S. Mountain mountain-bike gear batch';
  END IF;

  WITH source_rows AS (
    SELECT au.id AS user_id, g.*
    FROM _seed_us_mountain_mtb_gear g
    JOIN auth.users au ON au.email = g.seed_email
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
      gen_random_uuid(), s.user_id, s.name, 'mountain-bikes', s.description,
      s.price_per_day, NULL, NULL,
      s.size, NULL, NULL, s.suitable_skill_level, 'available',
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      NULL, true
    FROM source_rows s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = s.user_id
        AND e.category = 'mountain-bikes'
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

  RAISE NOTICE 'U.S. Mountain mountain-bike gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
