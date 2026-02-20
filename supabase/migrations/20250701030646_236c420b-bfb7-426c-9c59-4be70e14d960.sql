
-- Update all demo calendar events from 2024 to 2025
UPDATE public.demo_calendar 
SET event_date = event_date + INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM event_date) = 2024;
;
