-- Seed migration: U.S. Mountain timezone mountain-bike shops
-- Batch: us_mountain_mountain_bikes
-- Created: 2026-05-31
-- Remote status: files only; not pushed, applied, or deployed.
-- Do not use supabase db push or supabase migration up for this seed package.

-- =============================================
-- U.S. MOUNTAIN MOUNTAIN-BIKE SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- NOTE: auth.users insert is guarded by email lookup for idempotent local testing.
-- NOTE: user_roles upsert uses UPDATE...IF NOT FOUND THEN INSERT.
-- NOTE: profile upsert uses UPDATE...IF NOT FOUND THEN INSERT.
-- =============================================

DO $$
DECLARE
  s record;
  new_user_id uuid;
  v_avatar_url text := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
  v_hero_image_url text := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
  v_display_role text := 'retail-store';
BEGIN
  CREATE TEMP TABLE _seed_us_mountain_mtb_shops (
    seed_email text,
    shop_name text,
    website text,
    phone text,
    address text,
    about text,
    lat numeric,
    lng numeric
  ) ON COMMIT DROP;

  INSERT INTO _seed_us_mountain_mtb_shops VALUES
    (
      'michaelzick+danbaileyslivingston@gmail.com',
      'Dan Bailey''s Outdoor Co.',
      'https://danbaileys.com/',
      '(406) 222-1673',
      '209 W Park Street, Livingston, MT 59047',
      'Livingston outdoor shop with a public 2026 mountain-bike rental page listing Specialized hardtail and electric mountain-bike models with daily prices.',
      45.6616265,
      -110.5623716
    ),
    (
      'michaelzick+provelobicyclesfortcollins@gmail.com',
      'proVelo Bicycles',
      'https://www.provelobikes.com/',
      '(970) 204-9935',
      '1003 W Horsetooth Rd, Fort Collins, CO 80526',
      'Fort Collins bike shop with a public rental and demo program listing Santa Cruz, Ibis, Giant, Liv, and Specialized mountain-bike models with 24-hour carbon and aluminum pricing tiers.',
      40.5377487,
      -105.0949238
    ),
    (
      'michaelzick+habitatgrandtarghee@gmail.com',
      'Habitat Dirt + Snow Grand Targhee',
      'https://ridethetetons.com/',
      '(307) 353-2300',
      '3300 E Ski Hill Rd, Alta, WY 83414',
      'Habitat Dirt + Snow mountainside location at Grand Targhee with public bike rental pages listing adult downhill and cross-country mountain-bike models and full-day pricing.',
      43.7849766,
      -110.9469857
    );

  FOR s IN SELECT * FROM _seed_us_mountain_mtb_shops LOOP
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
