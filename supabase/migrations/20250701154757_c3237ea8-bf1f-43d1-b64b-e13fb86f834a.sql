
-- Add company field to demo_calendar table
ALTER TABLE public.demo_calendar 
ADD COLUMN company TEXT;

-- Update existing mountain bike events with company "Specialized"
UPDATE public.demo_calendar 
SET company = 'Specialized' 
WHERE gear_category = 'mountain-bikes';

-- Update existing surfboard events with company "Firewire"
UPDATE public.demo_calendar 
SET company = 'Firewire' 
WHERE gear_category = 'surfboards';
