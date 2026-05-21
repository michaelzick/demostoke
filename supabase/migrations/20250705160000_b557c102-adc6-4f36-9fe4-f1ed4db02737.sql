-- Add default setting for AI search
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('use_ai_search', 'true'::jsonb);
