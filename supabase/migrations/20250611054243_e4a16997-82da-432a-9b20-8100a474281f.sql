
-- Add a visibility column to the equipment table
ALTER TABLE public.equipment 
ADD COLUMN visible_on_map boolean NOT NULL DEFAULT true;

-- Add a comment to explain the column
COMMENT ON COLUMN public.equipment.visible_on_map IS 'Controls whether the equipment is visible on maps, search results, and public listings';
;
