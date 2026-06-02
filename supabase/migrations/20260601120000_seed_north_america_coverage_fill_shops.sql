-- Seed migration: North America coverage fill shops
-- Batch: north_america_coverage_fill
-- Created: 2026-06-01
-- Remote status: applied to linked Supabase project on 2026-06-01.
-- Apply to remote only after explicit human approval.
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- NORTH AMERICA COVERAGE FILL SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- Password: $uO9RX^1P%bd#8crEAM!
-- NOTE: auth.users insert is guarded by email lookup for idempotent local testing.
-- NOTE: user_roles upsert uses UPDATE...IF NOT FOUND THEN INSERT.
-- NOTE: profile upsert uses UPDATE...IF NOT FOUND THEN INSERT.
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
          E'Surf Mexico',
          E'Bucerias, Nayarit',
          E'michaelzick+surfmexicobucerias@gmail.com',
          E'surfboards',
          E'https://www.surfmexico.com/',
          E'+52 329-298-5055',
          E'Freeway Tepic - Puerto Vallarta No. 949 Int. 9, Bucerias, Nayarit, Mexico',
          E'Banderas Bay surf shop with official surfboard rental pages listing soft-top, standard, and high-performance surfboards with day and week pricing.',
          20.7491125,
          -105.3155175
        ),
        (
          E'BikeFlow Oaxaca',
          E'Oaxaca, Oaxaca',
          E'michaelzick+bikeflowoaxaca@gmail.com',
          E'mountain-bikes',
          E'https://bikeflow.com.mx/',
          E'+52 951-532-2296',
          E'Martires de Tacubaya #101, Centro, Oaxaca de Juarez, Oax., Mexico',
          E'Oaxaca mountain-bike shop with an official premium rental page listing Trek, Specialized, Scott, Cube, and Belfort hardtail models at public 24-hour pricing.',
          17.0621249,
          -96.7179305
        ),
        (
          E'Bike Denali',
          E'Denali Park, AK',
          E'michaelzick+bikedenali@gmail.com',
          E'mountain-bikes',
          E'https://bikedenali.com/',
          E'+1 907-378-2107',
          E'Mile 238.5 Parks Hwy, Denali Park, AK 99755',
          E'Denali Park bike-rental operator with official Trek Marlin 5 mountain-bike rental details for Denali National Park day rides.',
          63.7453222,
          -148.9011115
        ),
        (
          E'Dismount Bike Shop',
          E'Toronto, ON',
          E'michaelzick+dismounttoronto@gmail.com',
          E'mountain-bikes',
          E'https://dismount-bike-shop.booqableshop.com/',
          E'',
          E'936 St Clair Ave W, Toronto, ON M6C 1C8, Canada',
          E'Toronto bike shop with public Booqable mountain-bike and fat-bike rental inventory, daily pricing, and ride-before-you-buy credit.',
          43.6798533,
          -79.4352123
        ),
        (
          E'Willi''s Ski and Board Seven Springs',
          E'Champion, PA',
          E'michaelzick+willissevensprings@gmail.com',
          E'skis',
          E'https://www.willisskiandboard.com/',
          E'+1 814-352-7611',
          E'777 Water Wheel Dr, Champion, PA 15622',
          E'Willi''s Seven Springs shop with an official on-mountain demo ski program listing current ski models, sizes, bindings, and the public demo fee.',
          40.0222800,
          -79.2962300
        ),
        (
          E'Tactics Bend',
          E'Bend, OR',
          E'michaelzick+tacticsbend@gmail.com',
          E'snowboards',
          E'https://www.tactics.com/info/bend-snowboard-rentals-services',
          E'+1 541-640-8265',
          E'933 NW Wall St, Bend, OR 97703',
          E'Downtown Bend snowboard shop with an official high-performance demo snowboard fleet, public board rental rates, and model-level demo inventory.',
          44.0593762,
          -121.3139605
        )
    ) AS s(name, city, email, category, website, phone, address, about, lat, lng)
  LOOP
    IF v_display_role IN ('retail-store', 'builder') THEN
      CASE shop.category
        WHEN 'surfboards' THEN
          v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/73de4049-7ffd-45cd-868b-c2d0076107b3/profile-1752863282257.png';
          v_hero_image_url := 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
        WHEN 'skis' THEN
          v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/71fd4660-af0b-4b8c-b55b-55d82f0f827a/profile-1752637192121.png';
          v_hero_image_url := 'https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
        WHEN 'snowboards' THEN
          v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/71fd4660-af0b-4b8c-b55b-55d82f0f827a/profile-1752637192121.png';
          v_hero_image_url := 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3';
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
      VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', shop.email, extensions.crypt('$uO9RX^1P%bd#8crEAM!', extensions.gen_salt('bf')), now(), jsonb_build_object('name', shop.name), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), now(), now(), '', '', '', '', '', 0, '', '', '');
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', shop.email), 'email', new_user_id::text, now(), now(), now());
    END IF;

    UPDATE public.profiles
    SET name = shop.name,
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
      INSERT INTO public.profiles (id, name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url)
      VALUES (new_user_id, shop.name, shop.website, shop.phone, shop.address, shop.about, shop.lat, shop.lng, v_avatar_url, v_hero_image_url);
    END IF;

    UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
    IF NOT FOUND THEN
      INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
    END IF;

    RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, shop.email, v_display_role;
  END LOOP;
END $$;
