-- Add native currency support for equipment rental prices.
-- Remote status: local only; not applied to the linked Supabase project.

ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'USD';

ALTER TABLE public.equipment
  DROP CONSTRAINT IF EXISTS equipment_currency_code_iso_check;

ALTER TABLE public.equipment
  ADD CONSTRAINT equipment_currency_code_iso_check
  CHECK (currency_code ~ '^[A-Z]{3}$');

UPDATE public.equipment
SET currency_code = 'MXN'
WHERE location_address ILIKE '%Mexico%'
   OR location_address ILIKE '%Nayarit%'
   OR location_address ILIKE '%Oaxaca%'
   OR location_address ~* '(^|,[[:space:]]*)Oax\.?([[:space:]]|,|$)';

UPDATE public.equipment
SET currency_code = 'CAD'
WHERE currency_code = 'USD'
  AND (
    location_address ILIKE '%Canada%'
    OR location_address ~* '(^|,[[:space:]]*)(BC|ON|QC)([[:space:]]|,|$)'
  );
