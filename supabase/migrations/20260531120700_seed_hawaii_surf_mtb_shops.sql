-- Seed migration: Hawaii surf and mountain-bike shops
-- Batch: hawaii_surf_mtb
-- Created: 2026-05-31
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260531120700_seed_hawaii_surf_mtb_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- HAWAII SURF AND MOUNTAIN-BIKE SHOPS
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
          E'Hawaiian South Shore',
          E'Honolulu, HI',
          E'michaelzick+hawaiiansouthshorehonolulu@gmail.com',
          E'surfboards',
          E'https://www.hawaiiansouthshore.com/',
          E'808-597-9055',
          E'320 Ward Avenue #112, Honolulu, HI 96814',
          E'Honolulu surf shop with a current official rental-board collection listing Firewire, Thunderbolt, and Harley Ingleby board models with public daily pricing.',
          21.29622398726,
          -157.856226454126
        ),
        (
          E'Clips Hawaii',
          E'Honolulu, HI',
          E'michaelzick+clipshawaiihonolulu@gmail.com',
          E'surfboards',
          E'https://clipshawaii.com/',
          E'808-941-6777',
          E'822 Kaheka Street, Honolulu, HI 96814',
          E'Honolulu surf shop with an official rental-board collection exposing model-level Firewire, Album, Thunderbolt, Torq, Softech, Surftech, and Channel Islands rental inventory.',
          21.293731385575,
          -157.839240874167
        ),
        (
          E'Haleiwa Surf Shop',
          E'Haleiwa, HI',
          E'michaelzick+haleiwasurfshop@gmail.com',
          E'surfboards',
          E'https://www.hisurfrentals.com/',
          E'808-744-0401',
          E'66-214 Haleiwa Rd, Haleiwa, HI 96712',
          E'North Shore Oahu surf shop with a public WooCommerce rental catalog listing surfboard models, day rates, weekly rates, and monthly rates.',
          21.591426065547,
          -158.108907011544
        ),
        (
          E'Kauai Surfboard Rentals',
          E'Hanalei, HI',
          E'michaelzick+kauaisurfboardrentalshanalei@gmail.com',
          E'surfboards',
          E'https://www.kauaisurfboardrentals.com/',
          E'808-855-0957',
          E'5-5088 Kuhio Hwy, Hanalei, HI 96714',
          E'Hanalei surfboard rental service with a large public Wix rental catalog listing current model-level surfboard inventory and prices.',
          22.203526802851,
          -159.494300647167
        ),
        (
          E'Hanalei Surfboard Rentals',
          E'Hanalei, HI',
          E'michaelzick+hanaleisurfboardrentals@gmail.com',
          E'surfboards',
          E'https://hanaleisurfboardrentals.com/',
          E'808-482-0749',
          E'5-5134 Kuhio Hwy, Hanalei, HI 96714',
          E'Hanalei surf shack with a public inventory page listing soft-top and epoxy surfboards by brand and model plus daily and weekly rental rates.',
          22.203339936166,
          -159.494942411973
        ),
        (
          E'Maui Sunriders Kihei Bike Shop',
          E'Kihei, HI',
          E'michaelzick+mauisunriderskihei@gmail.com',
          E'mountain-bikes',
          E'https://mauisunriders.com/maui-bike-rentals/maui-mountain-bike-rentals/',
          E'808-579-8970',
          E'1847 S. Kihei Rd, Kihei, HI 96753',
          E'Maui bike shop location with official full-suspension mountain-bike rental listings and public daily pricing tiers.',
          20.733737033898,
          -156.452718222034
        ),
        (
          E'Maui Sunriders Kapalua Bike Shop',
          E'Lahaina, HI',
          E'michaelzick+mauisunriderskapalua@gmail.com',
          E'mountain-bikes',
          E'https://mauisunriders.com/maui-bike-rentals/maui-mountain-bike-rentals/',
          E'808-579-8970',
          E'800 Office Rd, Lahaina, HI 96761',
          E'West Maui bike shop location with official full-suspension mountain-bike and e-MTB rental listings and public daily pricing tiers.',
          21.001457082778,
          -156.655730096767
        ),
        (
          E'Bike Maui',
          E'Haiku, HI',
          E'michaelzick+bikemauihaiku@gmail.com',
          E'mountain-bikes',
          E'https://www.bikemaui.com/bike-rentals/',
          E'808-575-9575',
          E'810 Haiku Rd #120, Haiku, HI 96708',
          E'Haiku bike rental shop with public Kona bike rental listings for Haleakala-area rides, including mountain-bike and e-bike models with displayed prices.',
          20.914998474308,
          -156.322991879543
        ),
        (
          E'Big Island Bike Tours',
          E'Waimea, HI',
          E'michaelzick+bigislandbiketourswaimea@gmail.com',
          E'mountain-bikes',
          E'https://bigislandbiketours.com/bike-rentals-hawaii/',
          E'808-769-1308',
          E'65-1480 Kawaihae Rd, Waimea, HI 96743',
          E'Waimea bike tour and rental operator with public mountain-bike rental model names and daily or weekly pricing for Big Island rides.',
          20.025925849372,
          -155.687371668464
        )
    ) AS s(name, city, email, category, website, phone, address, about, lat, lng)
  LOOP
    IF v_display_role IN ('retail-store', 'builder') THEN
      CASE shop.category
        WHEN 'surfboards' THEN
          v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png';
          v_hero_image_url := 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
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

    SELECT id INTO new_user_id FROM auth.users WHERE email = shop.email LIMIT 1;

    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_current, email_change_token_new, email_change_confirm_status, phone_change, phone_change_token, reauthentication_token)
      VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', shop.email, crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')), now(), jsonb_build_object('name', shop.name), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), now(), now(), '', '', '', '', '', 0, '', '', '');
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', shop.email), 'email', new_user_id::text, now(), now(), now());
    END IF;

    UPDATE public.profiles SET name = shop.name, website = shop.website, phone = shop.phone, address = shop.address, about = shop.about, location_lat = shop.lat, location_lng = shop.lng, avatar_url = COALESCE(v_avatar_url, avatar_url), hero_image_url = COALESCE(v_hero_image_url, hero_image_url) WHERE id = new_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.profiles (id, name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url)
      VALUES (new_user_id, shop.name, shop.website, shop.phone, shop.address, shop.about, shop.lat, shop.lng, v_avatar_url, v_hero_image_url);
    END IF;

    UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
    IF NOT FOUND THEN INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role); END IF;
    RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, shop.email, v_display_role;
  END LOOP;
END $$;
