-- Seed migration: Canada ski, snowboard, surf, and mountain-bike shops
-- Batch: canada_ski_snowboard_surf_mtb
-- Created: 2026-05-24
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260524000000_seed_canada_ski_snowboard_surf_mtb_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- CANADA SHOPS
-- Shop/user inserts (auth.users + auth.identities + public.profiles + public.user_roles)
-- The Wax Bench is intentionally excluded here because it already exists as profile 60877048-53da-4efb-842f-2d22e98caef0.
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
          E'GearHub Sports',
          E'Fernie, BC',
          E'michaelzick+gearhubsportsfernie@gmail.com',
          E'mountain-bikes',
          E'https://gearhub.ca/rentals/summer-adventure-rentals/',
          E'250-423-5555',
          E'401 1st Ave, Fernie, BC V0B 1M0',
          E'Fernie outdoor shop with public winter snowboard rentals and summer mountain-bike rental fleets. GearHub publishes source-backed model names and prices for its K2 snowboard, Rocky Mountain bikes, Devinci bikes, and e-mountain-bikes.',
          49.5020785,
          -115.0616403
        ),
        (
          E'Coastal Culture Sports',
          E'Whistler, BC',
          E'michaelzick+coastalculturesportswhistler@gmail.com',
          E'mountain-bikes',
          E'https://coastalculturesports.com/pages/rental-bikes',
          E'604-932-2224',
          E'2010 London Lane, Whistler, BC V8E 0A6',
          E'Whistler Creekside rental and retail shop with public bike rental listings. Coastal Culture Sports publishes Santa Cruz and Rocky Mountain rental models with current starting day prices.',
          50.0951007,
          -122.9894654
        ),
        (
          E'Whistler Sports Rentals',
          E'Whistler, BC',
          E'michaelzick+whistlersportsrentals@gmail.com',
          E'mountain-bikes',
          E'https://whistlersports.com/equipment',
          E'604-938-9700',
          E'4205 Village Square, Whistler, BC V8E 1H4',
          E'Whistler village rental operator with model-level mountain-bike, downhill, and e-mountain-bike rental listings. Whistler Sports publishes Norco and Giant bike models with online CAD rates.',
          50.1151411,
          -122.9567290
        ),
        (
          E'Cross Country Connection',
          E'Whistler, BC',
          E'michaelzick+crosscountryconnectionwhistler@gmail.com',
          E'mountain-bikes',
          E'https://www.crosscountryconnection.ca/',
          E'604-905-0071',
          E'Lost Lake PassivHaus, 7400 Fitzsimmons Rd S, Whistler, BC V8E 0E8',
          E'Whistler Lost Lake rental shop with public summer bike and winter Nordic rental rate sheets. Cross Country Connection publishes specific Norco mountain-bike models and Rossignol ski model families with full-day prices.',
          50.1232691,
          -122.9506367
        ),
        (
          E'Big White Bike Park',
          E'Big White, BC',
          E'michaelzick+bigwhitebikepark@gmail.com',
          E'mountain-bikes',
          E'https://m.bigwhite.com/summer/mountain-biking/rentals-repairs',
          E'250-765-3101',
          E'5315 Big White Road, Big White Mountain, BC V1P 1P3',
          E'Big White Bike Park rental operation with public downhill and enduro mountain-bike rental pricing. The resort publishes Trek model-level rentals for lift-served and enduro riding.',
          49.7379086,
          -118.9459084
        ),
        (
          E'Dialed In Cycling',
          E'Squamish, BC',
          E'michaelzick+dialedincyclingsquamish@gmail.com',
          E'mountain-bikes',
          E'https://dialedincycling.com/rentals/',
          E'604-390-4303',
          E'1796 Depot Rd, Squamish, BC V8B 0P6',
          E'Squamish bike rental and service shop with public mountain-bike rental listings. Dialed In Cycling publishes Marin, Cube, and Kona models with clear day prices for local trail riding.',
          49.7680282,
          -123.1363713
        ),
        (
          E'Essential Cycles',
          E'North Vancouver, BC',
          E'michaelzick+essentialcyclesnorthvancouver@gmail.com',
          E'mountain-bikes',
          E'https://www.essentialcycles.com/collections/all-bike-rentals',
          E'778-861-2453',
          E'305 Mansfield Place, North Vancouver, BC V7J 1E4',
          E'North Vancouver bike shop near the North Shore trail network with public model-level bike rental products. Essential Cycles publishes Ibis and Marin mountain-bike rental models with daily prices.',
          49.3072818,
          -123.0373803
        ),
        (
          E'Lynn Valley Bikes',
          E'North Vancouver, BC',
          E'michaelzick+lynnvalleybikesnorthvancouver@gmail.com',
          E'mountain-bikes',
          E'https://www.lynnvalleybikes.com/articles/rentals-pg209.htm',
          E'604-985-9311',
          E'3028 Mountain Hwy, North Vancouver, BC V7J 2P1',
          E'North Vancouver bike shop close to Mount Fromme with public mountain-bike and e-mountain-bike rental listings. Lynn Valley Bikes publishes Rocky Mountain and Marin models with four-hour and day rates.',
          49.3366003,
          -123.0377266
        ),
        (
          E'Cycle BC Vancouver',
          E'Vancouver, BC',
          E'michaelzick+cyclebcvancouver@gmail.com',
          E'mountain-bikes',
          E'https://cyclebc.ca/vancouver/bicycles/vancouver-mountain-bike-rentals/',
          E'604-709-5663',
          E'73 East 6th Avenue, Vancouver, BC V5T 1J3',
          E'Vancouver bicycle rental shop with public Norco mountain-bike rental listings. Cycle BC publishes full-day and multi-day mountain-bike and e-mountain-bike prices for North Shore trips.',
          49.2658963,
          -123.1030648
        ),
        (
          E'Trail Bicycles',
          E'Courtenay, BC',
          E'michaelzick+trailbicyclescourtenay@gmail.com',
          E'mountain-bikes',
          E'https://www.trailbicycles.ca/articles/bike-rentals-pg191.htm',
          E'250-334-2456',
          E'1170 Cliffe Ave, Courtenay, BC V9N 2K1',
          E'Courtenay bike shop with a public Comox Valley rental fleet. Trail Bicycles publishes current Norco, Trek, Mondraker, and Ibis mountain-bike models with full-day pricing.',
          49.6877188,
          -124.9938260
        ),
        (
          E'Mont-Sainte-Anne Sports Alpins',
          E'Beaupre, QC',
          E'michaelzick+montsainteannesportsalpins@gmail.com',
          E'mountain-bikes',
          E'https://mont-sainte-anne.com/en/biking/rental/',
          E'418-827-4561',
          E'2000 Boulevard du Beau-Pre, Beaupre, QC G0A 1E0',
          E'Mont-Sainte-Anne resort rental center with public downhill, cross-country, and electric mountain-bike rental pricing. Sports Alpins publishes Scott model families with full-day rental prices.',
          47.0734625,
          -70.9049340
        ),
        (
          E'Vallee Bras-du-Nord Shannahan',
          E'Saint-Raymond, QC',
          E'michaelzick+valleebrasdunordshannahan@gmail.com',
          E'mountain-bikes',
          E'https://valleebrasdunord.com/en/pricing/bike-rentals/',
          E'418-337-3635',
          E'2180 Rang Saguenay, Saint-Raymond, QC G3L 3G3',
          E'Vallee Bras-du-Nord Shannahan sector rental operation with public mountain-bike pricing. The official rental page publishes current Devinci model-level rentals with starting day prices.',
          47.0748395,
          -71.8903263
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
    IF NOT FOUND THEN
      INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role);
    END IF;

    RAISE NOTICE 'User upserted successfully: id=%, email=%, role=%', new_user_id, shop.email, v_display_role;
  END LOOP;
END $$;
