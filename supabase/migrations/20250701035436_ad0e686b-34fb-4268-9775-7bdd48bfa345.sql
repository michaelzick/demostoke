
-- Make company field required (NOT NULL) in demo_calendar table
ALTER TABLE public.demo_calendar 
ALTER COLUMN company SET NOT NULL;
;
