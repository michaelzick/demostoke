-- Create Figma integration tables
CREATE TABLE public.figma_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  user_info JSONB NOT NULL,
  team_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.figma_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  figma_file_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  component_count INTEGER DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'not-synced' CHECK (sync_status IN ('synced', 'outdated', 'not-synced', 'error')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, figma_file_id)
);

CREATE TABLE public.figma_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  figma_file_id UUID NOT NULL REFERENCES public.figma_files(id) ON DELETE CASCADE,
  figma_component_id TEXT NOT NULL,
  figma_component_name TEXT NOT NULL,
  design_system_component_id UUID REFERENCES public.design_system_components(id) ON DELETE SET NULL,
  mapping_status TEXT NOT NULL DEFAULT 'unmapped' CHECK (mapping_status IN ('mapped', 'unmapped', 'conflict')),
  component_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(figma_file_id, figma_component_id)
);

-- Enable Row Level Security
ALTER TABLE public.figma_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figma_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figma_components ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for figma_connections
CREATE POLICY "Users can create their own figma connections"
ON public.figma_connections
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own figma connections"
ON public.figma_connections
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own figma connections"
ON public.figma_connections
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own figma connections"
ON public.figma_connections
FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for figma_files
CREATE POLICY "Users can create their own figma files"
ON public.figma_files
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own figma files"
ON public.figma_files
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own figma files"
ON public.figma_files
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own figma files"
ON public.figma_files
FOR DELETE 
USING (user_id = auth.uid());

-- Create RLS policies for figma_components
CREATE POLICY "Users can create figma components for their files"
ON public.figma_components
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.figma_files 
  WHERE id = figma_components.figma_file_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can view figma components for their files"
ON public.figma_components
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.figma_files 
  WHERE id = figma_components.figma_file_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update figma components for their files"
ON public.figma_components
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.figma_files 
  WHERE id = figma_components.figma_file_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can delete figma components for their files"
ON public.figma_components
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.figma_files 
  WHERE id = figma_components.figma_file_id 
  AND user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_figma_connections_updated_at
  BEFORE UPDATE ON public.figma_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_figma_files_updated_at
  BEFORE UPDATE ON public.figma_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_figma_components_updated_at
  BEFORE UPDATE ON public.figma_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
