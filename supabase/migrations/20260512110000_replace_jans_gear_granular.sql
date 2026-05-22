-- Seed migration: Jans Mountain Outfitters — replace package gear with granular HP ski models
-- Batch: park_city_utah (Jans single-shop replacement)
-- Created: 2026-05-12
-- Replaces: 20260512100100_seed_jans_mountain_outfitters_gear.sql (5 package rows)
-- Depends on: 20260512100000_seed_jans_mountain_outfitters_shop.sql (apply shop first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f migrations/20260512110000_replace_jans_gear_granular.sql
-- Do NOT use supabase db push or supabase migration up.
--
-- This migration:
--   1. Deletes the 5 package-level equipment rows (and their images) for Jans Mountain Outfitters
--   2. Inserts 24 granular High Performance ski models (15 men's/unisex + 9 women's) at $59/day
--
-- Image URLs per AGENTS.md mapping:
--   skis primary:   https://images.pexels.com/photos/848699/pexels-photo-848699.jpeg
--   skis secondary: https://images.pexels.com/photos/36084973/pexels-photo-36084973.jpeg
--
-- Price basis: jans.com/pages/rent-high-performance-skis-high-performance-package
--   All 24 models are listed on the Jans HP rental page; walk-in rate $59/day (retrieved 2026-05-12).
--   Sport Package and Kids' Sport Package pages list no individual models — excluded per granular standard.

-- =============================================
-- STEP 1: DELETE package-level rows for Jans Mountain Outfitters
-- user_id: 2856048f-f960-43c1-91c9-cfa17e39bdd6
-- Names to remove: Sport Package, Women's Sport Package, High Performance Package,
--                  Women's High Performance Package, Kids' Sport Package
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  v_images_deleted int;
  v_equipment_deleted int;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+jansmountainoutfittersparkcity@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: michaelzick+jansmountainoutfittersparkcity@gmail.com';
  END IF;

  -- Delete images first (FK constraint)
  WITH target_equipment AS (
    SELECT id FROM public.equipment
    WHERE user_id = v_user_id
      AND name IN (
        'Sport Package',
        'Women''s Sport Package',
        'High Performance Package',
        'Women''s High Performance Package',
        'Kids'' Sport Package'
      )
  )
  DELETE FROM public.equipment_images
  WHERE equipment_id IN (SELECT id FROM target_equipment);

  GET DIAGNOSTICS v_images_deleted = ROW_COUNT;

  -- Delete equipment rows
  DELETE FROM public.equipment
  WHERE user_id = v_user_id
    AND name IN (
      'Sport Package',
      'Women''s Sport Package',
      'High Performance Package',
      'Women''s High Performance Package',
      'Kids'' Sport Package'
    );

  GET DIAGNOSTICS v_equipment_deleted = ROW_COUNT;

  RAISE NOTICE 'Jans package cleanup: equipment_deleted=%, images_deleted=%',
    v_equipment_deleted, v_images_deleted;

END $$;


-- =============================================
-- STEP 2: INSERT 24 granular High Performance ski models
-- EQUIPMENT: Jans Mountain Outfitters (Park City, UT) — skis (HP models)
-- Email: michaelzick+jansmountainoutfittersparkcity@gmail.com
-- Price basis: jans.com/pages/rent-high-performance-skis-high-performance-package
--   Walk-in rate $59/day for all HP models, retrieved 2026-05-12.
-- Coordinates sourced from Google Maps link embedded in jans.com location page.
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'michaelzick+jansmountainoutfittersparkcity@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: michaelzick+jansmountainoutfittersparkcity@gmail.com';
  END IF;

  CREATE TEMP TABLE _seed_equipment_jans_hp (
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

  INSERT INTO _seed_equipment_jans_hp VALUES
  -- ---- MEN'S / UNISEX HIGH PERFORMANCE MODELS ----
  (
    'Atomic Redster Q7.8',
    'skis',
    'Race-inspired all-mountain carver with a 72mm waist. Built for skiers who demand maximum edge grip and precision on groomed hardpack. Stiff, damp construction cuts through variable snow with authority. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Mantra 84',
    'skis',
    'Powerful frontside charger with an 84mm waist and titanal-reinforced construction. Damps vibrations at high speed while remaining instantly responsive on firm snow. A legendary choice for on-piste performance. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Maverick 88 CTI',
    'skis',
    'All-mountain ski with an 88mm waist and Carbon Titanium construction for a rare combination of low weight and powerful edge hold. Versatile across groomed runs and variable snow. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Head Kore 88 TI',
    'skis',
    'Featherlight all-mountain ski with Graphene construction and a titanal reinforcement layer at 88mm waist. Agile and playful on the mountain yet composed at high speeds. Confident across groomed, crud, and light powder. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Armada ARV 94',
    'skis',
    'Twin-tip all-mountain freeride ski at 94mm waist. Surf-inspired shape and playful flex make it at home on groomed runs, off-piste terrain, and natural features. A versatile choice for expressive, creative skiing. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Bent 100',
    'skis',
    'All-mountain freeride ski at 100mm waist with a rocker/camber/rocker profile. Handles mixed snow conditions, powder, and groomed terrain with equal confidence. A true quiver-of-one for Park City''s diverse conditions. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Mantra M7',
    'skis',
    'Seven-layer titanal construction at 96mm waist makes this the gold standard for explosive edge grip and dampness across the entire mountain. Powerful and precise from hardpack groomers to off-piste exploration. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Revolt 101',
    'skis',
    'Twin-tip all-mountain freestyle ski at 101mm waist. Park-influenced shape with rocker at tip and tail for playful, energetic skiing across the entire mountain — from groomed runs to natural features. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Fischer Ranger 102',
    'skis',
    'All-mountain freeride ski at 102mm waist with progressive tip rocker and camber underfoot. Delivers reliable float in powder while maintaining edge grip on groomed runs. Confident in the variable Park City conditions. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Maverick 105 CTI',
    'skis',
    'Big-mountain all-mountain ski at 105mm waist using Carbon Titanium construction. Exceptionally stable at high speeds across variable terrain and off-piste snow. Pairs power with composure for adventurous skiers. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Stockli Stormrider 105',
    'skis',
    'Premium Swiss-crafted freeride ski at 105mm waist. Stockli''s legendary build quality delivers exceptional edge hold, a smooth progressive flex, and effortless float in deeper snow. A standout premium choice for refined freeriders. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Bent 110',
    'skis',
    'Powder-oriented freeride ski at 110mm waist with early-rise tip and tail rocker. Keeps the ski floating in deep snow with minimal effort. The go-to pick on big storm days when Park City''s famous light powder fills the mountain. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Armada ARV 112',
    'skis',
    'Wide all-mountain freestyle ski at 112mm waist. Twin-tip construction with playful flex designed for big-mountain exploration, steep terrain, and creative arc-to-arc skiing. Built to thrive wherever the mountain takes you. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Bent 120',
    'skis',
    'Big-mountain powder ski at 120mm waist with a full rocker profile that maximizes float in deep powder. Purpose-built for resort powder stashes and backcountry-style lines. At its best on deep days at Park City. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Revolt 121',
    'skis',
    'Freeride twin-tip at 121mm waist for maximum float in deep powder. Progressive rocker keeps the tip up while still allowing the ski to engage for powerful turns in variable and heavy snow. An extreme powder tool. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Adult; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  -- ---- WOMEN'S HIGH PERFORMANCE MODELS ----
  (
    'Atomic Cloud 9 W',
    'skis',
    'Lightweight women''s all-mountain ski with a playful, forgiving flex. Designed for confident intermediate-to-advanced women skiers who want easy turn initiation and all-terrain versatility. Smooth on groomed runs and capable in variable snow. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Kastle Marble 84 W',
    'skis',
    'Austrian-made premium women''s all-mountain ski at 84mm waist. Kastle''s legendary build quality combined with women''s-specific geometry delivers powerful precision on all terrain — from hardpack groomers to off-piste exploration. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Fischer Ranger 84 W',
    'skis',
    'Women''s all-mountain ski at 84mm waist built for versatility. Handles groomed runs, variable snow, and light off-piste with equal confidence. A reliable daily driver for strong women skiers seeking a balanced, dependable ski. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Mantra 84 W',
    'skis',
    'Women''s version of the iconic Mantra with titanal reinforcement at 84mm waist. Powerful, precise, and damp on frontside terrain. Built for women who demand aggressive on-piste performance with confident edge hold on hardpack. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Atomic Maven 88 CTI W',
    'skis',
    'Women''s all-mountain ski at 88mm waist with Carbon Titanium construction. Lightweight build paired with precise edge hold allows confident skiing across all conditions. A premium choice for women who want both performance and versatility. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Volkl Kenja 88 W',
    'skis',
    'Women''s all-mountain ski at 88mm waist. Energetic and playful with titanal support for stability at higher speeds. Suited for strong women skiers who want a lively, responsive ride across groomed runs and variable terrain. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'K2 Mindbender 89TI W',
    'skis',
    'Women''s all-mountain titanal ski at 89mm waist. Strikes an ideal balance between power and approachability — confident on hardpack groomers and capable in softer off-piste snow. A great all-day, all-condition choice for advanced women skiers. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'K2 Omen 90 W',
    'skis',
    'Women''s precision all-mountain ski at 90mm waist with titanal construction. Delivers impressive stability and edge grip for aggressive women skiers who want to charge on all terrain types. Precise, powerful, and composed. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
    NULL, NULL, true
  ),
  (
    'Fischer Ranger 96 W',
    'skis',
    'Women''s all-mountain freeride ski at 96mm waist. Progressive tip rocker allows easy float in softer snow while camber underfoot maintains grip on groomed terrain. Versatile and capable across Park City''s varied conditions. Includes boots and poles.',
    59.00, NULL, NULL,
    'Skis, Boots, Poles; Women''s sizing; multiple lengths available',
    NULL, NULL,
    'Beginner, Intermediate, Advanced',
    'available',
    40.6569, -111.5063,
    '1600 Park Ave, Park City, UT 84060',
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
      gen_random_uuid(),
      v_user_id,
      s.name, s.category, s.description,
      s.price_per_day, s.price_per_hour, s.price_per_week,
      s.size, s.weight, s.material, s.suitable_skill_level, s.status,
      s.location_lat, s.location_lng, s.location_address, s.subcategory,
      s.damage_deposit, s.visible_on_map
    FROM _seed_equipment_jans_hp s
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = v_user_id
        AND e.name = s.name
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

  RAISE NOTICE 'Jans HP skis inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

END $$;
