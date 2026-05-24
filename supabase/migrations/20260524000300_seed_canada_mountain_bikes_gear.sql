-- Seed migration: Canada mountain-bike gear
-- Batch: canada_ski_snowboard_surf_mtb
-- Created: 2026-05-24
-- Depends on: 20260524000000_seed_canada_ski_snowboard_surf_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260524000300_seed_canada_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Mountain-bike primary image:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
-- Mountain-bike secondary image: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Canada accepted mountain-bike shops
-- Price basis: official Canada rental pages retrieved 2026-05-24.
-- Coordinates sourced from Nominatim street-level geocodes for each shop address.
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
      (E'michaelzick+bigwhitebikepark@gmail.com'),
      (E'michaelzick+coastalculturesportswhistler@gmail.com'),
      (E'michaelzick+crosscountryconnectionwhistler@gmail.com'),
      (E'michaelzick+cyclebcvancouver@gmail.com'),
      (E'michaelzick+dialedincyclingsquamish@gmail.com'),
      (E'michaelzick+essentialcyclesnorthvancouver@gmail.com'),
      (E'michaelzick+gearhubsportsfernie@gmail.com'),
      (E'michaelzick+lynnvalleybikesnorthvancouver@gmail.com'),
      (E'michaelzick+montsainteannesportsalpins@gmail.com'),
      (E'michaelzick+trailbicyclescourtenay@gmail.com'),
      (E'michaelzick+valleebrasdunordshannahan@gmail.com'),
      (E'michaelzick+whistlersportsrentals@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH seed_equipment (seed_email, name, category, description, price_per_day, price_per_hour, price_per_week, size, weight, material, suitable_skill_level, status, location_lat, location_lng, location_address, subcategory, damage_deposit, visible_on_map) AS (
    VALUES
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Altitude',
        E'mountain-bikes',
        E'The Rocky Mountain Altitude is a model-level enduro rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        89.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Element',
        E'mountain-bikes',
        E'The Rocky Mountain Element is a model-level trail rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        89.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Instinct',
        E'mountain-bikes',
        E'The Rocky Mountain Instinct is a model-level trail rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        89.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Slayer',
        E'mountain-bikes',
        E'The Rocky Mountain Slayer is a model-level downhill rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        89.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Devinci Chainsaw',
        E'mountain-bikes',
        E'The Devinci Chainsaw is a model-level downhill rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        89.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Instinct Powerplay',
        E'mountain-bikes',
        E'The Rocky Mountain Instinct Powerplay is a model-level e-mountain-bike rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        129.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+gearhubsportsfernie@gmail.com',
        E'Rocky Mountain Fusion Powerplay',
        E'mountain-bikes',
        E'The Rocky Mountain Fusion Powerplay is a model-level e-mountain-bike rental listed by GearHub Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        99.99::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        49.5020785, -115.0616403,
        E'401 1st Ave, Fernie, BC V0B 1M0',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+coastalculturesportswhistler@gmail.com',
        E'Santa Cruz Nomad',
        E'mountain-bikes',
        E'The Santa Cruz Nomad is a model-level enduro rental listed by Coastal Culture Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        107.10::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.0951007, -122.9894654,
        E'2010 London Lane, Whistler, BC V8E 0A6',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+coastalculturesportswhistler@gmail.com',
        E'Santa Cruz V10',
        E'mountain-bikes',
        E'The Santa Cruz V10 is a model-level downhill rental listed by Coastal Culture Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        190.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.0951007, -122.9894654,
        E'2010 London Lane, Whistler, BC V8E 0A6',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+coastalculturesportswhistler@gmail.com',
        E'Rocky Mountain Instinct BC Alloy',
        E'mountain-bikes',
        E'The Rocky Mountain Instinct BC Alloy is a model-level all-mountain rental listed by Coastal Culture Sports. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        71.10::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.0951007, -122.9894654,
        E'2010 London Lane, Whistler, BC V8E 0A6',
        E'all-mountain', NULL::numeric, true
      ),
      (
        E'michaelzick+whistlersportsrentals@gmail.com',
        E'Norco Sight Gen 5',
        E'mountain-bikes',
        E'The Norco Sight Gen 5 is a model-level enduro rental listed by Whistler Sports Rentals. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        111.60::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1151411, -122.9567290,
        E'4205 Village Square, Whistler, BC V8E 1H4',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+whistlersportsrentals@gmail.com',
        E'Giant Reign SE Custom',
        E'mountain-bikes',
        E'The Giant Reign SE Custom is a model-level enduro rental listed by Whistler Sports Rentals. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        111.60::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1151411, -122.9567290,
        E'4205 Village Square, Whistler, BC V8E 1H4',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+whistlersportsrentals@gmail.com',
        E'Norco Shore Standard Downhill',
        E'mountain-bikes',
        E'The Norco Shore Standard Downhill is a model-level downhill rental listed by Whistler Sports Rentals. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        129.60::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.1151411, -122.9567290,
        E'4205 Village Square, Whistler, BC V8E 1H4',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+whistlersportsrentals@gmail.com',
        E'Norco Shore Performance Downhill',
        E'mountain-bikes',
        E'The Norco Shore Performance Downhill is a model-level downhill rental listed by Whistler Sports Rentals. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        158.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.1151411, -122.9567290,
        E'4205 Village Square, Whistler, BC V8E 1H4',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+whistlersportsrentals@gmail.com',
        E'Giant Glory Advanced Custom',
        E'mountain-bikes',
        E'The Giant Glory Advanced Custom is a model-level downhill rental listed by Whistler Sports Rentals. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        177.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.1151411, -122.9567290,
        E'4205 Village Square, Whistler, BC V8E 1H4',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Norco Sight C',
        E'mountain-bikes',
        E'The Norco Sight C is a model-level trail rental listed by Cross Country Connection. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Norco Sight C VLT',
        E'mountain-bikes',
        E'The Norco Sight C VLT is a model-level e-mountain-bike rental listed by Cross Country Connection. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        159.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+crosscountryconnectionwhistler@gmail.com',
        E'Norco Aurum A7.1',
        E'mountain-bikes',
        E'The Norco Aurum A7.1 is a model-level downhill rental listed by Cross Country Connection. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        159.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        50.1232691, -122.9506367,
        E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+bigwhitebikepark@gmail.com',
        E'Trek Session 8',
        E'mountain-bikes',
        E'The Trek Session 8 is a model-level downhill rental listed by Big White Bike Park. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        160.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.7379086, -118.9459084,
        E'5315 Big White Road, Big White Mountain, BC V1P 1P3',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+bigwhitebikepark@gmail.com',
        E'Trek Remedy 8',
        E'mountain-bikes',
        E'The Trek Remedy 8 is a model-level enduro rental listed by Big White Bike Park. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        140.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.7379086, -118.9459084,
        E'5315 Big White Road, Big White Mountain, BC V1P 1P3',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Marin Alpine Trail E1 Bosch',
        E'mountain-bikes',
        E'The Marin Alpine Trail E1 Bosch is a model-level e-mountain-bike rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        140.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Marin Rift Zone EL1',
        E'mountain-bikes',
        E'The Marin Rift Zone EL1 is a model-level e-mountain-bike rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        140.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Marin Alpine Trail XR',
        E'mountain-bikes',
        E'The Marin Alpine Trail XR is a model-level enduro rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Marin Rift Zone',
        E'mountain-bikes',
        E'The Marin Rift Zone is a model-level trail rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        110.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Cube Stereo 177 Bosch',
        E'mountain-bikes',
        E'The Cube Stereo 177 Bosch is a model-level e-mountain-bike rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        199.00::numeric, NULL::numeric, NULL::numeric,
        E'Medium, Large',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+dialedincyclingsquamish@gmail.com',
        E'Kona Mahuna',
        E'mountain-bikes',
        E'The Kona Mahuna is a model-level hardtail rental listed by Dialed In Cycling. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large',
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        49.7680282, -123.1363713,
        E'1796 Depot Rd, Squamish, BC V8B 0P6',
        E'hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+essentialcyclesnorthvancouver@gmail.com',
        E'Ibis Ripmo V3',
        E'mountain-bikes',
        E'The Ibis Ripmo V3 is a model-level enduro rental listed by Essential Cycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        115.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.3072818, -123.0373803,
        E'305 Mansfield Place, North Vancouver, BC V7J 1E4',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+essentialcyclesnorthvancouver@gmail.com',
        E'Marin Alpine Trail',
        E'mountain-bikes',
        E'The Marin Alpine Trail is a model-level enduro rental listed by Essential Cycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        95.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.3072818, -123.0373803,
        E'305 Mansfield Place, North Vancouver, BC V7J 1E4',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+essentialcyclesnorthvancouver@gmail.com',
        E'Ibis Ripmo AF',
        E'mountain-bikes',
        E'The Ibis Ripmo AF is a model-level enduro rental listed by Essential Cycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        95.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.3072818, -123.0373803,
        E'305 Mansfield Place, North Vancouver, BC V7J 1E4',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+essentialcyclesnorthvancouver@gmail.com',
        E'Marin Rift Zone EL1',
        E'mountain-bikes',
        E'The Marin Rift Zone EL1 is a model-level e-mountain-bike rental listed by Essential Cycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        165.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.3072818, -123.0373803,
        E'305 Mansfield Place, North Vancouver, BC V7J 1E4',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+lynnvalleybikesnorthvancouver@gmail.com',
        E'Rocky Mountain Altitude',
        E'mountain-bikes',
        E'The Rocky Mountain Altitude is a model-level enduro rental listed by Lynn Valley Bikes. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        125.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.3366003, -123.0377266,
        E'3028 Mountain Hwy, North Vancouver, BC V7J 2P1',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+lynnvalleybikesnorthvancouver@gmail.com',
        E'Marin Bobcat Trail',
        E'mountain-bikes',
        E'The Marin Bobcat Trail is a model-level hardtail rental listed by Lynn Valley Bikes. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        49.3366003, -123.0377266,
        E'3028 Mountain Hwy, North Vancouver, BC V7J 2P1',
        E'hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+cyclebcvancouver@gmail.com',
        E'Norco Sight',
        E'mountain-bikes',
        E'The Norco Sight is a model-level trail rental listed by Cycle BC Vancouver. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        90.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.2658963, -123.1030648,
        E'73 East 6th Avenue, Vancouver, BC V5T 1J3',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+cyclebcvancouver@gmail.com',
        E'Norco Sight VLT',
        E'mountain-bikes',
        E'The Norco Sight VLT is a model-level e-mountain-bike rental listed by Cycle BC Vancouver. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        125.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.2658963, -123.1030648,
        E'73 East 6th Avenue, Vancouver, BC V5T 1J3',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+trailbicyclescourtenay@gmail.com',
        E'Norco Sight VLT TQ C2',
        E'mountain-bikes',
        E'The Norco Sight VLT TQ C2 is a model-level e-mountain-bike rental listed by Trail Bicycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        125.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.6877188, -124.9938260,
        E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+trailbicyclescourtenay@gmail.com',
        E'Trek Fuel+ EX 9.8 XT',
        E'mountain-bikes',
        E'The Trek Fuel+ EX 9.8 XT is a model-level e-mountain-bike rental listed by Trail Bicycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        125.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.6877188, -124.9938260,
        E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+trailbicyclescourtenay@gmail.com',
        E'Mondraker Dune RR',
        E'mountain-bikes',
        E'The Mondraker Dune RR is a model-level e-mountain-bike rental listed by Trail Bicycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        125.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        49.6877188, -124.9938260,
        E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+trailbicyclescourtenay@gmail.com',
        E'Trek Fuel EX 9.8 XT',
        E'mountain-bikes',
        E'The Trek Fuel EX 9.8 XT is a model-level trail rental listed by Trail Bicycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        100.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.6877188, -124.9938260,
        E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+trailbicyclescourtenay@gmail.com',
        E'Ibis Ripmo V3',
        E'mountain-bikes',
        E'The Ibis Ripmo V3 is a model-level enduro rental listed by Trail Bicycles. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        100.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        49.6877188, -124.9938260,
        E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
        E'enduro', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Genius E-Ride',
        E'mountain-bikes',
        E'The Scott Genius E-Ride is a model-level e-mountain-bike rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        190.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Strike E-Ride',
        E'mountain-bikes',
        E'The Scott Strike E-Ride is a model-level e-mountain-bike rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        190.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Gambler',
        E'mountain-bikes',
        E'The Scott Gambler is a model-level downhill rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        265.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Ransom',
        E'mountain-bikes',
        E'The Scott Ransom is a model-level downhill rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        265.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced, Expert',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'downhill', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Genius',
        E'mountain-bikes',
        E'The Scott Genius is a model-level trail rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'trail', NULL::numeric, true
      ),
      (
        E'michaelzick+montsainteannesportsalpins@gmail.com',
        E'Scott Scale',
        E'mountain-bikes',
        E'The Scott Scale is a model-level hardtail rental listed by Mont-Sainte-Anne Sports Alpins. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        120.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate',
        'available',
        47.0734625, -70.9049340,
        E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
        E'hardtail', NULL::numeric, true
      ),
      (
        E'michaelzick+valleebrasdunordshannahan@gmail.com',
        E'Devinci E-Troy',
        E'mountain-bikes',
        E'The Devinci E-Troy is a model-level e-mountain-bike rental listed by Vallee Bras-du-Nord Shannahan. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        135.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0748395, -71.8903263,
        E'2180 Rang Saguenay, Saint-Raymond, QC G3L 3G3',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+valleebrasdunordshannahan@gmail.com',
        E'Devinci E-Troy Lite',
        E'mountain-bikes',
        E'The Devinci E-Troy Lite is a model-level e-mountain-bike rental listed by Vallee Bras-du-Nord Shannahan. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        135.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0748395, -71.8903263,
        E'2180 Rang Saguenay, Saint-Raymond, QC G3L 3G3',
        E'e-mountain-bike', NULL::numeric, true
      ),
      (
        E'michaelzick+valleebrasdunordshannahan@gmail.com',
        E'Devinci Troy',
        E'mountain-bikes',
        E'The Devinci Troy is a model-level trail rental listed by Vallee Bras-du-Nord Shannahan. It is a source-backed mountain-bike option with official day pricing for Canadian trail, bike-park, or guided rental use.',
        75.00::numeric, NULL::numeric, NULL::numeric,
        E'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        E'Beginner, Intermediate, Advanced',
        'available',
        47.0748395, -71.8903263,
        E'2180 Rang Saguenay, Saint-Raymond, QC G3L 3G3',
        E'trail', NULL::numeric, true
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
    SELECT i.id, 'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg', 0, true FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 0)
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT i.id, 'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg', 1, false FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM public.equipment_images ei WHERE ei.equipment_id = i.id AND ei.display_order = 1)
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Canada mountain-bike inserted=%, primary_images_added=%, secondary_images_added=%', v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
