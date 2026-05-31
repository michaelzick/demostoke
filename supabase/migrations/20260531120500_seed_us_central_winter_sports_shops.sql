-- Seed migration: U.S. Central timezone winter-sports shops
-- Batch: us_central_winter_sports
-- Created: 2026-05-31
-- Remote status: files only; not pushed, applied, or deployed.
-- Do not use supabase db push or supabase migration up for this seed package.

-- =============================================
-- U.S. CENTRAL WINTER-SPORTS SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- =============================================

DO $$
DECLARE
  new_user_id uuid;
  v_avatar_url text := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png';
  v_hero_image_url text := 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
  v_display_role text := 'retail-store';
  v_email text := 'michaelzick+hitempowhitebearlake@gmail.com';
BEGIN
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change, email_change_token_current, email_change_token_new,
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
      jsonb_build_object('name', 'Hi Tempo'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(), now(), '', '', '', '', '', 0, '', '', ''
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE user_id = new_user_id
      AND provider = 'email'
  ) THEN
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
    name = 'Hi Tempo',
    website = 'https://www.hitempo.com/',
    phone = '(651) 429-3333',
    address = '3959 Highway 61 N, White Bear Lake, MN 55110',
    about = 'White Bear Lake snow and water sports shop with a public ski rental and performance demo page listing daily demo pricing and model-level 2025 Quiver ski inventory.',
    location_lat = 45.0603839,
    location_lng = -93.0273197,
    avatar_url = COALESCE(v_avatar_url, avatar_url),
    hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
  WHERE id = new_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, name, website, phone, address, about,
      location_lat, location_lng, avatar_url, hero_image_url
    ) VALUES (
      new_user_id,
      'Hi Tempo',
      'https://www.hitempo.com/',
      '(651) 429-3333',
      '3959 Highway 61 N, White Bear Lake, MN 55110',
      'White Bear Lake snow and water sports shop with a public ski rental and performance demo page listing daily demo pricing and model-level 2025 Quiver ski inventory.',
      45.0603839,
      -93.0273197,
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
