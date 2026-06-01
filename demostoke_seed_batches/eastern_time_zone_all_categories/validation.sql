-- =============================================
-- DEMOSTOKE BATCH VALIDATION
-- Batch: eastern_time_zone_all_categories
-- Expected result: all failure checks return zero rows unless explicitly noted.
-- This file is SELECT-only and must not be placed in supabase/migrations/.
-- =============================================

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
)
SELECT 'missing_auth_user' AS check_name, se.email
FROM seed_emails se
LEFT JOIN auth.users u ON u.email = se.email
WHERE u.id IS NULL;

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'missing_profile' AS check_name, su.email
FROM seed_users su
LEFT JOIN public.profiles p ON p.id = su.id
WHERE p.id IS NULL;

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'missing_or_wrong_role' AS check_name, su.email, ur.display_role
FROM seed_users su
LEFT JOIN public.user_roles ur ON ur.user_id = su.id
WHERE ur.user_id IS NULL
   OR ur.display_role <> 'retail-store';

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'bad_equipment_required_fields' AS check_name, su.email, e.name
FROM seed_users su
JOIN public.equipment e ON e.user_id = su.id
WHERE e.category IS NULL
   OR e.status IS NULL
   OR e.location_address IS NULL
   OR e.location_lat IS NULL
   OR e.location_lng IS NULL
   OR e.visible_on_map IS DISTINCT FROM true;

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'invalid_skill_level' AS check_name, su.email, e.name, e.suitable_skill_level
FROM seed_users su
JOIN public.equipment e ON e.user_id = su.id
WHERE e.suitable_skill_level NOT IN (
  'Beginner',
  'Beginner, Intermediate',
  'Beginner, Intermediate, Advanced',
  'Beginner, Intermediate, Advanced, Expert'
);

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'possible_size_in_name' AS check_name, su.email, e.name
FROM seed_users su
JOIN public.equipment e ON e.user_id = su.id
WHERE e.name ~* '(^|[^a-z0-9])([0-9]{2,3}cm|[0-9]+''[0-9]*|[0-9]+ft|S[1-6]|XS|SM|MD|LG|XL)([^a-z0-9]|$)';

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT 'duplicate_equipment_name_for_user' AS check_name, su.email, e.name, count(*)
FROM seed_users su
JOIN public.equipment e ON e.user_id = su.id
GROUP BY su.email, e.user_id, e.name
HAVING count(*) > 1;

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
),
image_counts AS (
  SELECT e.id, su.email, e.name, count(ei.id) AS image_count
  FROM seed_users su
  JOIN public.equipment e ON e.user_id = su.id
  LEFT JOIN public.equipment_images ei ON ei.equipment_id = e.id
  GROUP BY e.id, su.email, e.name
)
SELECT 'equipment_image_count_not_two' AS check_name, email, name, image_count
FROM image_counts
WHERE image_count <> 2;

WITH seed_emails(email) AS (
  VALUES
    ('michaelzick+belleayremountainhighmount@gmail.com'),
    ('michaelzick+highlandmountainbikeparknorthfield@gmail.com'),
    ('michaelzick+thundermountainbikeparkcharlemont@gmail.com'),
    ('michaelzick+ridekanugahendersonville@gmail.com'),
    ('michaelzick+realwatersportswaves@gmail.com'),
    ('michaelzick+warmwindssurfshopnarragansett@gmail.com'),
    ('michaelzick+cinnamonrainbowsnorthhampton@gmail.com')
),
seed_users AS (
  SELECT u.id, u.email
  FROM auth.users u
  JOIN seed_emails se ON se.email = u.email
)
SELECT su.email, e.category, count(DISTINCT e.id) AS gear_count, count(ei.id) AS image_count
FROM seed_users su
JOIN public.equipment e ON e.user_id = su.id
LEFT JOIN public.equipment_images ei ON ei.equipment_id = e.id
GROUP BY su.email, e.category
ORDER BY su.email, e.category;
