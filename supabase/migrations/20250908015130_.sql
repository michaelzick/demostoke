-- Create design_system_settings table
CREATE TABLE public.design_system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT DEFAULT 'DemoStoke Design System',
  project_description TEXT,
  project_version TEXT DEFAULT '1.0.0',
  default_theme TEXT DEFAULT 'light',
  auto_publish BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true,
  public_components BOOLEAN DEFAULT false,
  code_generation TEXT DEFAULT 'typescript',
  storybook_port TEXT DEFAULT '6006',
  build_command TEXT,
  test_command TEXT,
  font_family TEXT DEFAULT 'inter',
  base_font_size TEXT DEFAULT '16',
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#6b7280',
  accent_color TEXT DEFAULT '#f59e0b',
  success_color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own design system settings" 
ON public.design_system_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own design system settings" 
ON public.design_system_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own design system settings" 
ON public.design_system_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own design system settings" 
ON public.design_system_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_design_system_settings_updated_at
BEFORE UPDATE ON public.design_system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Copy avatar from profiles to design_system_profiles for Michael Zick
UPDATE public.design_system_profiles 
SET avatar_url = (
  SELECT avatar_url 
  FROM public.profiles 
  WHERE id = '98f914a6-2a72-455d-aa4b-41b081f4014d'
)
WHERE user_id = '98f914a6-2a72-455d-aa4b-41b081f4014d';;
