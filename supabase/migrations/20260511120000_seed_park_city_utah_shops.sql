-- Seed migration: Park City / Utah shops
-- Batch: park_city_utah
-- Created: 2026-05-11
-- Apply to remote (human approval required):
--   supabase db query --linked -f supabase/migrations/20260511120000_seed_park_city_utah_shops.sql
-- Do NOT use supabase db push or supabase migration up.
--
-- Shops in this batch:
--   1. Jans Mountain Outfitters  — skis        — 1600 Park Ave, Park City UT 84060
--   2. White Pine Touring        — mountain-bikes — 1790 Bonanza Drive, Park City UT 84060
--   3. Park City Sport           — skis + snowboards — 1335 Lowell Ave Ste. 104, Park City UT 84060

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- PARK CITY / UTAH SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- NOTE: auth.users insert is guarded by email lookup for idempotent local testing.
-- NOTE: user_roles upsert uses UPDATE...IF NOT FOUND THEN INSERT (no ON CONFLICT)
-- NOTE: profile upsert uses UPDATE...IF NOT FOUND THEN INSERT
-- =============================================


-- =============================================
-- CREATE/UPSERT USER: Jans Mountain Outfitters (Park City, UT)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'skis';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+jansmountainoutfittersparkcity@gmail.com';
BEGIN

  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
      WHEN 'surfboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'snowboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/c5b450a8-7414-463b-b863-d78698fd0f95/profile-1752636842828.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0';
      WHEN 'skis' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'mountain-bikes' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
      ELSE
        v_avatar_url := NULL;
        v_hero_image_url := NULL;
    END CASE;
  ELSE
    v_avatar_url := NULL;
    v_hero_image_url := NULL;
  END IF;

  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change,
      email_change_token_current, email_change_token_new,
      email_change_confirm_status, phone_change, phone_change_token,
      reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Jans Mountain Outfitters'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(),
      '', '', '', '', '', 0, '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'Jans Mountain Outfitters',
    website = 'https://jans.com/',
    phone = '(435) 649-4949',
    address = '1600 Park Ave, Park City, UT 84060',
    about = E'Full-service mountain outfitter and ski rental shop at 1600 Park Ave in Park City, Utah. Offers Sport and High Performance alpine ski packages with expert boot fitting, plus kids'' rentals. Equipment from Atomic, Fischer, Kastle, and Stockli, regularly tuned and serviced. Conveniently located near Park City Mountain Resort.',
    location_lat = 40.6569,
    location_lng = -111.5063,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id,
      'Jans Mountain Outfitters',
      'https://jans.com/',
      '(435) 649-4949',
      '1600 Park Ave, Park City, UT 84060',
      E'Full-service mountain outfitter and ski rental shop at 1600 Park Ave in Park City, Utah. Offers Sport and High Performance alpine ski packages with expert boot fitting, plus kids'' rentals. Equipment from Atomic, Fischer, Kastle, and Stockli, regularly tuned and serviced. Conveniently located near Park City Mountain Resort.',
      40.6569,
      -111.5063,
      v_avatar_url,
      v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles
    SET display_role = v_display_role
    WHERE user_id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role)
    VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, v_email, v_display_role;

END $$;


-- =============================================
-- CREATE/UPSERT USER: White Pine Touring (Park City, UT)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'mountain-bikes';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+whitepinetouringparkcity@gmail.com';
BEGIN

  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
      WHEN 'surfboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'snowboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/c5b450a8-7414-463b-b863-d78698fd0f95/profile-1752636842828.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0';
      WHEN 'skis' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'mountain-bikes' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
      ELSE
        v_avatar_url := NULL;
        v_hero_image_url := NULL;
    END CASE;
  ELSE
    v_avatar_url := NULL;
    v_hero_image_url := NULL;
  END IF;

  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change,
      email_change_token_current, email_change_token_new,
      email_change_confirm_status, phone_change, phone_change_token,
      reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'White Pine Touring'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(),
      '', '', '', '', '', 0, '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'White Pine Touring',
    website = 'https://whitepinetouring.com/',
    phone = '(435) 649-8710',
    address = '1790 Bonanza Drive, Park City, UT 84060',
    about = E'Park City''s premier outdoor outfitter at 1790 Bonanza Drive, offering full-suspension mountain bike and e-mountain bike rentals from Specialized. Access to 450+ miles of IMBA Gold Level trails. Helmet, pedals, and repair kit included with every rental. High-performance Specialized Epic and Stumpjumper models available. Serving Park City since 1972.',
    location_lat = 40.660554,
    location_lng = -111.500644,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id,
      'White Pine Touring',
      'https://whitepinetouring.com/',
      '(435) 649-8710',
      '1790 Bonanza Drive, Park City, UT 84060',
      E'Park City''s premier outdoor outfitter at 1790 Bonanza Drive, offering full-suspension mountain bike and e-mountain bike rentals from Specialized. Access to 450+ miles of IMBA Gold Level trails. Helmet, pedals, and repair kit included with every rental. High-performance Specialized Epic and Stumpjumper models available. Serving Park City since 1972.',
      40.660554,
      -111.500644,
      v_avatar_url,
      v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles
    SET display_role = v_display_role
    WHERE user_id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role)
    VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, v_email, v_display_role;

END $$;


-- =============================================
-- CREATE/UPSERT USER: Park City Sport (Park City, UT)
-- Primary category: skis (also rents snowboards — gear migration handles both)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'skis';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+parkcitysportparkcity@gmail.com';
BEGIN

  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
      WHEN 'surfboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'snowboards' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/c5b450a8-7414-463b-b863-d78698fd0f95/profile-1752636842828.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0';
      WHEN 'skis' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
      WHEN 'mountain-bikes' THEN
        v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
        v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
      ELSE
        v_avatar_url := NULL;
        v_hero_image_url := NULL;
    END CASE;
  ELSE
    v_avatar_url := NULL;
    v_hero_image_url := NULL;
  END IF;

  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change,
      email_change_token_current, email_change_token_new,
      email_change_confirm_status, phone_change, phone_change_token,
      reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Park City Sport'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(),
      '', '', '', '', '', 0, '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'Park City Sport',
    website = 'https://parkcitysport.com/',
    phone = '(435) 645-7777',
    address = '1335 Lowell Ave Ste. 104, Park City, UT 84060',
    about = E'Family-owned ski and snowboard rental shop at the Park City Mountain Resort base, steps from the Payday and Crescent lifts. Offers Demo, Performance, Sport, and Junior ski packages plus Performance, Basic, and Junior snowboard rentals. Includes expert boot fitting, complimentary overnight ski valet, and free equipment exchanges. Online reservations save 20%.',
    location_lat = 40.650586,
    location_lng = -111.507252,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id,
      'Park City Sport',
      'https://parkcitysport.com/',
      '(435) 645-7777',
      '1335 Lowell Ave Ste. 104, Park City, UT 84060',
      E'Family-owned ski and snowboard rental shop at the Park City Mountain Resort base, steps from the Payday and Crescent lifts. Offers Demo, Performance, Sport, and Junior ski packages plus Performance, Basic, and Junior snowboard rentals. Includes expert boot fitting, complimentary overnight ski valet, and free equipment exchanges. Online reservations save 20%.',
      40.650586,
      -111.507252,
      v_avatar_url,
      v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles
    SET display_role = v_display_role
    WHERE user_id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role)
    VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, v_email, v_display_role;

END $$;
