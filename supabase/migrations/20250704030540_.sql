-- Initialize featured blog posts setting in app_settings table
INSERT INTO public.app_settings (setting_key, setting_value, updated_by)
VALUES ('featured_blog_posts', '[]'::jsonb, NULL)
ON CONFLICT (setting_key) DO NOTHING;;
