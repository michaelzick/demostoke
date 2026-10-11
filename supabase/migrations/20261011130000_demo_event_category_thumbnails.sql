-- Use one licensed category image for every demo event thumbnail.
-- Images are Pexels photos (Pexels License: free to use, no attribution
-- required), served as 800x800 square crops from the Pexels CDN:
--   surfboards      4609198  https://www.pexels.com/photo/man-surfing-on-sea-4609198/
--   snowboards      10808867 https://www.pexels.com/photo/10808867/
--   skis            6783201  https://www.pexels.com/photo/6783201/
--   mountain-bikes  90454    https://www.pexels.com/photo/90454/
-- Keep in sync with DEMO_EVENT_CATEGORY_IMAGES in src/lib/seo/publicMetadata.js
-- and supabase/functions/discover-demo-events/index.ts.

CREATE OR REPLACE FUNCTION pg_temp.demo_event_category_image(p_category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_category
    WHEN 'surfboards' THEN 'https://images.pexels.com/photos/4609198/pexels-photo-4609198.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'snowboards' THEN 'https://images.pexels.com/photos/10808867/pexels-photo-10808867.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'skis' THEN 'https://images.pexels.com/photos/6783201/pexels-photo-6783201.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'mountain-bikes' THEN 'https://images.pexels.com/photos/90454/pexels-photo-90454.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
  END
$$;

UPDATE public.demo_calendar
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE pg_temp.demo_event_category_image(gear_category) IS NOT NULL
  AND thumbnail_url IS DISTINCT FROM pg_temp.demo_event_category_image(gear_category);

UPDATE public.demo_event_candidates
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE pg_temp.demo_event_category_image(gear_category) IS NOT NULL
  AND thumbnail_url IS DISTINCT FROM pg_temp.demo_event_category_image(gear_category);
