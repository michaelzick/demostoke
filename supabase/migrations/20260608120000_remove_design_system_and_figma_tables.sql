-- Remove the old DemoStoke design-system and Figma integration schema.
-- The design system now lives outside the main linked DemoStoke Supabase project.

DROP TRIGGER IF EXISTS on_auth_user_created_design_system ON auth.users;
DROP TRIGGER IF EXISTS on_auth_design_system_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_design_system_user();
DROP FUNCTION IF EXISTS public.migrate_figma_tokens_to_vault();
DROP FUNCTION IF EXISTS public.store_figma_token_encrypted(uuid, text, jsonb, text);
DROP FUNCTION IF EXISTS public.get_figma_token_decrypted(uuid);
DROP FUNCTION IF EXISTS public.delete_figma_token_encrypted(uuid);

DROP TABLE IF EXISTS public.figma_components;
DROP TABLE IF EXISTS public.figma_files;
DROP TABLE IF EXISTS public.figma_connections;
DROP TABLE IF EXISTS public.design_system_tokens;
DROP TABLE IF EXISTS public.design_system_settings;
DROP TABLE IF EXISTS public.design_system_components;
DROP TABLE IF EXISTS public.design_system_profiles;
