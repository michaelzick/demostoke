
-- Insert surfboards for Rider Shack profile
INSERT INTO equipment (
  user_id,
  name,
  category,
  price_per_day,
  price_per_week,
  location_zip,
  description,
  status,
  visible_on_map,
  size
) VALUES 
(
  '60a077c1-99c6-4a8a-90c0-0410095e5f59',
  '8'' Maurice Cole Dirty Dingo',
  'surfboards',
  50,
  175,
  '90066',
  'High-performance surfboard from Maurice Cole',
  'available',
  true,
  '8'' x 22" x 3"'
),
(
  '60a077c1-99c6-4a8a-90c0-0410095e5f59',
  '8''6 Takyama In the Pink (epoxy)',
  'surfboards',
  50,
  175,
  '90066',
  'Epoxy construction surfboard with excellent performance',
  'available',
  true,
  '8''6 x 22.5" x 2.95" 64.3L'
),
(
  '60a077c1-99c6-4a8a-90c0-0410095e5f59',
  '9''0 Torq Longboard (epoxy)',
  'surfboards',
  50,
  175,
  '90066',
  'Epoxy longboard perfect for cruising and learning',
  'available',
  true,
  '9''0 x 22 3/4'' x 3 1/4'''
),
(
  '60a077c1-99c6-4a8a-90c0-0410095e5f59',
  '8'' Soft-Top Board',
  'surfboards',
  50,
  175,
  '90066',
  'Beginner-friendly soft-top surfboard',
  'available',
  true,
  '8'' soft-top'
),
(
  '60a077c1-99c6-4a8a-90c0-0410095e5f59',
  '9'' Soft-Top Board',
  'surfboards',
  50,
  175,
  '90066',
  'Beginner-friendly soft-top longboard',
  'available',
  true,
  '9'' soft-top'
);
;
