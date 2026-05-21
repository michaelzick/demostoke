-- Seed future official demo events for the public demo calendar.
-- Source review date: 2026-05-20.
-- Eligibility: future, U.S.-focused, official hands-on demo/test events.
-- This migration is intentionally data-only and non-destructive.

WITH seed_events (
  external_event_id,
  title,
  company,
  gear_category,
  event_date,
  event_time,
  location,
  location_lat,
  location_lng,
  equipment_available,
  thumbnail_url,
  is_featured,
  created_by,
  source_primary_url
) AS (
  VALUES
    (
      'demo_evt_nw_tune_up_2026_bike_demos',
      'NW Tune-Up Festival 2026 Bike Demos',
      'NW Tune-Up',
      'mountain-bikes',
      DATE '2026-07-10',
      NULL::time,
      'Bellingham, WA',
      NULL::numeric,
      NULL::numeric,
      'Official NW Tune-Up bike demos for festival attendees.',
      'https://nwtuneup.com/sites/default/files/2022-10/Tune-Up_Icon_2023.png',
      false,
      '98f914a6-2a72-455d-aa4b-41b081f4014d'::uuid,
      'https://nwtuneup.com/bikes/demos'
    ),
    (
      'demo_evt_socal_bike_expo_2026_demo_trail',
      'SoCal Bike Expo 2026 Demo Trail',
      'SoCal Bike Expo',
      'mountain-bikes',
      DATE '2026-10-30',
      NULL::time,
      'Central Park, Santa Clarita, CA',
      NULL::numeric,
      NULL::numeric,
      'Official SoCal Bike Expo demo trail for bike testing.',
      'https://www.socal-expo.com/wp-content/uploads/2026/02/CentralParkDemoTrail.jpg',
      false,
      '98f914a6-2a72-455d-aa4b-41b081f4014d'::uuid,
      'https://www.socal-expo.com/'
    )
)
INSERT INTO public.demo_calendar (
  external_event_id,
  title,
  company,
  gear_category,
  event_date,
  event_time,
  location,
  location_lat,
  location_lng,
  equipment_available,
  thumbnail_url,
  is_featured,
  created_by,
  source_primary_url
)
SELECT
  se.external_event_id,
  se.title,
  se.company,
  se.gear_category,
  se.event_date,
  se.event_time,
  se.location,
  se.location_lat,
  se.location_lng,
  se.equipment_available,
  se.thumbnail_url,
  se.is_featured,
  se.created_by,
  se.source_primary_url
FROM seed_events se
WHERE se.event_date >= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1
    FROM public.demo_calendar dc
    WHERE dc.external_event_id = se.external_event_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.demo_calendar dc
    WHERE lower(dc.title) = lower(se.title)
      AND dc.event_date = se.event_date
      AND lower(coalesce(dc.location, '')) = lower(coalesce(se.location, ''))
  );
