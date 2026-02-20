-- Update the existing use_ai_search setting to default to false
UPDATE public.app_settings 
SET setting_value = 'false'::jsonb 
WHERE setting_key = 'use_ai_search';

-- If the setting doesn't exist, insert it with false as default
INSERT INTO public.app_settings (setting_key, setting_value) 
VALUES ('use_ai_search', 'false'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;;
