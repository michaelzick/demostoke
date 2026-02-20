-- Create design_system_components table
CREATE TABLE public.design_system_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  component_code TEXT NOT NULL,
  props_schema JSONB DEFAULT '{}',
  stories JSONB DEFAULT '[]',
  figma_file_id TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated'))
);

-- Enable Row Level Security
ALTER TABLE public.design_system_components ENABLE ROW LEVEL SECURITY;

-- Create policies for component access
CREATE POLICY "Users can view public components and their own components" 
ON public.design_system_components 
FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own components" 
ON public.design_system_components 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own components" 
ON public.design_system_components 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own components" 
ON public.design_system_components 
FOR DELETE 
USING (created_by = auth.uid());

-- Admins can manage all components
CREATE POLICY "Admins can manage all components" 
ON public.design_system_components 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_design_system_components_updated_at
BEFORE UPDATE ON public.design_system_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_design_system_components_created_by ON public.design_system_components(created_by);
CREATE INDEX idx_design_system_components_category ON public.design_system_components(category);
CREATE INDEX idx_design_system_components_status ON public.design_system_components(status);
CREATE INDEX idx_design_system_components_is_public ON public.design_system_components(is_public);
CREATE INDEX idx_design_system_components_tags ON public.design_system_components USING GIN(tags);;
