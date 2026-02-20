-- Create design_system_profiles table for design system specific user data
CREATE TABLE public.design_system_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  company TEXT,
  website_url TEXT,
  github_url TEXT,
  dribbble_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_system_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for design_system_profiles
CREATE POLICY "Users can view all design system profiles" 
ON public.design_system_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own design system profile" 
ON public.design_system_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own design system profile" 
ON public.design_system_profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own design system profile" 
ON public.design_system_profiles 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_design_system_profiles_updated_at
BEFORE UPDATE ON public.design_system_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_design_system_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.design_system_profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'https://api.dicebear.com/6.x/avataaars/svg?seed=' || NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create design system profile when user signs up
CREATE TRIGGER on_auth_user_created_design_system
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_design_system_user();;
