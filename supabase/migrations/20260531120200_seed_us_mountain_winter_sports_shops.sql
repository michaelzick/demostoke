-- Seed migration: U.S. Mountain timezone winter-sports shops
-- Batch: us_mountain_winter_sports
-- Created: 2026-05-31
-- Remote status: files only; not pushed, applied, or deployed.
-- Do not use supabase db push or supabase migration up for this seed package.

-- =============================================
-- U.S. MOUNTAIN WINTER-SPORTS SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- =============================================

DO $$
DECLARE
  s record;
  new_user_id uuid;
  v_avatar_url text := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/7ef925ac-4b8f-496c-b4d9-10895164f03c/profile-1769637319540.png';
  v_hero_image_url text := 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
  v_display_role text := 'retail-store';
BEGIN
  CREATE TEMP TABLE _seed_us_mountain_winter_shops (
    seed_email text,
    shop_name text,
    website text,
    phone text,
    address text,
    about text,
    lat numeric,
    lng numeric
  ) ON COMMIT DROP;

  INSERT INTO _seed_us_mountain_winter_shops VALUES
    (
      'michaelzick+villageskishopangelfire@gmail.com',
      'Village Ski Shop',
      'https://www.villageskishop.com/',
      '(575) 377-2475',
      '26 Aspen St, Angel Fire, NM 87710',
      'Angel Fire ski and snowboard rental shop with public 2025/2026 rates, advanced ski model lists, and snowboard model lists for Never Summer, Salomon, Rossignol, and Burton boards.',
      36.3876434,
      -105.2753910
    ),
    (
      'michaelzick+arizonasnowbowlagassiz@gmail.com',
      'Arizona Snowbowl Agassiz Pro Shop',
      'https://www.snowbowl.ski/agassiz-pro-shop/',
      '(928) 447-9928',
      '9300 N Snowbowl Rd, Flagstaff, AZ 86002',
      'Arizona Snowbowl Agassiz Lodge pro shop with a public 25/26 demo gear program, published daily demo pricing, and a model-level ski and snowboard demo menu.',
      35.3303900,
      -111.7106600
    ),
    (
      'michaelzick+deervalleyrentalsparkcity@gmail.com',
      'Deer Valley Resort Ski Rentals',
      'https://www.deervalley.com/plan-your-trip/ski-rentals/demo',
      '(435) 645-6648',
      '2250 Deer Valley Drive S, Park City, UT 84060',
      'Deer Valley Snow Park rental shop with a public Rossignol demo ski rental page listing product pricing, model details, and rental locations.',
      40.6374025,
      -111.4782514
    );

  FOR s IN SELECT * FROM _seed_us_mountain_winter_shops LOOP
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = s.seed_email
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
        s.seed_email,
        extensions.crypt('$uO9RX^1P%bd#8crEAM!', extensions.gen_salt('bf')),
        now(),
        jsonb_build_object('name', s.shop_name),
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
        jsonb_build_object('sub', new_user_id::text, 'email', s.seed_email),
        'email',
        new_user_id::text,
        now(), now(), now()
      );
    END IF;

    UPDATE public.profiles SET
      name = s.shop_name,
      website = s.website,
      phone = s.phone,
      address = s.address,
      about = s.about,
      location_lat = s.lat,
      location_lng = s.lng,
      avatar_url = COALESCE(v_avatar_url, avatar_url),
      hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
    WHERE id = new_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id, name, website, phone, address, about,
        location_lat, location_lng, avatar_url, hero_image_url
      ) VALUES (
        new_user_id,
        s.shop_name,
        s.website,
        s.phone,
        s.address,
        s.about,
        s.lat,
        s.lng,
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

    RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, s.seed_email, v_display_role;
  END LOOP;
END $$;
