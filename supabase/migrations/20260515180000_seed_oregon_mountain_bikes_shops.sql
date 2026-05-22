-- Seed migration: Oregon Mountain Bikes shops
-- Batch: oregon_mountain_bikes
-- Created: 2026-05-15
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/DemoStoke/Agentic Automation/Claude Cowork/demostoke-gear-adder/migrations/20260515180000_seed_oregon_mountain_bikes_shops.sql"
-- Do NOT use supabase db push or supabase migration up.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- CREATE/UPSERT USER: Cog Wild Bend
-- =============================================
DO $$
DECLARE
  new_user_id uuid; v_avatar_url text; v_hero_image_url text;
  v_category text := 'mountain-bikes'; v_display_role text := 'retail-store'; v_email text := 'michaelzick+cogwildbend@gmail.com';
BEGIN
  v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
  v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_current, email_change_token_new, email_change_confirm_status, phone_change, phone_change_token, reauthentication_token) VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email, crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')), now(), jsonb_build_object('name', 'Cog Wild Bend'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), now(), now(), '', '', '', '', '', 0, '', '', '');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', v_email), 'email', new_user_id::text, now(), now(), now());
  END IF;
  UPDATE public.profiles SET name='Cog Wild Bend', website='https://www.cogwild.com/', phone='(541) 385-7002', address='115 SW Columbia Street, Bend, OR 97702', about=E'Bend-based mountain bike tour and rental operator offering Santa Cruz mountain bikes from its Mt. Bachelor Park & Ride location. Public rental page lists model-level options including Santa Cruz Vala and Santa Cruz Chameleon with daily prices, plus full-suspension, kids, and gravel categories.', location_lat=44.0426911, location_lng=-121.3151335, avatar_url=COALESCE(v_avatar_url, avatar_url), hero_image_url=COALESCE(v_hero_image_url, hero_image_url) WHERE id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.profiles (id, name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url) VALUES (new_user_id, 'Cog Wild Bend', 'https://www.cogwild.com/', '(541) 385-7002', '115 SW Columbia Street, Bend, OR 97702', E'Bend-based mountain bike tour and rental operator offering Santa Cruz mountain bikes from its Mt. Bachelor Park & Ride location. Public rental page lists model-level options including Santa Cruz Vala and Santa Cruz Chameleon with daily prices, plus full-suspension, kids, and gravel categories.', 44.0426911, -121.3151335, v_avatar_url, v_hero_image_url); END IF;
  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role); END IF;
  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;

-- =============================================
-- CREATE/UPSERT USER: Cog Wild Oakridge
-- =============================================
DO $$
DECLARE
  new_user_id uuid; v_avatar_url text; v_hero_image_url text;
  v_category text := 'mountain-bikes'; v_display_role text := 'retail-store'; v_email text := 'michaelzick+cogwildoakridge@gmail.com';
BEGIN
  v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
  v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_current, email_change_token_new, email_change_confirm_status, phone_change, phone_change_token, reauthentication_token) VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email, crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')), now(), jsonb_build_object('name', 'Cog Wild Oakridge'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), now(), now(), '', '', '', '', '', 0, '', '', '');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', v_email), 'email', new_user_id::text, now(), now(), now());
  END IF;
  UPDATE public.profiles SET name='Cog Wild Oakridge', website='https://www.cogwild.com/', phone='(541) 385-7002', address='48333 E. First St., Oakridge, OR 97463', about=E'Oakridge location of Cog Wild offering e-bikes and full-suspension mountain bike rentals for the Oakridge trail network. Public rental page lists Santa Cruz Vala Alloy 70, Bullit Carbon 90, Nomad, Bronson, and Megatower options with daily prices and size availability.', location_lat=43.7477643, location_lng=-122.4566687, avatar_url=COALESCE(v_avatar_url, avatar_url), hero_image_url=COALESCE(v_hero_image_url, hero_image_url) WHERE id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.profiles (id, name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url) VALUES (new_user_id, 'Cog Wild Oakridge', 'https://www.cogwild.com/', '(541) 385-7002', '48333 E. First St., Oakridge, OR 97463', E'Oakridge location of Cog Wild offering e-bikes and full-suspension mountain bike rentals for the Oakridge trail network. Public rental page lists Santa Cruz Vala Alloy 70, Bullit Carbon 90, Nomad, Bronson, and Megatower options with daily prices and size availability.', 43.7477643, -122.4566687, v_avatar_url, v_hero_image_url); END IF;
  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role); END IF;
  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;

-- =============================================
-- CREATE/UPSERT USER: Sunnyside Sports
-- =============================================
DO $$
DECLARE
  new_user_id uuid; v_avatar_url text; v_hero_image_url text;
  v_category text := 'mountain-bikes'; v_display_role text := 'retail-store'; v_email text := 'michaelzick+sunnysidesportsbend@gmail.com';
BEGIN
  v_avatar_url := 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/profile-images/ad2ad153-bb35-4e88-bfb0-d0d4f85ba62f/profile-1752637760487.png';
  v_hero_image_url := 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3';
  SELECT id INTO new_user_id FROM auth.users WHERE email = v_email LIMIT 1;
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_current, email_change_token_new, email_change_confirm_status, phone_change, phone_change_token, reauthentication_token) VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email, crypt('$uO9RX^1P%bd#8crEAM!', gen_salt('bf')), now(), jsonb_build_object('name', 'Sunnyside Sports'), jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), now(), now(), '', '', '', '', '', 0, '', '', '');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', v_email), 'email', new_user_id::text, now(), now(), now());
  END IF;
  UPDATE public.profiles SET name='Sunnyside Sports', website='https://www.sunnysidesports.com/', phone='(541) 382-8018', address='930 NW Newport Ave, Bend, OR 97703', about=E'Bend bike shop with public mountain bike rental pricing and a public rental widget showing model-level full-suspension and hardtail inventory. Seeded models include Ibis, Yeti, and Trek mountain bikes with 24-hour rental rates.', location_lat=44.0626697, location_lng=-121.3257029, avatar_url=COALESCE(v_avatar_url, avatar_url), hero_image_url=COALESCE(v_hero_image_url, hero_image_url) WHERE id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.profiles (id, name, website, phone, address, about, location_lat, location_lng, avatar_url, hero_image_url) VALUES (new_user_id, 'Sunnyside Sports', 'https://www.sunnysidesports.com/', '(541) 382-8018', '930 NW Newport Ave, Bend, OR 97703', E'Bend bike shop with public mountain bike rental pricing and a public rental widget showing model-level full-suspension and hardtail inventory. Seeded models include Ibis, Yeti, and Trek mountain bikes with 24-hour rental rates.', 44.0626697, -121.3257029, v_avatar_url, v_hero_image_url); END IF;
  UPDATE public.user_roles SET display_role = v_display_role WHERE user_id = new_user_id;
  IF NOT FOUND THEN INSERT INTO public.user_roles (user_id, display_role) VALUES (new_user_id, v_display_role); END IF;
  RAISE NOTICE 'User upserted: id=%, email=%', new_user_id, v_email;
END $$;
