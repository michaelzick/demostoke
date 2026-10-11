-- Replace the surfboards demo event category image with a public domain picryl
-- photo the user picked:
--   https://cdn12.picryl.com/photo/2016/12/31/surfer-surfing-surfboard-travel-vacation-cc28fe-1024.jpg
-- picryl's CDN rejects non-browser clients (link-preview crawlers included), so
-- a recompressed 1024x682 copy is hosted in the public gear-images bucket.
-- Other categories are unchanged:
--   snowboards      Pexels 10808867
--   skis            Pexels 6783201
--   mountain-bikes  Pexels 3880623
-- Keep in sync with DEMO_EVENT_CATEGORY_IMAGES in src/lib/seo/publicMetadata.js
-- and supabase/functions/discover-demo-events/index.ts.
--
-- Only rows still on a previous surfboards category image (or with no
-- thumbnail) are updated, so custom thumbnails set by an admin are left alone.

CREATE OR REPLACE FUNCTION pg_temp.demo_event_category_image(p_category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_category
    WHEN 'surfboards' THEN 'https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/gear-images/demo-event-thumbnails/surfboards-picryl-cc28fe.jpg'
    WHEN 'snowboards' THEN 'https://images.pexels.com/photos/10808867/pexels-photo-10808867.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'skis' THEN 'https://images.pexels.com/photos/6783201/pexels-photo-6783201.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    WHEN 'mountain-bikes' THEN 'https://images.pexels.com/photos/3880623/pexels-photo-3880623.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
  END
$$;

UPDATE public.demo_calendar
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE gear_category = 'surfboards'
  AND (
    thumbnail_url IS NULL
    OR thumbnail_url IN (
      'https://images.pexels.com/photos/4609198/pexels-photo-4609198.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
      'https://images.pexels.com/photos/5544783/pexels-photo-5544783.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    )
  );

UPDATE public.demo_event_candidates
SET thumbnail_url = pg_temp.demo_event_category_image(gear_category)
WHERE gear_category = 'surfboards'
  AND (
    thumbnail_url IS NULL
    OR thumbnail_url IN (
      'https://images.pexels.com/photos/4609198/pexels-photo-4609198.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
      'https://images.pexels.com/photos/5544783/pexels-photo-5544783.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop'
    )
  );
