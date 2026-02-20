
-- Create a table to store multiple images for each equipment
CREATE TABLE public.equipment_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_equipment_images_equipment_id ON public.equipment_images(equipment_id);
CREATE INDEX idx_equipment_images_display_order ON public.equipment_images(equipment_id, display_order);

-- Add RLS policies
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;

-- Users can view images for equipment (no user restriction needed for viewing)
CREATE POLICY "Anyone can view equipment images" 
  ON public.equipment_images 
  FOR SELECT 
  USING (true);

-- Users can insert images for their own equipment
CREATE POLICY "Users can insert images for their equipment" 
  ON public.equipment_images 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = equipment_images.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Users can update images for their own equipment
CREATE POLICY "Users can update images for their equipment" 
  ON public.equipment_images 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = equipment_images.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Users can delete images for their own equipment
CREATE POLICY "Users can delete images for their equipment" 
  ON public.equipment_images 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = equipment_images.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_equipment_images_updated_at
    BEFORE UPDATE ON public.equipment_images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add a column to track if equipment has multiple images
ALTER TABLE public.equipment ADD COLUMN has_multiple_images BOOLEAN DEFAULT false;

-- Create a function to automatically update the has_multiple_images flag
CREATE OR REPLACE FUNCTION update_equipment_multiple_images_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the equipment table to reflect if it has multiple images
  UPDATE public.equipment 
  SET has_multiple_images = (
    SELECT COUNT(*) > 1 
    FROM public.equipment_images 
    WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
  )
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the flag
CREATE TRIGGER trigger_update_equipment_multiple_images_on_insert
    AFTER INSERT ON public.equipment_images
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_multiple_images_flag();

CREATE TRIGGER trigger_update_equipment_multiple_images_on_delete
    AFTER DELETE ON public.equipment_images
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_multiple_images_flag();
;
