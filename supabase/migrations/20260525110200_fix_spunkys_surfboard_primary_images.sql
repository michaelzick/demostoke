-- Seed correction: Spunky's Surf Shop surfboard primary images
-- Batch: florida_surf_shops
-- Created: 2026-05-25
-- Apply to remote (human approval required):
--   supabase db query --linked -f "/Users/michaelzick/Engineering/GitHub/demostoke/supabase/migrations/20260525110200_fix_spunkys_surfboard_primary_images.sql"
-- Do NOT use supabase db push or supabase migration up.
--
-- Corrects the Spunky's surfboard primary placeholder from the skis secondary image
-- to the canonical surfboard primary image.
-- Surfboards primary image: https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg

DO $$
DECLARE
  v_updated int := 0;
  v_remaining_bad int := 0;
BEGIN
  WITH target_images AS (
    SELECT ei.id
    FROM public.equipment_images ei
    JOIN public.equipment e ON e.id = ei.equipment_id
    JOIN auth.users au ON au.id = e.user_id
    WHERE au.email = 'michaelzick+spunkyssurfshopfortpierce@gmail.com'
      AND e.category = 'surfboards'
      AND ei.display_order = 0
      AND ei.is_primary = true
  ),
  fixed AS (
    UPDATE public.equipment_images ei
    SET image_url = 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg',
        updated_at = now()
    FROM target_images ti
    WHERE ti.id = ei.id
      AND ei.image_url IS DISTINCT FROM 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg'
    RETURNING ei.id
  )
  SELECT count(*) INTO v_updated FROM fixed;

  SELECT count(*) INTO v_remaining_bad
  FROM public.equipment_images ei
  JOIN public.equipment e ON e.id = ei.equipment_id
  JOIN auth.users au ON au.id = e.user_id
  WHERE au.email = 'michaelzick+spunkyssurfshopfortpierce@gmail.com'
    AND e.category = 'surfboards'
    AND ei.display_order = 0
    AND ei.is_primary = true
    AND ei.image_url IS DISTINCT FROM 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg';

  IF v_remaining_bad <> 0 THEN
    RAISE EXCEPTION 'Spunky surfboard primary image correction incomplete: remaining_bad=%', v_remaining_bad;
  END IF;

  RAISE NOTICE 'Spunky surfboard primary images fixed=%', v_updated;
END $$;
