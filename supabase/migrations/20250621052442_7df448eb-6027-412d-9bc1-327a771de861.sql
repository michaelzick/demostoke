
-- Add Olympic Bike Shop's E-Bike inventory to the equipment table
-- One entry per bike model with all sizes combined

INSERT INTO equipment (
  id,
  user_id,
  name,
  category,
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
-- Specialized Turbo Como 3.0 Low Entry (all sizes in one entry)
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Specialized Turbo Como 3.0 Low Entry',
  'e-bikes',
  'Como is a laid-back, comfortable e-Bike with the power of a confident ride. Low step-through frame with upright position reduces stress on hands and upper body. Designed for effortless riding experience.',
  85,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Beginner',
  'Low Step-Through Frame',
  'Small, Medium, Large',
  '22kg',
  100.00,
  now(),
  now()
),
-- Specialized Turbo Como 4.0
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Specialized Turbo Como 4.0',
  'e-bikes',
  'Como is a laid back e-bike with a clean look and upright rider position for convenient comfort and style. Full-power electric bike designed for city streets, equipped with fenders, lights, and low step-through frame. Perfect for daily commutes or riding around town.',
  95,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Low Step-Through Frame',
  'Large',
  '23kg',
  100.00,
  now(),
  now()
),
-- Specialized Turbo Vado
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Specialized Turbo Vado',
  'e-bikes',
  'Vado is the vehicle for everything from daily commutes to fast workouts to longer-than-planned adventures. Smoothest-riding e-Bike experience with redesigned geometry for optimal rider position. Combines road bike speed with mountain bike maneuverability.',
  105,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Traditional Frame',
  'Medium, Large, XL',
  '21kg',
  100.00,
  now(),
  now()
),
-- Specialized Turbo Vado Step-Through
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Specialized Turbo Vado Step-Through',
  'e-bikes',
  'Step-through version of the Turbo Vado for easier mounting and dismounting while maintaining the same performance characteristics.',
  105,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Step-Through Frame',
  'Small, Medium',
  '21kg',
  100.00,
  now(),
  now()
),
-- Specialized Haul LT Cargo E-Bike
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Specialized Haul LT Cargo E-Bike',
  'e-bikes',
  'All the Haul features with an extended back end for increased carrying capacity. 772 watt-hour battery with up to 60mi range, top speed of 28mph. Built with running boards and passenger seats for carrying kids. More customizable with brand new accessory options.',
  150,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Intermediate',
  'Cargo Frame',
  'One Size',
  '32kg',
  120.00,
  now(),
  now()
),
-- Electra Townie Go! 7D
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Electra Townie Go! 7D',
  'e-bikes',
  'Easy to use and lightweight e-bike for everyone. Features Flat Foot Technology, 7 speeds and rear hub pedal-assist motor. Enough power for hills and cross-town rides. Available in both step-over and step-through frame options.',
  75,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  true,
  'Beginner',
  'Step-Over/Step-Through Frame',
  'Step-Over (5''5" to 6''3"), Step-Through (4''11" to 5''11")',
  '20kg',
  100.00,
  now(),
  now()
);

-- Add pricing options for all the new e-bikes
-- Daily and hourly rates for each equipment item
INSERT INTO pricing_options (equipment_id, price, duration)
SELECT 
  e.id,
  e.price_per_day,
  'day'
FROM equipment e
WHERE e.user_id = '5c9b414f-1066-414d-a656-6941217f363a'
AND e.category = 'e-bikes'
AND e.created_at >= now() - interval '1 minute'

UNION ALL

SELECT 
  e.id,
  CASE 
    WHEN e.price_per_day <= 85 THEN 12  -- $12/hour for basic e-bikes
    WHEN e.price_per_day <= 105 THEN 15 -- $15/hour for mid-range e-bikes
    ELSE 20                             -- $20/hour for premium/cargo e-bikes
  END,
  'hour'
FROM equipment e
WHERE e.user_id = '5c9b414f-1066-414d-a656-6941217f363a'
AND e.category = 'e-bikes'
AND e.created_at >= now() - interval '1 minute';
;
