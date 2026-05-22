-- =============================================
-- FIX: Arizona Mountain Bikes — size field cleanup
-- Applies to: Fair Wheel Bikes, Bike Emporium, Thunder Mountain Bikes
-- Reason: size column was populated with raw spec strings instead of
--         clean size names (Small, Medium, Large, XL format).
-- These 3 shops were already seeded; this migration UPDATEs in place.
-- McDowell Mountain Cycles (2 bikes) was never inserted (130400 failed);
-- it is handled by the corrected 20260512130400_seed_mcdowell_mountain_cycles_gear.sql.
-- =============================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN

  -- -----------------------------------------------
  -- Fair Wheel Bikes (Tucson)
  -- -----------------------------------------------
  SELECT id INTO v_user_id FROM auth.users
  WHERE email = 'michaelzick+fairwheelbikestucson@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+fairwheelbikestucson@gmail.com';
  END IF;

  UPDATE public.equipment SET size = 'Medium, Large'
  WHERE user_id = v_user_id AND name = 'Trek Fuel+ EX 8';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'
  WHERE user_id = v_user_id AND name = 'Trek Fuel EX 8';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'
  WHERE user_id = v_user_id AND name = 'Specialized Chisel FS';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'
  WHERE user_id = v_user_id AND name = 'Trek Procaliber';

  RAISE NOTICE 'Fair Wheel Bikes: size fields updated';

  -- -----------------------------------------------
  -- Bike Emporium (Scottsdale)
  -- -----------------------------------------------
  SELECT id INTO v_user_id FROM auth.users
  WHERE email = 'michaelzick+bikeemporiumscottsdale@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+bikeemporiumscottsdale@gmail.com';
  END IF;

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'
  WHERE user_id = v_user_id AND name = 'Cannondale Habit Aluminum';

  RAISE NOTICE 'Bike Emporium: size fields updated';

  -- -----------------------------------------------
  -- Thunder Mountain Bikes (Sedona)
  -- -----------------------------------------------
  SELECT id INTO v_user_id FROM auth.users
  WHERE email = 'michaelzick+thundermountainbikessedona@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found: michaelzick+thundermountainbikessedona@gmail.com';
  END IF;

  -- Dream tier
  UPDATE public.equipment SET size = 'Small, Medium, Large'
  WHERE user_id = v_user_id AND name = 'Evil The Following LS AXS';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'
  WHERE user_id = v_user_id AND name = 'Evil The Offering V3 AXS';

  UPDATE public.equipment SET size = 'Medium, Large'
  WHERE user_id = v_user_id AND name = 'Evil The Offering V4 AXS';

  UPDATE public.equipment SET size = 'Medium, Large'         -- X-Medium omitted (non-standard)
  WHERE user_id = v_user_id AND name = 'Ibis Ripley V5 Di2';

  UPDATE public.equipment SET size = 'Medium, Large, XL'     -- X-Medium omitted, X-Large → XL
  WHERE user_id = v_user_id AND name = 'Ibis Ripmo V3';

  UPDATE public.equipment SET size = 'Medium, Large'
  WHERE user_id = v_user_id AND name = 'Santa Cruz Bronson X0 AXS';

  UPDATE public.equipment SET size = 'Medium, Large'
  WHERE user_id = v_user_id AND name = 'Transition Spur Deore XT Di2';

  UPDATE public.equipment SET size = 'Small, Medium, Large'  -- Small=27.5in, M/ML/L=29in
  WHERE user_id = v_user_id AND name = 'Trek Top Fuel 9.8 Di2';

  -- E-Bike tier
  UPDATE public.equipment SET size = 'Small, Medium, XL'     -- X-Large → XL
  WHERE user_id = v_user_id AND name = 'Santa Cruz Vala AL 70';

  UPDATE public.equipment SET size = 'Medium, Large, XL'     -- X-Large → XL
  WHERE user_id = v_user_id AND name = 'Santa Cruz Vala C 90';

  UPDATE public.equipment SET size = 'Small, Medium, Large'
  WHERE user_id = v_user_id AND name = 'Transition Regulator CX XT';

  UPDATE public.equipment SET size = 'Medium, Large'
  WHERE user_id = v_user_id AND name = 'Trek Fuel+ EX 8';

  UPDATE public.equipment SET size = 'Small, XL'             -- only Small and X-Large available
  WHERE user_id = v_user_id AND name = 'Trek Rail 7';

  -- Premium tier
  UPDATE public.equipment SET size = 'Medium, Large, XL'     -- XX-Large omitted (non-standard)
  WHERE user_id = v_user_id AND name = 'Santa Cruz Hightower C 70';

  UPDATE public.equipment SET size = 'Small, Medium, Large'
  WHERE user_id = v_user_id AND name = 'Transition Spur Deore';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'  -- X-Large → XL
  WHERE user_id = v_user_id AND name = 'Transition Spur Eagle 70';

  -- Performance tier
  UPDATE public.equipment SET size = 'Small, Medium, Large'  -- X-Medium omitted
  WHERE user_id = v_user_id AND name = 'Ibis Ripley AF Deore';

  UPDATE public.equipment SET size = 'Small, Medium, Large, XL'  -- Small=27.5, M–XL=29
  WHERE user_id = v_user_id AND name = 'Rocky Mountain Instinct A30';

  UPDATE public.equipment SET size = 'XS, Small, Medium'     -- all 27.5in
  WHERE user_id = v_user_id AND name = 'Transition Scout Deore';

  UPDATE public.equipment SET size = 'Medium, Large, XL'     -- X-Large → XL
  WHERE user_id = v_user_id AND name = 'Trek Fuel EX 8';

  UPDATE public.equipment SET size = 'Small, Medium, Large'  -- Small=27.5, M/ML/L=29
  WHERE user_id = v_user_id AND name = 'Trek Top Fuel 8';

  -- Hardtail tier
  UPDATE public.equipment SET size = 'XS, Small, Medium, Large, XL'  -- XS=27.5, S–XL=29
  WHERE user_id = v_user_id AND name = 'Trek Roscoe 7';

  UPDATE public.equipment SET size = 'Small, Medium'         -- only S and M in MY2026
  WHERE user_id = v_user_id AND name = 'Trek Roscoe 7 2026';

  RAISE NOTICE 'Thunder Mountain Bikes: size fields updated';

END $$;
