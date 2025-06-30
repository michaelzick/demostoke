
-- Remove the map_display_mode setting from app_settings table
DELETE FROM public.app_settings WHERE setting_key = 'map_display_mode';
