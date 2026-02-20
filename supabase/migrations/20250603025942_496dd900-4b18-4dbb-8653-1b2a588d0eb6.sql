
-- Create a table for pricing options
CREATE TABLE public.pricing_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('hour', 'day', 'week')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see pricing options for their own equipment
ALTER TABLE public.pricing_options ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view pricing options for their own equipment
CREATE POLICY "Users can view pricing options for their own equipment" 
  ON public.pricing_options 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = pricing_options.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Create policy that allows users to insert pricing options for their own equipment
CREATE POLICY "Users can create pricing options for their own equipment" 
  ON public.pricing_options 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = pricing_options.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Create policy that allows users to update pricing options for their own equipment
CREATE POLICY "Users can update pricing options for their own equipment" 
  ON public.pricing_options 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = pricing_options.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );

-- Create policy that allows users to delete pricing options for their own equipment
CREATE POLICY "Users can delete pricing options for their own equipment" 
  ON public.pricing_options 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment 
      WHERE equipment.id = pricing_options.equipment_id 
      AND equipment.user_id = auth.uid()
    )
  );
;
