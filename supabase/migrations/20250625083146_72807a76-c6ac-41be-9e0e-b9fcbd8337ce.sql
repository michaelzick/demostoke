
-- Add price_per_hour and price_per_week columns to equipment table
ALTER TABLE public.equipment 
ADD COLUMN price_per_hour numeric,
ADD COLUMN price_per_week numeric;

-- Update existing equipment records to set default values (optional)
-- This prevents null values for existing records
UPDATE public.equipment 
SET price_per_hour = 0, price_per_week = 0 
WHERE price_per_hour IS NULL OR price_per_week IS NULL;
;
