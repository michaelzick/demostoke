-- Seed migration: Florida surf shops
-- Batch: florida_surf_shops
-- Created: 2026-05-25
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260525110000_seed_florida_surf_shops_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- FLORIDA SURF SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- NOTE: auth.users insert is guarded by email lookup for idempotent local testing.
-- NOTE: user_roles upsert uses UPDATE...IF NOT FOUND THEN INSERT
-- NOTE: profile upsert uses UPDATE...IF NOT FOUND THEN INSERT
-- =============================================

DO $$
DECLARE
  shop record;
  new_user_id uuid;
  v_avatar_url text;
  v_hero_image_url text;
  v_display_role text := 'retail-store';
BEGIN
  FOR shop IN
    SELECT *
    FROM (
      VALUES
        (
          'Spunky''s Surf Shop',
          'Fort Pierce, FL',
          'michaelzick+spunkyssurfshopfortpierce@gmail.com',
          'surfboards',
          'https://spunkyssurfshop.com/',
          '772-466-7048',
          '1403 N US Hwy 1, Fort Pierce, FL 34950',
          E'Fort Pierce surf shop with a public rental board list and current rental pricing. Spunky''s publishes Torq, Sunova, and Catch Surf rental models with board lengths, volumes, and half-day, full-day, and multi-day rates.',
          27.4338466,
          -80.3259843
        )
    ) AS s(name, city, email, category, website, phone, address, about, lat, lng)
  LOOP
    IF v_display_role IN ('retail-store', 'builder') THEN
      CASE shop.category
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
    WHERE email = shop.email
    LIMIT 1;

    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();

      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        raw_app_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change,
        email_change_token_current,
        email_change_token_new,
        email_change_confirm_status,
        phone_change,
        phone_change_token,
        reauthentication_token
      ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        shop.email,
        crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')),
        now(),
        jsonb_build_object('name', shop.name),
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
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', shop.email),
        'email',
        new_user_id::text,
        now(),
        now(),
        now()
      );
    END IF;

    UPDATE public.profiles SET
      name = shop.name,
      website = shop.website,
      phone = shop.phone,
      address = shop.address,
      about = shop.about,
      location_lat = shop.lat,
      location_lng = shop.lng,
      avatar_url = COALESCE(v_avatar_url, avatar_url),
      hero_image_url = COALESCE(v_hero_image_url, hero_image_url)
    WHERE id = new_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id, name, website, phone, address, about,
        location_lat, location_lng, avatar_url, hero_image_url
      ) VALUES (
        new_user_id,
        shop.name,
        shop.website,
        shop.phone,
        shop.address,
        shop.about,
        shop.lat,
        shop.lng,
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

    RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, shop.email, v_display_role;
  END LOOP;
END $$;
