-- Seed migration: Bike Emporium — mountain bike gear (Scottsdale, AZ)
-- Batch: arizona_mountain_bikes
-- Created: 2026-05-12
-- Depends on: 20260512130000_seed_arizona_mountain_bikes_shops.sql
-- Gear basis: bikeemporium.com/rentals (retrieved 2026-05-12)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512130200_seed_bike_emporium_gear.sql"
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
  WHERE email = 'michaelzick+bikeemporiumscottsdale@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+bikeemporiumscottsdale@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_be_bikes (
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

  INSERT INTO _seed_be_bikes VALUES
  (
    'Cannondale Habit Aluminum',
    'mountain-bikes',
    E'Full-suspension trail bike — lightweight aluminum frame handles tight trails and steep drops with ease. Available in SM, MED, LARGE, and XL. Helmet, water bottle cage, and lock included. $50 non-refundable deposit required to hold reservation; call (480) 991-5430 or email info@bikeemporium.com.',
    85.00, NULL, NULL,
    'Aluminum; SM, MED, LARGE, XL; 2023 model year',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    33.5027, -111.9101,
    '8443 E. McDonald Dr, Scottsdale, AZ 85250',
    NULL, 50.00, true
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
    FROM _seed_be_bikes s
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

  RAISE NOTICE 'Bike Emporium gear: inserted=%, primary_images=%, secondary_images=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
