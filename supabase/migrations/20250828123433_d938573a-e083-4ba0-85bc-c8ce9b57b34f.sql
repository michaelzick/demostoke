-- Add privacy control fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_phone boolean DEFAULT true,
ADD COLUMN show_address boolean DEFAULT true,
ADD COLUMN show_website boolean DEFAULT true,
ADD COLUMN show_location boolean DEFAULT true,
ADD COLUMN privacy_acknowledgment boolean DEFAULT false;

-- Create app_privacy_settings table to document intentional public data exposure
CREATE TABLE public.app_privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_privacy_settings
ALTER TABLE public.app_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_privacy_settings
CREATE POLICY "Anyone can read privacy settings" 
ON public.app_privacy_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage privacy settings" 
ON public.app_privacy_settings 
FOR ALL 
USING (is_admin());

-- Insert documentation about intentional public data exposure
INSERT INTO public.app_privacy_settings (setting_key, setting_value, description) VALUES 
('business_data_policy', 
 '{
   "purpose": "Public business directory",
   "data_types": ["phone", "address", "website", "location"],
   "justification": "Business information is publicly available and intended for customer discovery",
   "user_control": "Users can opt-out of displaying any information",
   "default_visibility": "public"
 }',
 'Documents that public business information exposure is intentional and user-controlled'),
('privacy_acknowledgment_text',
 '{
   "title": "Business Profile Visibility",
   "content": "Your profile information helps customers find and contact your business, similar to Google Business listings. You can control what information is publicly visible at any time.",
   "default_public": ["phone", "address", "website", "location"]
 }',
 'Text shown to users when they set up their privacy preferences');

-- Add trigger for updated_at
CREATE TRIGGER update_app_privacy_settings_updated_at
  BEFORE UPDATE ON public.app_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update all existing profiles to show information by default (maintain current behavior)
UPDATE public.profiles 
SET 
  show_phone = true,
  show_address = true, 
  show_website = true,
  show_location = true,
  privacy_acknowledgment = true
WHERE show_phone IS NULL;