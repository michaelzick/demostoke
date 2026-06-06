-- Seed migration: Central and South America qualifying gear shops
-- Batch: central_south_america_gear
-- Created: 2026-06-06
-- Remote status: local only; apply to linked Supabase only after explicit human approval.
-- Do NOT use supabase db push or supabase migration up for this data-only batch.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- CENTRAL AND SOUTH AMERICA QUALIFYING GEAR SHOPS
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
          E'MTB Guatemala',
          E'Tecpan, Guatemala',
          E'michaelzick+mtbguatemala@gmail.com',
          E'mountain-bikes',
          E'https://www.mtbguatemala.com/',
          E'+1-347-403-9993',
          E'MTB Guatemala Tecpan, km88 Carretera Panamericana, Tecpan, Chimaltenango, Guatemala',
          E'Guatemala mountain-bike operator with a current official rental catalog listing Commencal and Giant model-level mountain bikes and USD rental pricing.',
          14.7688752,
          -90.9893490
        ),
        (
          E'Bike Arenal',
          E'La Fortuna, Costa Rica',
          E'michaelzick+bikearenal@gmail.com',
          E'mountain-bikes',
          E'https://www.bikearenal.com/',
          E'+506 2479 9020',
          E'400 m south from downtown La Fortuna, on the way to La Fortuna Waterfall, La Fortuna, Alajuela, Costa Rica',
          E'La Fortuna mountain-bike rental shop with official public model listings, daily pricing, components, and size availability for its mountain-bike fleet.',
          10.4669811,
          -84.6464356
        ),
        (
          E'Nosara MTB',
          E'Nosara, Costa Rica',
          E'michaelzick+nosaramtb@gmail.com',
          E'mountain-bikes',
          E'https://nosaramtb.com/',
          E'+506 2573 3948',
          E'Gilded Iguana Athletic Center, Playa Guiones north, Nosara, Guanacaste 50206, Costa Rica',
          E'Nosara mountain-bike shop with public rental listings for Specialized and Rocky Mountain model-level bikes and USD day/week pricing.',
          9.9470000,
          -85.6650000
        ),
        (
          E'Buen Camino Bike Park',
          E'San Mateo, Costa Rica',
          E'michaelzick+buencamino@gmail.com',
          E'mountain-bikes',
          E'https://buencaminocr.com/',
          E'+506 7235 5075',
          E'Finca Ecologica El Bosque, San Mateo, Alajuela, Costa Rica',
          E'Costa Rica bike park with an official Specialized Turbo Levo rental page, public USD rental price, and bike-park contact information.',
          9.9467012,
          -84.5328223
        ),
        (
          E'Line Up Surf Shop',
          E'Coronado, Panama',
          E'michaelzick+lineuptrade@gmail.com',
          E'surfboards',
          E'https://lineuptrade.com/',
          E'+507 6770-1244',
          E'Plaza Las Lajas, first floor, local PA4, Coronado, Panama',
          E'Coronado surf shop with an official surfboard rental catalog listing brand and model boards plus daily and weekly USD rental pricing.',
          8.5468434,
          -79.9119799
        ),
        (
          E'Santa Catalina Surf Shop',
          E'Santa Catalina, Panama',
          E'michaelzick+santacatalinasurfshop@gmail.com',
          E'surfboards',
          E'https://www.santacatalinasurfshop.com/',
          E'+507 6780 2104',
          E'Estero Street, Hotel Santa Catalina, Santa Catalina, Panama',
          E'Santa Catalina surf shop with public model-level surfboard rental listings and per-day USD pricing for available boards.',
          7.6289928,
          -81.2528320
        ),
        (
          E'Sunzal Surf Company',
          E'El Tunco, El Salvador',
          E'michaelzick+sunzalsurfcompany@gmail.com',
          E'surfboards',
          E'https://www.sunzal.com/',
          E'+1 720-575-5341',
          E'Hotel Roca Sunzal, El Tunco, La Libertad, El Salvador',
          E'El Salvador surf company with an official surfboard rental page that exposes model-level gallery entries and USD rental prices.',
          13.4933551,
          -89.3849212
        )
    ) AS s(name, city, email, category, website, phone, address, about, lat, lng)
  LOOP
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
