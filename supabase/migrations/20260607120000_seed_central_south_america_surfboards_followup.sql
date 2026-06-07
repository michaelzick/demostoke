-- Seed migration: Central and South America surfboard follow-up
-- Batch: central_south_america_surfboards_followup
-- Created: 2026-06-07
-- Remote status: local only; apply to linked Supabase only after rollback dry run succeeds.
-- Do NOT use supabase db push or supabase migration up for this data-only batch.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- FOLLOW-UP SURF SHOP PROFILE
-- Adds Nosara Surfboards after discovering its product-level rental catalog.
-- Existing Sunzal Surf Company profile is reused for the Sunzal additions.
-- =============================================

DO $$
DECLARE
  v_nosara_user_id uuid;
  v_display_role text := 'retail-store';
BEGIN
  SELECT id INTO v_nosara_user_id
  FROM auth.users
  WHERE email = 'michaelzick+nosarasurfboards@gmail.com'
  LIMIT 1;

  IF v_nosara_user_id IS NULL THEN
    v_nosara_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_current,
      email_change_token_new, email_change_confirm_status, phone_change,
      phone_change_token, reauthentication_token
    )
    VALUES (
      v_nosara_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'michaelzick+nosarasurfboards@gmail.com',
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Nosara Surfboards'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      0,
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_nosara_user_id,
      jsonb_build_object('sub', v_nosara_user_id::text, 'email', 'michaelzick+nosarasurfboards@gmail.com'),
      'email',
      v_nosara_user_id::text,
      now(),
      now(),
      now()
    );
  END IF;

  UPDATE public.profiles
  SET name = 'Nosara Surfboards',
      website = 'https://nosarasurfboards.com/',
      phone = '+506 8329 1771',
      address = 'Become Nosara, B34, 50206 Nosara, Guanacaste, Costa Rica',
      about = 'Nosara premium surfboard rental shop with public product-level surfboard listings, USD prices, board details, and pickup at Become Nosara near Guiones Beach.',
      location_lat = 9.9455000,
      location_lng = -85.6655000,
      avatar_url = COALESCE(
        avatar_url,
        'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png'
      ),
      hero_image_url = COALESCE(
        hero_image_url,
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3'
      )
  WHERE id = v_nosara_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    )
    VALUES (
      v_nosara_user_id,
      'Nosara Surfboards',
      'https://nosarasurfboards.com/',
      '+506 8329 1771',
      'Become Nosara, B34, 50206 Nosara, Guanacaste, Costa Rica',
      'Nosara premium surfboard rental shop with public product-level surfboard listings, USD prices, board details, and pickup at Become Nosara near Guiones Beach.',
      9.9455000,
      -85.6655000,
      'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3'
    );
  END IF;

  UPDATE public.user_roles
  SET display_role = v_display_role
  WHERE user_id = v_nosara_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role)
    VALUES (v_nosara_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'Follow-up surf shop upserted successfully: id=%, email=%, role=%',
    v_nosara_user_id, 'michaelzick+nosarasurfboards@gmail.com', v_display_role;
END $$;

-- =============================================
-- FOLLOW-UP SURFBOARD GEAR
-- Uses canonical surfboard placeholder images from AGENTS.md.
-- =============================================

DO $seed_migration$
DECLARE
  v_equipment_inserted int;
  v_primary_images_added int;
  v_secondary_images_added int;
BEGIN
  WITH required_users (email) AS (
    VALUES
      ('michaelzick+sunzalsurfcompany@gmail.com'),
      ('michaelzick+nosarasurfboards@gmail.com')
  )
  SELECT COUNT(*) INTO v_equipment_inserted
  FROM required_users ru
  LEFT JOIN auth.users au ON au.email = ru.email
  WHERE au.id IS NULL;

  IF v_equipment_inserted > 0 THEN
    RAISE EXCEPTION 'Required shop user missing for Central/South America surfboard follow-up batch';
  END IF;

  WITH shop_locations (seed_email, location_lat, location_lng, location_address) AS (
    VALUES
      (
        'michaelzick+sunzalsurfcompany@gmail.com',
        13.4933551,
        -89.3849212,
        'Hotel Roca Sunzal, El Tunco, La Libertad, El Salvador'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        9.9455000,
        -85.6655000,
        'Become Nosara, B34, 50206 Nosara, Guanacaste, Costa Rica'
      )
  ),
  seed_equipment (
    seed_email,
    name,
    description,
    price_per_day,
    suitable_skill_level,
    subcategory
  ) AS (
    VALUES
      (
        'michaelzick+sunzalsurfcompany@gmail.com',
        'Hypto Krypto',
        'A Hypto Krypto surfboard from Sunzal Surf Company''s official El Tunco rental gallery. The page lists it as a distinct priced board rental at 35 USD and includes separate dimensions and fins images for this item.',
        35.00::numeric,
        'Beginner, Intermediate, Advanced',
        'hybrid shortboard'
      ),
      (
        'michaelzick+sunzalsurfcompany@gmail.com',
        'Barahona 9''0',
        'A 9-foot Barahona surfboard from Sunzal Surf Company''s official rental gallery. The page lists the board with its own dimensions and fins images and prices it at 30 USD.',
        30.00::numeric,
        'Beginner, Intermediate, Advanced',
        'longboard'
      ),
      (
        'michaelzick+sunzalsurfcompany@gmail.com',
        'Sci-Fi Volume LFT',
        'A Sci-Fi Volume LFT performance surfboard from Sunzal Surf Company''s official rental gallery. The page exposes it as a distinct itemized rental and prices it at 20 USD.',
        20.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Sharpeye FT Inferno Carbon 5''10',
        'A 5-foot 10-inch Sharpeye FT Inferno Carbon surfboard from Nosara Surfboards. The public Shopify rental product lists USD pricing, carbon/epoxy C1 Lite construction, FCS II quad-fin setup, and a 100 USD rental price.',
        100.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Sharpeye Inferno 72 Carbon 5''10',
        'A 5-foot 10-inch Sharpeye Inferno 72 Carbon board from Nosara Surfboards. The public product page lists dimensions of 5''10 x 19 x 2.5, 28 liters, Carbon C-1 construction, and a 95 USD rental price.',
        95.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Firewire Slater Designs S Boss Volcano I-Bolic 6''0',
        'A 6-foot Firewire Slater Designs S Boss Volcano I-Bolic surfboard from Nosara Surfboards. The public product page lists dimensions, Future fin setup, and a 50 USD rental price.',
        50.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Pyzel Ghost XL 6''2',
        'A 6-foot 2-inch Pyzel Ghost XL surfboard from Nosara Surfboards. The public product page lists dimensions of 6''2 x 19.75 x 3, 36.7 liters, Electralite epoxy construction, and a 50 USD rental price.',
        50.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Firewire Slater Designs S Boss Turquoise I-Bolic 6''2',
        'A 6-foot 2-inch Firewire Slater Designs S Boss Turquoise I-Bolic surfboard from Nosara Surfboards. The public product page lists dimensions, Future fin setup, and a 50 USD rental price.',
        50.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Sharpeye Mid Length 6''6',
        'A 6-foot 6-inch Sharpeye mid-length from Nosara Surfboards. The public product page lists dimensions, 40.13 liters, five-fin Futures setup, and a 50 USD rental price.',
        50.00::numeric,
        'Beginner, Intermediate, Advanced',
        'mid-length'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Chilli Mid Strength 7''0',
        'A 7-foot Chilli Mid Strength surfboard from Nosara Surfboards. The public product page lists dimensions of 7''0 x 21 3/4 x 2 3/4, 45.5 liters, five-fin Futures setup, and a 50 USD rental price.',
        50.00::numeric,
        'Beginner, Intermediate, Advanced',
        'mid-length'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Lost Glydra 7''0',
        'A 7-foot Lost Glydra surfboard from Nosara Surfboards. The public product page lists dimensions of 7''0 x 22 x 2.88, 48 liters, Lib Tech construction, five-fin FCS II setup, and a 50 USD rental price.',
        50.00::numeric,
        'Beginner, Intermediate, Advanced',
        'mid-length'
      ),
      (
        'michaelzick+nosarasurfboards@gmail.com',
        'Channel Islands CI 2 Pro 5''10',
        'A 5-foot 10-inch Channel Islands CI 2 Pro surfboard from Nosara Surfboards. The public product page lists dimensions, CI 2.Pro round-tail details, a flat Channel Islands traction pad, and a 40 USD rental price.',
        40.00::numeric,
        'Intermediate, Advanced, Expert',
        'shortboard'
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
      s.name,
      'surfboards',
      s.description,
      s.price_per_day,
      NULL::numeric,
      NULL::numeric,
      'USD',
      NULL::text,
      NULL::text,
      NULL::text,
      s.suitable_skill_level,
      'available',
      sl.location_lat,
      sl.location_lng,
      sl.location_address,
      s.subcategory,
      NULL::numeric,
      true
    FROM seed_equipment s
    JOIN shop_locations sl ON sl.seed_email = s.seed_email
    JOIN auth.users au ON au.email = s.seed_email
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = au.id
        AND e.category = 'surfboards'
        AND lower(btrim(e.name)) = lower(btrim(s.name))
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Central/South America surfboard follow-up gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
