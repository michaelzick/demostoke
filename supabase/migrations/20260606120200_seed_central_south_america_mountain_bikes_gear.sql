-- Seed migration: Central and South America mountain-bike gear
-- Batch: central_south_america_gear
-- Created: 2026-06-06
-- Depends on: 20260606120000_seed_central_south_america_gear_shops.sql
-- Remote status: local only; apply to linked Supabase only after explicit human approval.
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
      (E'michaelzick+mtbguatemala@gmail.com'),
      (E'michaelzick+bikearenal@gmail.com'),
      (E'michaelzick+nosaramtb@gmail.com'),
      (E'michaelzick+buencamino@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, currency_code, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal T.E.M.P.O',
        E'mountain-bikes',
        E'A short-travel Commencal trail bike for Tecpan singletrack and all-day mountain rides. The official MTB Guatemala catalog lists this current-model rental at 85 USD per day.',
        85.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal META TR Premium',
        E'mountain-bikes',
        E'A premium Commencal META TR trail bike suited to rocky descents and technical Tecpan routes. MTB Guatemala publishes this model-level rental at 100 USD per day.',
        100.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal T.E.M.P.O Premium',
        E'mountain-bikes',
        E'A premium T.E.M.P.O build for riders who want a lighter, lively trail bike on mixed Guatemala terrain. The shop lists this rental at 100 USD per day.',
        100.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal Meta TR 29',
        E'mountain-bikes',
        E'A 29-inch Commencal Meta TR for fast trail days and rough volcanic-slope riding. MTB Guatemala publishes this model as a 75 USD daily mountain-bike rental.',
        75.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal Meta AM 29',
        E'mountain-bikes',
        E'A long-travel Commencal all-mountain bike for steeper Tecpan lines and technical descending. The official rental catalog lists the Meta AM 29 at 75 USD per day.',
        75.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Commencal Meta Power 29',
        E'mountain-bikes',
        E'A Commencal electric enduro bike for shuttle-style terrain and longer highland laps. MTB Guatemala lists the Meta Power 29 e-bike rental at 100 USD per day.',
        100.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'e-mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Giant Trance E+ 2 Pro',
        E'mountain-bikes',
        E'A Giant Trance E+ 2 Pro eMTB for assisted trail riding on sustained climbs and rough descents. MTB Guatemala lists this e-bike rental at 100 USD per day.',
        100.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'e-mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Giant Talon 29er',
        E'mountain-bikes',
        E'A Giant Talon 29er hardtail for efficient climbing, rolling singletrack, and less technical routes. MTB Guatemala publishes this model-level rental at 75 USD per day.',
        75.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+mtbguatemala@gmail.com',
        E'Giant Trance 27.5',
        E'mountain-bikes',
        E'A Giant Trance 27.5 full-suspension trail bike for playful handling and mixed Guatemala mountain terrain. The shop lists this rental at 75 USD per day.',
        75.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        14.7688752, -90.9893490,
        E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikearenal@gmail.com',
        E'Cannondale Rush 27.5',
        E'mountain-bikes',
        E'A carbon full-suspension Cannondale Rush 27.5 for La Fortuna trail riding and volcano-area exploration. Bike Arenal publishes this model at 65 USD per day with helmet and lock included.',
        65.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        E'Small, Medium, Large', NULL::text, E'Carbon fiber',
        E'Beginner, Intermediate, Advanced',
        'available',
        10.4669811, -84.6464356,
        E'400 m south from downtown La Fortuna, on the way to La Fortuna Waterfall, La Fortuna, Alajuela, Costa Rica',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikearenal@gmail.com',
        E'Depro M2 Carbon Fiber 29',
        E'mountain-bikes',
        E'A carbon 29-inch Depro hardtail for efficient rides around Arenal and La Fortuna. Bike Arenal lists Small, Medium, and Large sizes at 65 USD per day.',
        65.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        E'Small, Medium, Large', NULL::text, E'Carbon fiber',
        E'Beginner, Intermediate',
        'available',
        10.4669811, -84.6464356,
        E'400 m south from downtown La Fortuna, on the way to La Fortuna Waterfall, La Fortuna, Alajuela, Costa Rica',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+bikearenal@gmail.com',
        E'Scott Scale 980',
        E'mountain-bikes',
        E'A Scott Scale 980 hardtail for cross-country riding, gravel connectors, and smoother mountain-bike routes near La Fortuna. Bike Arenal lists the Large size at 65 USD per day.',
        65.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        E'Large', NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        10.4669811, -84.6464356,
        E'400 m south from downtown La Fortuna, on the way to La Fortuna Waterfall, La Fortuna, Alajuela, Costa Rica',
        E'cross-country hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+nosaramtb@gmail.com',
        E'Specialized Turbo Levo SL',
        E'mountain-bikes',
        E'A lightweight Specialized electric trail bike for Nosara singletrack and longer coastal jungle routes. Nosara MTB lists the Turbo Levo SL at 100 USD per day and 500 USD per week.',
        100.00::numeric, NULL::numeric, 500.00::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        9.9470000, -85.6650000,
        E'Gilded Iguana Athletic Center, Playa Guiones north, Nosara, Guanacaste 50206, Costa Rica',
        E'e-mountain bike', NULL::numeric, true
      ),
      (
        E'michaelzick+nosaramtb@gmail.com',
        E'Rocky Mountain Growler Powerplay',
        E'mountain-bikes',
        E'A Rocky Mountain electric hardtail for riders who want pedal assist with stable trail handling. Nosara MTB lists this Growler Powerplay rental at 100 USD per day and 500 USD per week.',
        100.00::numeric, NULL::numeric, 500.00::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        9.9470000, -85.6650000,
        E'Gilded Iguana Athletic Center, Playa Guiones north, Nosara, Guanacaste 50206, Costa Rica',
        E'e-mountain bike hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+nosaramtb@gmail.com',
        E'Rocky Mountain Instinct A50',
        E'mountain-bikes',
        E'A Rocky Mountain Instinct A50 trail bike for technical jungle singletrack and all-day Nosara loops. Nosara MTB lists this model at 100 USD per day and 350 USD per week.',
        100.00::numeric, NULL::numeric, 350.00::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        9.9470000, -85.6650000,
        E'Gilded Iguana Athletic Center, Playa Guiones north, Nosara, Guanacaste 50206, Costa Rica',
        E'full-suspension trail', NULL::numeric, true
      ),
      (
        E'michaelzick+nosaramtb@gmail.com',
        E'Rocky Mountain Fusion 10',
        E'mountain-bikes',
        E'A Rocky Mountain Fusion 10 hardtail for approachable Nosara trail rides and town-to-trail cruising. Nosara MTB lists this sport mountain bike at 30 USD per day and 150 USD per week.',
        30.00::numeric, NULL::numeric, 150.00::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        9.9470000, -85.6650000,
        E'Gilded Iguana Athletic Center, Playa Guiones north, Nosara, Guanacaste 50206, Costa Rica',
        E'hardtail trail', NULL::numeric, true
      ),
      (
        E'michaelzick+buencamino@gmail.com',
        E'Specialized Turbo Levo',
        E'mountain-bikes',
        E'A Specialized Turbo Levo eMTB for Buen Camino Bike Park trails and assisted laps in San Mateo. Buen Camino publishes the rental at 130 USD with availability handled by WhatsApp.',
        130.00::numeric, NULL::numeric, NULL::numeric, 'USD',
        NULL::text, NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        9.9467012, -84.5328223,
        E'Finca Ecologica El Bosque, San Mateo, Alajuela, Costa Rica',
        E'e-mountain bike', NULL::numeric, true
      )
  ),
  inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week, currency_code,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(),
      au.id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week, s.currency_code,
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

  RAISE NOTICE 'Central/South America mountain-bike gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
