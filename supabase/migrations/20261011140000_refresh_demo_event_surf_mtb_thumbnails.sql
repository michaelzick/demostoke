-- Replace the surfboards and mountain-bikes demo event category images chosen
-- in 20261011130000 with stronger photos. Pexels License (free to use, no
-- attribution required), served as 800x800 square crops from the Pexels CDN:
--   surfboards      5544783  https://www.pexels.com/photo/5544783/
--   snowboards      10808867 https://www.pexels.com/photo/10808867/ (unchanged)
--   skis            6783201  https://www.pexels.com/photo/6783201/ (unchanged)
--   mountain-bikes  3880623  https://www.pexels.com/photo/3880623/
-- Keep in sync with DEMO_EVENT_CATEGORY_IMAGES in src/lib/seo/publicMetadata.js
-- and supabase/functions/discover-demo-events/index.ts.
--
-- Only rows still on the previous category image (or with no thumbnail) are
-- updated, so custom thumbnails set by an admin are left alone.

CREATE OR REPLACE FUNCTION pg_temp.demo_event_category_image(p_category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_category
    WHEN 'surfboards' THEN 'https://images.pexels.com/photos/5544783/pexels-photo-5544783.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'snowboards' THEN 'https://images.pexels.com/photos/10808867/pexels-photo-10808867.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'skis' THEN 'https://images.pexels.com/photos/6783201/pexels-photo-6783201.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'mountain-bikes' THEN 'https://images.pexels.com/photos/3880623/pexels-photo-3880623.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
  END
$$;

CREATE OR REPLACE FUNCTION pg_temp.previous_demo_event_category_image(p_category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_category
    WHEN 'surfboards' THEN 'https://images.pexels.com/photos/4609198/pexels-photo-4609198.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'mountain-bikes' THEN 'https://images.pexels.com/photos/90454/pexels-photo-90454.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
  END
$$;

UPDATE public.demo_calendar
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE gear_category IN ('surfboards', 'mountain-bikes')
  AND (
    thumbnail_url IS NULL
    OR thumbnail_url = pg_temp.previous_demo_event_category_image(gear_category)
  );

UPDATE public.demo_event_candidates
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE gear_category IN ('surfboards', 'mountain-bikes')
  AND (
    thumbnail_url IS NULL
    OR thumbnail_url = pg_temp.previous_demo_event_category_image(gear_category)
  );
