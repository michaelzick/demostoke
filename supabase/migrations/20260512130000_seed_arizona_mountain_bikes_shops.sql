-- Seed migration: Arizona Mountain Bikes shops
-- Batch: arizona_mountain_bikes
-- Created: 2026-05-12
-- Shops:
--   1. Fair Wheel Bikes          — mountain-bikes — 1110 E 6th St, Tucson, AZ 85719
--   2. Bike Emporium             — mountain-bikes — 8443 E. McDonald Dr, Scottsdale, AZ 85250
--   3. Thunder Mountain Bikes    — mountain-bikes — 1695 W. State Route 89A, Sedona, AZ 86336
--   4. McDowell Mountain Cycles  — mountain-bikes — 11879 N. Saguaro Blvd, Fountain Hills, AZ 85268
--
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260512130000_seed_arizona_mountain_bikes_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- CREATE/UPSERT USER: Fair Wheel Bikes (Tucson, AZ)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'mountain-bikes';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+fairwheelbikestucson@gmail.com';
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

  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;

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
      new_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Fair Wheel Bikes'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(), '', '', '', '', '', 0, '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email', new_user_id::text, now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'Fair Wheel Bikes',
    website = 'https://www.fairwheelbikes.com/',
    phone = '(520) 884-9018',
    address = '1110 E 6th St, Tucson, AZ 85719',
    about = E'High-performance bicycle shop near the University of Arizona campus offering mountain bike, e-MTB, road, and gravel rentals. MTB rental fleet includes Trek Fuel EX, Trek Fuel+ EX e-MTB, Specialized Chisel FS, and Trek Procaliber hardtail. All rentals include helmet, flat kit, and choice of pedals. Serves Tucson''s best trails: Fantasy Island, Sweetwater Preserve, Starr Pass, and Mt. Lemmon.',
    location_lat = 32.2254,
    location_lng = -110.9517,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id, 'Fair Wheel Bikes',
      'https://www.fairwheelbikes.com/', '(520) 884-9018',
      '1110 E 6th St, Tucson, AZ 85719',
      E'High-performance bicycle shop near the University of Arizona campus offering mountain bike, e-MTB, road, and gravel rentals. MTB rental fleet includes Trek Fuel EX, Trek Fuel+ EX e-MTB, Specialized Chisel FS, and Trek Procaliber hardtail. All rentals include helmet, flat kit, and choice of pedals. Serves Tucson''s best trails: Fantasy Island, Sweetwater Preserve, Starr Pass, and Mt. Lemmon.',
      32.2254, -110.9517, v_avatar_url, v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;


-- =============================================
-- CREATE/UPSERT USER: Bike Emporium (Scottsdale, AZ)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'mountain-bikes';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+bikeemporiumscottsdale@gmail.com';
BEGIN
  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
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

  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;

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
      new_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Bike Emporium'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(), '', '', '', '', '', 0, '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email', new_user_id::text, now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'Bike Emporium',
    website = 'https://www.bikeemporium.com/',
    phone = '(480) 991-5430',
    address = '8443 E. McDonald Dr, Scottsdale, AZ 85250',
    about = E'Scottsdale''s friendly neighborhood bike shop serving the cycling community for over 20 years. Rents the 2023 Cannondale Habit Aluminum full-suspension mountain bike in multiple sizes. Helmets, water bottle cage, and locks included with every rental. Located near the Scottsdale Greenbelt and easy access to desert trail systems.',
    location_lat = 33.5027,
    location_lng = -111.9101,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id, 'Bike Emporium',
      'https://www.bikeemporium.com/', '(480) 991-5430',
      '8443 E. McDonald Dr, Scottsdale, AZ 85250',
      E'Scottsdale''s friendly neighborhood bike shop serving the cycling community for over 20 years. Rents the 2023 Cannondale Habit Aluminum full-suspension mountain bike in multiple sizes. Helmets, water bottle cage, and locks included with every rental. Located near the Scottsdale Greenbelt and easy access to desert trail systems.',
      33.5027, -111.9101, v_avatar_url, v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;


-- =============================================
-- CREATE/UPSERT USER: Thunder Mountain Bikes (Sedona, AZ)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'mountain-bikes';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+thundermountainbikessedona@gmail.com';
BEGIN
  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
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

  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;

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
      new_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Thunder Mountain Bikes'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(), '', '', '', '', '', 0, '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email', new_user_id::text, now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'Thunder Mountain Bikes',
    website = 'https://thundermountainbikes.com/',
    phone = '(928) 282-1106',
    address = '1695 W. State Route 89A, Sedona, AZ 86336',
    about = E'Sedona''s premier mountain bike rental shop operating under USFS special-use permit in Coconino National Forest. Offers an elite fleet of 23 adult models across Dream, E-Bike, Premium, Performance, and Hardtail tiers — Evil, Ibis, Santa Cruz, Transition, Trek, and Rocky Mountain. Open 9am–6pm 7 days a week. Serving Sedona''s world-class red rock trail network.',
    location_lat = 34.8631,
    location_lng = -111.7897,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id, 'Thunder Mountain Bikes',
      'https://thundermountainbikes.com/', '(928) 282-1106',
      '1695 W. State Route 89A, Sedona, AZ 86336',
      E'Sedona''s premier mountain bike rental shop operating under USFS special-use permit in Coconino National Forest. Offers an elite fleet of 23 adult models across Dream, E-Bike, Premium, Performance, and Hardtail tiers — Evil, Ibis, Santa Cruz, Transition, Trek, and Rocky Mountain. Open 9am–6pm 7 days a week. Serving Sedona''s world-class red rock trail network.',
      34.8631, -111.7897, v_avatar_url, v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;


-- =============================================
-- CREATE/UPSERT USER: McDowell Mountain Cycles (Fountain Hills, AZ)
-- =============================================
DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_category text := 'mountain-bikes';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+mcdowellmountaincyclesfountainhills@gmail.com';
BEGIN
  IF v_display_role IN ('retail-store', 'builder') THEN
    CASE v_category
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

  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;

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
      new_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'McDowell Mountain Cycles'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(), '', '', '', '', '', 0, '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', v_email),
      'email', new_user_id::text, now(), now(), now()
    );
  END IF;

  UPDATE public.profiles SET
    name = 'McDowell Mountain Cycles',
    website = 'https://mcdowellmountaincycles.com/',
    phone = '(480) 272-8741',
    address = '11879 N. Saguaro Blvd, Fountain Hills, AZ 85268',
    about = E'Full-service bike shop in Fountain Hills renting Trek and Specialized full-suspension mountain bikes. Gateway to McDowell Mountain Regional Park''s premier desert singletrack. Helmets and pedals included; rack rental available. Delivery available within Fountain Hills and McDowell Mountain Regional Park. Open Mon–Fri 8–5, Sat 8–4.',
    location_lat = 33.6267,
    location_lng = -111.7341,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id, 'McDowell Mountain Cycles',
      'https://mcdowellmountaincycles.com/', '(480) 272-8741',
      '11879 N. Saguaro Blvd, Fountain Hills, AZ 85268',
      E'Full-service bike shop in Fountain Hills renting Trek and Specialized full-suspension mountain bikes. Gateway to McDowell Mountain Regional Park''s premier desert singletrack. Helmets and pedals included; rack rental available. Delivery available within Fountain Hills and McDowell Mountain Regional Park. Open Mon–Fri 8–5, Sat 8–4.',
      33.6267, -111.7341, v_avatar_url, v_hero_image_url
    );
  END IF;

  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
  END IF;

  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;
