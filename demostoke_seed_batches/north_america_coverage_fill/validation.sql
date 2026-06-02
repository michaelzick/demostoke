-- Read-only validation for north_america_coverage_fill.
-- Safe to run against linked DemoStoke DB after remote apply.

WITH expected_shops (name, email, category, expected_gear_count) AS (
  VALUES
    ('Surf Mexico', 'michaelzick+surfmexicobucerias@gmail.com', 'surfboards', 8),
    ('BikeFlow Oaxaca', 'michaelzick+bikeflowoaxaca@gmail.com', 'mountain-bikes', 5),
    ('Bike Denali', 'michaelzick+bikedenali@gmail.com', 'mountain-bikes', 1),
    ('Dismount Bike Shop', 'michaelzick+dismounttoronto@gmail.com', 'mountain-bikes', 3),
    ('Willi''s Ski and Board Seven Springs', 'michaelzick+willissevensprings@gmail.com', 'skis', 10),
    ('Tactics Bend', 'michaelzick+tacticsbend@gmail.com', 'snowboards', 10)
),
actual AS (
  SELECT
    es.name,
    es.email,
    es.category,
    es.expected_gear_count,
    p.id AS profile_id,
    p.address,
    p.location_lat,
    p.location_lng,
    COUNT(DISTINCT e.id) FILTER (WHERE e.category = es.category) AS actual_gear_count,
    COUNT(ei.id) FILTER (WHERE e.category = es.category) AS image_count
  FROM expected_shops es
  LEFT JOIN auth.users au ON au.email = es.email
  LEFT JOIN public.profiles p ON p.id = au.id
  LEFT JOIN public.equipment e ON e.user_id = au.id
  LEFT JOIN public.equipment_images ei ON ei.equipment_id = e.id
  GROUP BY es.name, es.email, es.category, es.expected_gear_count, p.id, p.address, p.location_lat, p.location_lng
)
SELECT
  name,
  email,
  category,
  profile_id IS NOT NULL AS profile_exists,
  expected_gear_count,
  actual_gear_count,
  image_count,
  image_count = actual_gear_count * 2 AS has_two_images_each,
  address,
  location_lat,
  location_lng
FROM actual
ORDER BY name;

WITH expected_emails (email) AS (
  VALUES
    ('michaelzick+surfmexicobucerias@gmail.com'),
    ('michaelzick+bikeflowoaxaca@gmail.com'),
    ('michaelzick+bikedenali@gmail.com'),
    ('michaelzick+dismounttoronto@gmail.com'),
    ('michaelzick+willissevensprings@gmail.com'),
    ('michaelzick+tacticsbend@gmail.com')
)
SELECT
  au.email,
  ur.display_role
FROM expected_emails ee
LEFT JOIN auth.users au ON au.email = ee.email
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
ORDER BY au.email;
