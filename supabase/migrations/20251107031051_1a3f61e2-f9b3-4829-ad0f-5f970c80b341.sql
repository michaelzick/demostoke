-- Add location coordinates to demo_calendar table
ALTER TABLE demo_calendar
ADD COLUMN location_lat numeric,
ADD COLUMN location_lng numeric;