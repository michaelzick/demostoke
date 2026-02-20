-- Add unique constraint on user_id for design_system_settings table
-- This allows UPSERT operations to work correctly
ALTER TABLE public.design_system_settings 
ADD CONSTRAINT design_system_settings_user_id_unique UNIQUE (user_id);;
