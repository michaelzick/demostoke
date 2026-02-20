
-- Add subcategory column to equipment table
ALTER TABLE equipment 
ADD COLUMN subcategory text;

-- Insert Olympic Bike Shop's Full Suspension Mountain Bikes
INSERT INTO equipment (
  id,
  user_id,
  name,
  category,
  subcategory,
  description,
  price_per_day,
  image_url,
  location_lat,
  location_lng,
  location_zip,
  status,
  visible_on_map,
  suitable_skill_level,
  material,
  size,
  weight,
  damage_deposit,
  created_at,
  updated_at
) VALUES
-- Ibis Ripley V5
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Ibis Ripley V5',
  'mountain-bikes',
  'Full Suspension',
  'The Ripley is Ibis''s snappy, flickable, playful, fast, lightweight, and versatile 29" trail bike. Its combination of modern geometry, a stiff lightweight carbon chassis, and 120mm of ultra efficient dw-link travel, means it''s equally happy popping off bonus lines as it is crushing all day epics.',
  140,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Carbon Fiber',
  'Small, Medium, XTRAMedium, Large, XL',
  '13kg',
  120.00,
  now(),
  now()
),
-- Ibis Ripmo XT
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Ibis Ripmo XT',
  'mountain-bikes',
  'Full Suspension',
  'High-performance full suspension mountain bike with advanced geometry and premium components. Perfect for aggressive trail riding and technical terrain.',
  140,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Advanced',
  'Carbon Fiber',
  'M (5''5" to 5''9"), XM (5''8" to 6''), L, XL',
  '14kg',
  120.00,
  now(),
  now()
),
-- Trek Fuel EX 8 GX AXS
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Trek Fuel EX 8 GX AXS',
  'mountain-bikes',
  'Full Suspension',
  'Trek''s versatile full suspension trail bike featuring advanced suspension design and premium SRAM GX AXS wireless shifting. Built for all-mountain adventures with exceptional climbing efficiency and descending capability.',
  140,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Carbon Fiber',
  'S, M, ML, L, XL',
  '13.5kg',
  120.00,
  now(),
  now()
);

-- Add pricing options for the new mountain bikes
-- Daily and hourly rates for each equipment item
INSERT INTO pricing_options (equipment_id, price, duration)
SELECT 
  e.id,
  140,
  'day'
FROM equipment e
WHERE e.user_id = '5c9b414f-1066-414d-a656-6941217f363a'
AND e.category = 'mountain-bikes'
AND e.subcategory = 'Full Suspension'
AND e.created_at >= now() - interval '1 minute'

UNION ALL

SELECT 
  e.id,
  20,  -- $20/hour for premium full suspension bikes
  'hour'
FROM equipment e
WHERE e.user_id = '5c9b414f-1066-414d-a656-6941217f363a'
AND e.category = 'mountain-bikes'
AND e.subcategory = 'Full Suspension'
AND e.created_at >= now() - interval '1 minute';
;
