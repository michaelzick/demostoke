-- Seed migration: Eastern Time Zone all-category shops
-- Batch: eastern_time_zone_all_categories
-- Created: 2026-05-30
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260530120000_seed_eastern_time_zone_all_categories_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- EASTERN TIME ZONE ALL-CATEGORY SHOPS
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
          'Belleayre Mountain',
          'Highmount, NY',
          'michaelzick+belleayremountainhighmount@gmail.com',
          'skis',
          'https://www.belleayre.com/tickets/high-performance-demos/',
          '(845) 254-5600',
          '181 Galli Curci Road, Highmount, NY 12441',
          E'Catskills ski area with an official high-performance demo program for Rossignol skis and Burton snowboards. Belleayre publishes model names, available sizes, package prices, and demo descriptions for on-site premium rentals.',
          42.1299384,
          -74.5060014
        ),
        (
          'Highland Mountain Bike Park',
          'Northfield, NH',
          'michaelzick+highlandmountainbikeparknorthfield@gmail.com',
          'mountain-bikes',
          'https://highlandmountain.com/explore-highland/rentals-demos/rentals/',
          '(603) 286-7677',
          '75 Ski Hill Drive, Northfield, NH 03276',
          E'Lift-access New Hampshire bike park with an official rental fleet. Highland publishes Santa Cruz, Specialized, Giant, and Norco rental models with full-day and half-day rates for downhill, enduro, and youth mountain bikes.',
          43.4071495,
          -71.5548452
        ),
        (
          'Thunder Mountain Bike Park',
          'Charlemont, MA',
          'michaelzick+thundermountainbikeparkcharlemont@gmail.com',
          'mountain-bikes',
          'https://berkshireeast.com/summer/thunder-mountain-bike-park/bike-rentals?id=37',
          '413-339-6618',
          '66 Thunder Mountain Road, Charlemont, MA 01339',
          E'Berkshire East mountain-bike park with official Thunder Mountain rental listings. The rental page publishes specific Scott, Santa Cruz, Transition, Yeti, and Rocky Mountain models with full-day and half-day rates.',
          42.6225361,
          -72.8782811
        ),
        (
          'Ride Kanuga',
          'Hendersonville, NC',
          'michaelzick+ridekanugahendersonville@gmail.com',
          'mountain-bikes',
          'https://ridekanuga.com/rentals/',
          '(828) 436-2002',
          '1249 Kanuga Lake Road, Hendersonville, NC 28739',
          E'Hendersonville mountain-bike park and trail center with an official Specialized e-bike rental fleet. Ride Kanuga publishes Turbo Levo model names, available sizes, full-day prices, and rental add-ons.',
          35.2676542,
          -82.5140571
        ),
        (
          'REAL Watersports',
          'Waves, NC',
          'michaelzick+realwatersportswaves@gmail.com',
          'surfboards',
          'https://www.realwatersports.com/blogs/news/firewire-fleets-at-real',
          '(252) 987-6000',
          '25706 North Carolina Hwy 12, Waves, NC 27982',
          E'Cape Hatteras surf and kite shop with an official Firewire Fleets premium surfboard rental program. REAL publishes daily and weekly rates plus Firewire model names, dimensions, and volume ranges for its Outer Banks demo quiver.',
          35.5659701,
          -75.4693984
        ),
        (
          'Warm Winds Surf Shop',
          'Narragansett, RI',
          'michaelzick+warmwindssurfshopnarragansett@gmail.com',
          'surfboards',
          'https://www.warmwinds.com/surfboard-rentals',
          '(401) 789-9040',
          '26 Kingstown Road, Narragansett, RI 02882',
          E'Rhode Island surf shop with official Firewire Fleets premium rentals and softboard rentals. Warm Winds publishes current Firewire stock, full-day and multi-day prices, and board-swap rules for its Narragansett rental program.',
          41.4308365,
          -71.4587796
        ),
        (
          'Cinnamon Rainbows Surf Co.',
          'North Hampton, NH',
          'michaelzick+cinnamonrainbowsnorthhampton@gmail.com',
          'surfboards',
          'https://www.cinnamonrainbows.com/demos',
          '(603) 929-7467',
          '62 Lafayette Road, North Hampton, NH 03862',
          E'New Hampshire surf shop with a high-end surfboard rental and demo program. Cinnamon Rainbows publishes model-level demo boards from Firewire, Channel Islands, and Pyzel with day pricing and available size notes.',
          42.9968316,
          -70.8158301
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
