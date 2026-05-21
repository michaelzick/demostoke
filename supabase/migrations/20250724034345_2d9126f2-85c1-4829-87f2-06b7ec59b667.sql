-- Remove show_mock_data setting from app_settings table
DELETE FROM public.app_settings WHERE setting_key = 'show_mock_data';