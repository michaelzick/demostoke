-- Seed migration: Vermont mountain-bike gear
-- Batch: vermont_ski_snowboard_mtb
-- Created: 2026-05-22
-- Depends on: 20260522190000_seed_vermont_ski_snowboard_mtb_shops.sql (apply shops first)
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260522190200_seed_vermont_mountain_bikes_gear.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Gear batches are category-homogeneous.
-- Mountain-bikes primary image:   https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg
-- Mountain-bikes secondary image: https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg

-- =============================================
-- EQUIPMENT: Vermont accepted mountain-bike shops
-- Price basis: official Vermont rental/demo pages retrieved 2026-05-22.
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
      ('michaelzick+basecampkillington@gmail.com'),
      ('michaelzick+alpinebikeworkskillington@gmail.com'),
      ('michaelzick+ranchcampstowe@gmail.com'),
      ('michaelzick+ranchcampwoodstock@gmail.com'),
      ('michaelzick+thebootproludlow@gmail.com'),
      ('michaelzick+burkemountainbikeshop@gmail.com')
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
        'michaelzick+basecampkillington@gmail.com',
        'Pivot Switchblade Pro XO',
        'mountain-bikes',
        'The Pivot Switchblade Pro XO is a versatile full-suspension trail bike for all-day Killington-area rides. Its balanced travel profile works well for technical singletrack, rolling climbs, and confident descents. It is a strong choice for intermediate riders who want one premium demo bike for mixed terrain.',
        120.00::numeric, NULL::numeric, NULL::numeric,
        'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+basecampkillington@gmail.com',
        'Pivot Firebird Pro XO',
        'mountain-bikes',
        'The Pivot Firebird Pro XO is a long-travel enduro bike built for steep trails and bike-park speed. It gives riders a composed platform for rough descents while retaining enough efficiency for pedal-accessed terrain. It is best for confident riders moving into more aggressive lines.',
        120.00::numeric, NULL::numeric, NULL::numeric,
        'Small, Medium, Large',
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'enduro', NULL::numeric, true
      ),
      (
        'michaelzick+basecampkillington@gmail.com',
        'Transition TR11',
        'mountain-bikes',
        'The Transition TR11 is a downhill rental for lift-served park riding. Its dedicated gravity setup is aimed at riders spending the day on steeper descents and repeated bike-park laps. It fits advanced riders who want maximum control on rough terrain.',
        150.00::numeric, NULL::numeric, NULL::numeric,
        'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'downhill', NULL::numeric, true
      ),
      (
        'michaelzick+basecampkillington@gmail.com',
        'Transition Bottlerocket',
        'mountain-bikes',
        'The Transition Bottlerocket is a freeride-focused rental for riders who want a playful bike with downhill capability. It suits jump lines, park laps, and rougher descents where extra travel adds confidence. It is best matched to intermediate and advanced riders.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        'Small, Medium, Large, XL',
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'freeride', NULL::numeric, true
      ),
      (
        'michaelzick+basecampkillington@gmail.com',
        'Norco Sight VLT TQ',
        'mountain-bikes',
        'The Norco Sight VLT TQ is an e-mountain-bike rental for riders who want motor support on longer trail days. Its mixed-wheel trail platform favors technical climbing, sustained descents, and extended exploration. It is a useful option for intermediate riders looking to cover more terrain.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+basecampkillington@gmail.com',
        'Norco Sight VLT Bosch',
        'mountain-bikes',
        'The Norco Sight VLT Bosch is an e-mountain-bike rental for riders who want a powerful pedal-assist trail platform. It is built for mixed climbing and descending where support helps extend the day. It fits progressing trail riders who want help reaching more Vermont singletrack.',
        130.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6686148, -72.8030764,
        '2363 Route 4, Killington, VT 05751',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+alpinebikeworkskillington@gmail.com',
        'GT Fury Carbon Pro',
        'mountain-bikes',
        'The GT Fury Carbon Pro is a dedicated downhill bike for Killington Bike Park laps. Its high-pivot gravity layout is designed for fast descents, braking bumps, and repeated lift-served runs. It is best for riders with park experience who want a stable downhill platform.',
        120.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.6677035, -72.8041879,
        '2326 US Route 4, Killington, VT 05751',
        'downhill', NULL::numeric, true
      ),
      (
        'michaelzick+alpinebikeworkskillington@gmail.com',
        'GT Force Carbon Pro',
        'mountain-bikes',
        'The GT Force Carbon Pro is an enduro rental for local trails and bike-park days. Its long-travel suspension gives riders control on rough descents while staying practical for varied terrain. It works for a wide range of riders who want one aggressive demo bike.',
        120.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6677035, -72.8041879,
        '2326 US Route 4, Killington, VT 05751',
        'enduro', NULL::numeric, true
      ),
      (
        'michaelzick+alpinebikeworkskillington@gmail.com',
        'Giant Reign SX Mullet',
        'mountain-bikes',
        'The Giant Reign SX Mullet is a downhill-focused rental for lift-served riding. Its mixed-wheel setup and long-travel suspension are aimed at riders who want stability with responsive handling. It is best for intermediate and advanced riders at Killington Bike Park.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        43.6677035, -72.8041879,
        '2326 US Route 4, Killington, VT 05751',
        'downhill', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Norco Fluid Alloy',
        'mountain-bikes',
        'The Norco Fluid Alloy is a standard full-suspension mountain-bike rental for Stowe trail riding. It gives newer and intermediate riders a predictable platform for singletrack, climbs, and rolling descents. It is a practical choice for riders stepping up from hardtails into full suspension.',
        85.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'full-suspension', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Ibis Ripmo AF',
        'mountain-bikes',
        'The Ibis Ripmo AF is a premium full-suspension rental for bigger trail rides around Stowe. Its all-mountain character gives riders a confident feel on technical climbs and rougher descents. It fits intermediate riders who want a sturdy, capable demo platform.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'all-mountain', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Norco Revolver C1',
        'mountain-bikes',
        'The Norco Revolver C1 is an elite full-suspension demo bike with a fast cross-country feel. It favors efficient pedaling, quick handling, and longer trail days where speed matters. It is well matched to riders who want a lighter premium mountain-bike rental.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'cross-country', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Yeti SB140',
        'mountain-bikes',
        'The Yeti SB140 is an elite trail bike for riders who want a lively all-mountain demo. It balances efficient pedaling with confident descending on varied Vermont singletrack. It suits intermediate and advanced riders looking for a premium trail feel.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Ibis Ripley SL',
        'mountain-bikes',
        'The Ibis Ripley SL is an elite lightweight trail bike for fast singletrack and longer rides. Its efficient ride feel helps riders cover ground without giving up full-suspension control. It is a strong fit for intermediate riders who value speed and precision.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Yeti MTe',
        'mountain-bikes',
        'The Yeti MTe is an e-mountain-bike rental for riders who want premium pedal assist on Stowe terrain. It supports longer loops, repeated climbs, and mixed technical trail days. It is useful for intermediate and advanced riders who want more range from a demo ride.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Norco Fluid VLT',
        'mountain-bikes',
        'The Norco Fluid VLT is an e-mountain-bike rental with full-suspension trail capability. It gives riders extra support for climbs while staying composed on descents. It is a good fit for riders exploring more Stowe mileage in a single rental window.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampstowe@gmail.com',
        'Trek Fuel EXe',
        'mountain-bikes',
        'The Trek Fuel EXe is an e-mountain-bike rental with a natural trail-bike ride feel. It adds quiet support for longer climbs while keeping handling familiar on rolling singletrack. It suits riders who want a lighter-feeling assist bike for Stowe trails.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        44.4699332, -72.6879014,
        '311 Mountain Road, Stowe, VT 05672',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Ibis Ripley AF',
        'mountain-bikes',
        'The Ibis Ripley AF is a premium full-suspension rental for Woodstock trail riding. It gives riders an efficient and stable platform for local singletrack, rolling terrain, and technical sections. It works well for intermediate riders looking for a capable trail demo.',
        99.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Yeti SB140',
        'mountain-bikes',
        'The Yeti SB140 is an elite trail demo for riders who want a premium all-mountain bike in Woodstock. It balances responsive handling with confident descending on varied terrain. It fits intermediate and advanced riders looking for a lively full-suspension ride.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Norco Revolver',
        'mountain-bikes',
        'The Norco Revolver is an elite full-suspension demo bike with a fast and efficient trail personality. It is well suited to longer loops, quick climbs, and flowy Woodstock singletrack. It gives riders a lighter premium option for cross-country-leaning rides.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'cross-country', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Ibis Ripley SL',
        'mountain-bikes',
        'The Ibis Ripley SL is an elite lightweight trail rental for riders who value speed and precision. It is built for efficient pedaling while still offering full-suspension control on rougher sections. It suits intermediate and advanced riders exploring Woodstock trails.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Yeti MTe',
        'mountain-bikes',
        'The Yeti MTe is an e-mountain-bike rental for riders who want premium pedal assist on Vermont trails. It helps extend longer rides while keeping a confident trail-bike feel. It is a good option for intermediate riders who want extra range around Woodstock.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Norco Fluid VLT',
        'mountain-bikes',
        'The Norco Fluid VLT is an e-mountain-bike rental for riders seeking support on climbs and control on descents. Its full-suspension trail focus makes it useful for mixed Woodstock terrain. It fits riders who want an approachable assist bike for longer outings.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+ranchcampwoodstock@gmail.com',
        'Trek Fuel EXe',
        'mountain-bikes',
        'The Trek Fuel EXe is an e-mountain-bike rental that keeps a natural-feeling trail-bike character. It adds discreet support for longer rides and repeated climbs without overwhelming handling. It suits riders who want an efficient assist option for Woodstock singletrack.',
        129.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.6280004, -72.5067600,
        '431 Woodstock Road, Woodstock, VT 05091',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+thebootproludlow@gmail.com',
        'Specialized Stumpjumper',
        'mountain-bikes',
        'The Specialized Stumpjumper is a full-suspension trail bike for Ludlow-area dirt roads and local mountain-bike trails. It gives riders a dependable mid-travel platform for mixed terrain and confident descending. It is an approachable analog rental for intermediate riders.',
        80.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.3992888, -72.7066947,
        '44 Pond Street, Ludlow, VT 05149',
        'trail', NULL::numeric, true
      ),
      (
        'michaelzick+thebootproludlow@gmail.com',
        'Specialized Turbo Levo',
        'mountain-bikes',
        'The Specialized Turbo Levo is an e-mountain-bike rental for riders who want support on Vermont climbs and trail loops. Its pedal-assist system helps extend range while keeping full-suspension control for descending. It fits riders who want a powerful trail rental for Ascutney, Woodstock, or Ludlow-area riding.',
        100.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced',
        'available',
        43.3992888, -72.7066947,
        '44 Pond Street, Ludlow, VT 05149',
        'e-mountain-bike', NULL::numeric, true
      ),
      (
        'michaelzick+burkemountainbikeshop@gmail.com',
        'Transition TR-11',
        'mountain-bikes',
        'The Transition TR-11 is a downhill rental for on-site Burke Mountain bike park use. Its mixed-wheel gravity setup is aimed at riders spending the day on lift-served descents. It is best for intermediate and advanced riders who want a dedicated downhill bike.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.5876492, -71.9161938,
        '223 Sherburne Lodge Road, East Burke, VT 05832',
        'downhill', NULL::numeric, true
      ),
      (
        'michaelzick+burkemountainbikeshop@gmail.com',
        'Transition Spire',
        'mountain-bikes',
        'The Transition Spire is an enduro rental for Burke Mountain riders who want stability on bigger terrain. It is suited to rough descents, bike-park laps, and aggressive trail riding. It gives advanced riders a capable long-travel platform for on-site use.',
        119.00::numeric, NULL::numeric, NULL::numeric,
        NULL::text,
        NULL::text, NULL::text,
        'Beginner, Intermediate, Advanced, Expert',
        'available',
        44.5876492, -71.9161938,
        '223 Sherburne Lodge Road, East Burke, VT 05832',
        'enduro', NULL::numeric, true
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
      'https://images.pexels.com/photos/30447388/pexels-photo-30447388.jpeg',
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
      'https://images.pexels.com/photos/25753440/pexels-photo-25753440.jpeg',
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

  RAISE NOTICE 'Vermont mountain-bikes inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $$;
