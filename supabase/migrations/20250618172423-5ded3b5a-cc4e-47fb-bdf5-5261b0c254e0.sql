
-- First, let's find the Olympic Bike Shop user ID from profiles table
-- We'll need to add the equipment for Olympic Bike Shop with their actual coordinates

-- Insert Olympic Bike Shop's equipment into the equipment table
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
  created_at,
  updated_at
) VALUES
-- Carbon Full Suspension Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Santa Cruz Carbon Full Suspension Bikes',
  'mountain-bikes',
  'Premium carbon full suspension mountain bikes. Models include: Santa Cruz Hightower, Tallboy, Blur, Megatower, Bronson. Perfect for advanced mountain biking adventures. $125/day, $20/hour rates available.',
  125,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Advanced',
  'Carbon Fiber',
  'Various sizes available',
  '12-15kg',
  now(),
  now()
),
-- Premium Full Suspension Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Premium Full Suspension Mountain Bikes',
  'mountain-bikes',
  'High-quality full suspension mountain bikes. Models include: Santa Cruz 5010, Trek Fuel EX. Great for intermediate to advanced riders. $110/day, $18/hour rates available.',
  110,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Intermediate',
  'Aluminum',
  'Various sizes available',
  '13-16kg',
  now(),
  now()
),
-- Basic Full Suspension Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Basic Full Suspension Mountain Bikes',
  'mountain-bikes',
  'Reliable full suspension mountain bikes for all skill levels. Models include: Trek Fuel EX, Santa Cruz Tallboy (older models). $95/day, $16/hour rates available.',
  95,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Aluminum',
  'Various sizes available',
  '14-17kg',
  now(),
  now()
),
-- Hardtail Mountain Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Hardtail Mountain Bikes',
  'mountain-bikes',
  'Efficient hardtail mountain bikes perfect for cross-country riding. Models include: Trek Marlin Series, Specialized Rockhopper. $60/day, $10/hour rates available.',
  60,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Aluminum',
  'Various sizes available',
  '12-15kg',
  now(),
  now()
),
-- Road Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Road Bikes',
  'mountain-bikes',
  'High-performance road bikes for pavement adventures. Models include: Trek Emonda, Trek Domane. Perfect for road cycling around Lake Tahoe. $60/day, $10/hour rates available.',
  60,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Intermediate',
  'Carbon Fiber',
  'Various sizes available',
  '8-10kg',
  now(),
  now()
),
-- Electric Mountain Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Electric Mountain Bikes',
  'mountain-bikes',
  'Powerful electric mountain bikes for extended adventures. Models include: Trek Rail 5, Trek Powerfly. Electric assist for longer rides. $125/day, $20/hour rates available.',
  125,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Intermediate',
  'Aluminum',
  'Various sizes available',
  '20-25kg',
  now(),
  now()
),
-- Electric Cruiser Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Electric Cruiser Bikes',
  'mountain-bikes',
  'Comfortable electric cruiser bikes for leisurely rides. Models include: Electra Townie Go! Perfect for casual rides around town. $90/day, $15/hour rates available.',
  90,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Aluminum',
  'Various sizes available',
  '18-22kg',
  now(),
  now()
),
-- Cruiser Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Cruiser Bikes',
  'mountain-bikes',
  'Classic cruiser bikes for comfortable, relaxed riding. Models include: Electra Cruiser, Sun Revolutions. Great for beach paths and casual rides. $45/day, $8/hour rates available.',
  45,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Steel',
  'Various sizes available',
  '15-18kg',
  now(),
  now()
),
-- Kids' Bikes
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Kids Mountain Bikes',
  'mountain-bikes',
  'Safe and fun bikes designed for children. Models include: Trek Precaliber. Perfect for getting kids started with cycling. $30/day, $6/hour rates available.',
  30,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Aluminum',
  '12"-24" wheel sizes',
  '8-12kg',
  now(),
  now()
),
-- Tag-A-Long & Trailers
(
  gen_random_uuid(),
  '5c9b414f-1066-414d-a656-6941217f363a',
  'Tag-A-Long Bikes & Trailers',
  'mountain-bikes',
  'Family cycling solutions for riding with children. Models include: Adams Trail-a-Bike, Burley Trailer. Perfect for family adventures. $25/day, $5/hour rates available.',
  25,
  'https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80',
  39.1658,
  -120.1429,
  'Tahoe City, CA 96145',
  'available',
  false,
  'Beginner',
  'Aluminum',
  'Adjustable',
  '5-10kg',
  now(),
  now()
);

-- Add pricing options for each equipment item
INSERT INTO pricing_options (equipment_id, price, duration)
SELECT 
  e.id,
  e.price_per_day,
  'day'
FROM equipment e
WHERE e.user_id = '5c9b414f-1066-414d-a656-6941217f363a'
AND e.created_at >= now() - interval '1 minute';
