-- Seed migration: Vermont skis gear
-- Batch: vermont_ski_snowboard_mtb
-- Created: 2026-05-22
-- Depends on: 20260522190000_seed_vermont_ski_snowboard_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260522190100_seed_vermont_skis_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Skis primary image:   https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg
-- Skis secondary image: https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg

-- =============================================
-- EQUIPMENT: The Boot Pro Ski and Bike Shop (Ludlow, VT) - skis
-- Email: michaelzick+thebootproludlow@gmail.com
-- Price basis: The Boot Pro official demo ski page, daily adult recreational demo rate, retrieved 2026-05-22.
-- Coordinates sourced from Nominatim street-level geocode for 44 Pond Street, Ludlow, VT 05149.
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
      ('michaelzick+thebootproludlow@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.email = planned.seed_email
  )
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (
    seed_email,
    name,
    category,
    description,
    price_per_day,
    price_per_hour,
    price_per_week,
    size,
    weight,
    material,
    suitable_skill_level,
    status,
    location_lat,
    location_lng,
    location_address,
    subcategory,
    damage_deposit,
    visible_on_map
  ) AS (
    VALUES
      (
        'michaelzick+thebootproludlow@gmail.com',
        'Atomic Maverick 115 CTI',
        'skis',
        'The Atomic Maverick 115 CTI is a freeride-oriented all-mountain ski for deep snow and mixed off-piste terrain. Its wide platform and powerful construction support confident turns in variable Vermont conditions. It is best suited to advanced riders looking for a directional demo ski with stability at speed.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.3992888, -72.7066947,
        '44 Pond Street, Ludlow, VT 05149',
        'freeride', NULL::numeric, true
      ),
      (
        'michaelzick+thebootproludlow@gmail.com',
        'Atomic Maven 84',
        'skis',
        'The Atomic Maven 84 is an approachable all-mountain ski built for groomers, mixed snow, and everyday resort laps. Its lighter construction favors easy turn initiation while keeping enough edge hold for firm surfaces. It fits newer through advancing skiers who want a composed frontside demo option.',
        70.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.3992888, -72.7066947,
        '44 Pond Street, Ludlow, VT 05149',
        'all-mountain', NULL::numeric, true
      )
  ),
  resolved AS (
    SELECT
      au.id AS user_id,
      s.*
    FROM seed_equipment s
    JOIN auth.users au ON au.email = s.seed_email
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
      r.user_id,
      r.name, r.category, r.description,
      r.price_per_day, r.price_per_hour, r.price_per_week,
      r.size, r.weight, r.material, r.suitable_skill_level, r.status,
      r.location_lat, r.location_lng, r.location_address, r.subcategory,
      r.damage_deposit, r.visible_on_map
    FROM resolved r
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = r.user_id
        AND e.name = r.name
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT
      i.id,
      'https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg',
      0,
      true
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id
        AND ei.display_order = 0
    )
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT
      i.id,
      'https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg',
      1,
      false
    FROM inserted i
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_images ei
      WHERE ei.equipment_id = i.id
        AND ei.display_order = 1
    )
    RETURNING equipment_id
  )
  SELECT
    (SELECT count(*) FROM inserted),
    (SELECT count(*) FROM ins1),
    (SELECT count(*) FROM ins2)
  INTO
    v_equipment_inserted,
    v_primary_images_added,
    v_secondary_images_added;

  RAISE NOTICE 'Vermont skis inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
