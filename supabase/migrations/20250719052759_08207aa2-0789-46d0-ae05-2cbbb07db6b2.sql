-- Add is_featured column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN is_featured boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering featured gear
CREATE INDEX idx_equipment_is_featured ON public.equipment(is_featured) WHERE is_featured = true;