-- Add column for AI search preference
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS use_ai_search boolean NOT NULL DEFAULT true;

-- Initialize existing rows with default value
UPDATE public.user_preferences SET use_ai_search = true WHERE use_ai_search IS NULL;
