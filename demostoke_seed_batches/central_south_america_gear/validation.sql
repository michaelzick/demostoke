-- Read-only validation for central_south_america_gear.
-- Safe to run against linked DemoStoke DB after remote apply.

WITH expected_shops (name, email, category, expected_gear_count) AS (
  VALUES
    ('MTB Guatemala', 'michaelzick+mtbguatemala@gmail.com', 'mountain-bikes', 9),
    ('Bike Arenal', 'michaelzick+bikearenal@gmail.com', 'mountain-bikes', 3),
    ('Nosara MTB', 'michaelzick+nosaramtb@gmail.com', 'mountain-bikes', 4),
    ('Buen Camino Bike Park', 'michaelzick+buencamino@gmail.com', 'mountain-bikes', 1),
    ('Line Up Surf Shop', 'michaelzick+lineuptrade@gmail.com', 'surfboards', 22),
    ('Santa Catalina Surf Shop', 'michaelzick+santacatalinasurfshop@gmail.com', 'surfboards', 2),
    ('Sunzal Surf Company', 'michaelzick+sunzalsurfcompany@gmail.com', 'surfboards', 33)
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
    ('michaelzick+mtbguatemala@gmail.com'),
    ('michaelzick+bikearenal@gmail.com'),
    ('michaelzick+nosaramtb@gmail.com'),
    ('michaelzick+buencamino@gmail.com'),
    ('michaelzick+lineuptrade@gmail.com'),
    ('michaelzick+santacatalinasurfshop@gmail.com'),
    ('michaelzick+sunzalsurfcompany@gmail.com')
)
SELECT
  au.email,
  ur.display_role
FROM expected_emails ee
LEFT JOIN auth.users au ON au.email = ee.email
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
ORDER BY au.email;

WITH duplicate_targets (name, email, website_fragment) AS (
  VALUES
    ('mtb guatemala', 'michaelzick+mtbguatemala@gmail.com', 'mtbguatemala.com'),
    ('bike arenal', 'michaelzick+bikearenal@gmail.com', 'bikearenal.com'),
    ('nosara mtb', 'michaelzick+nosaramtb@gmail.com', 'nosaramtb.com'),
    ('buen camino bike park', 'michaelzick+buencamino@gmail.com', 'buencaminocr.com'),
    ('line up surf shop', 'michaelzick+lineuptrade@gmail.com', 'lineuptrade.com'),
    ('santa catalina surf shop', 'michaelzick+santacatalinasurfshop@gmail.com', 'santacatalinasurfshop.com'),
    ('sunzal surf company', 'michaelzick+sunzalsurfcompany@gmail.com', 'sunzal.com')
)
SELECT
  p.name,
  p.website,
  p.address,
  au.email,
  COUNT(DISTINCT e.id) AS gear_count
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
LEFT JOIN public.equipment e ON e.user_id = p.id
WHERE EXISTS (
  SELECT 1
  FROM duplicate_targets dt
  WHERE lower(p.name) = dt.name
     OR lower(coalesce(au.email, '')) = dt.email
     OR lower(coalesce(p.website, '')) LIKE '%' || dt.website_fragment || '%'
)
GROUP BY p.name, p.website, p.address, au.email
ORDER BY p.name;
