-- Read-only validation for central_south_america_surfboards_followup.
-- Safe to run against linked DemoStoke DB after remote apply.

WITH expected_shops (name, email, category, expected_gear_count) AS (
  VALUES
    ('Sunzal Surf Company', 'michaelzick+sunzalsurfcompany@gmail.com', 'surfboards', 36),
    ('Nosara Surfboards', 'michaelzick+nosarasurfboards@gmail.com', 'surfboards', 9)
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

WITH expected_names (email, name) AS (
  VALUES
    ('michaelzick+sunzalsurfcompany@gmail.com', 'Hypto Krypto'),
    ('michaelzick+sunzalsurfcompany@gmail.com', 'Barahona 9''0'),
    ('michaelzick+sunzalsurfcompany@gmail.com', 'Sci-Fi Volume LFT'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Sharpeye FT Inferno Carbon 5''10'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Sharpeye Inferno 72 Carbon 5''10'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Firewire Slater Designs S Boss Volcano I-Bolic 6''0'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Pyzel Ghost XL 6''2'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Firewire Slater Designs S Boss Turquoise I-Bolic 6''2'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Sharpeye Mid Length 6''6'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Chilli Mid Strength 7''0'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Lost Glydra 7''0'),
    ('michaelzick+nosarasurfboards@gmail.com', 'Channel Islands CI 2 Pro 5''10')
)
SELECT
  en.email,
  en.name,
  e.id IS NOT NULL AS gear_exists,
  e.price_per_day,
  e.currency_code,
  COUNT(ei.id) AS image_count
FROM expected_names en
LEFT JOIN auth.users au ON au.email = en.email
LEFT JOIN public.equipment e
  ON e.user_id = au.id
 AND e.category = 'surfboards'
 AND lower(btrim(e.name)) = lower(btrim(en.name))
LEFT JOIN public.equipment_images ei ON ei.equipment_id = e.id
GROUP BY en.email, en.name, e.id, e.price_per_day, e.currency_code
ORDER BY en.email, en.name;

WITH duplicate_targets (name, email, website_fragment) AS (
  VALUES
    ('nosara surfboards', 'michaelzick+nosarasurfboards@gmail.com', 'nosarasurfboards.com')
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
