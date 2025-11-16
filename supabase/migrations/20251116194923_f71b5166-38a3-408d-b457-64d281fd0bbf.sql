-- Add recently_viewed_equipment column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN recently_viewed_equipment JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.recently_viewed_equipment IS 
'Array of recently viewed equipment: [{"equipment_id": "uuid", "viewed_at": "ISO timestamp"}]. Max 10 items, newest first.';