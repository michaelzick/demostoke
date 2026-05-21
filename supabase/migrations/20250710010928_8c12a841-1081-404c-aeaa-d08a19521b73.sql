-- Update RLS policies for equipment_images to allow admins to manage any equipment images

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert images for their equipment" ON public.equipment_images;
DROP POLICY IF EXISTS "Users can update images for their equipment" ON public.equipment_images;
DROP POLICY IF EXISTS "Users can delete images for their equipment" ON public.equipment_images;

-- Create new policies that allow both owners and admins
CREATE POLICY "Users and admins can insert images for equipment" 
ON public.equipment_images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.equipment 
    WHERE equipment.id = equipment_images.equipment_id 
    AND (equipment.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Users and admins can update images for equipment" 
ON public.equipment_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.equipment 
    WHERE equipment.id = equipment_images.equipment_id 
    AND (equipment.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Users and admins can delete images for equipment" 
ON public.equipment_images 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.equipment 
    WHERE equipment.id = equipment_images.equipment_id 
    AND (equipment.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);