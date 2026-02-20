-- Create new design_system_tokens table
CREATE TABLE public.design_system_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  -- Light mode colors
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#6b7280',
  accent_color text DEFAULT '#f59e0b',
  success_color text DEFAULT '#10b981',
  destructive_color text DEFAULT '#ef4444',
  warning_color text DEFAULT '#f59e0b',
  background_color text DEFAULT '#ffffff',
  foreground_color text DEFAULT '#0f172a',
  muted_color text DEFAULT '#f1f5f9',
  border_color text DEFAULT '#e2e8f0',
  ring_color text DEFAULT '#3b82f6',
  -- Dark mode colors
  primary_color_dark text DEFAULT '#60a5fa',
  secondary_color_dark text DEFAULT '#9ca3af',
  accent_color_dark text DEFAULT '#fbbf24',
  success_color_dark text DEFAULT '#34d399',
  destructive_color_dark text DEFAULT '#f87171',
  warning_color_dark text DEFAULT '#fbbf24',
  background_color_dark text DEFAULT '#0f172a',
  foreground_color_dark text DEFAULT '#f8fafc',
  muted_color_dark text DEFAULT '#1e293b',
  border_color_dark text DEFAULT '#334155',
  ring_color_dark text DEFAULT '#60a5fa',
  -- Sidebar colors
  sidebar_background text DEFAULT '#f8fafc',
  sidebar_foreground text DEFAULT '#0f172a',
  sidebar_primary text DEFAULT '#3b82f6',
  sidebar_primary_foreground text DEFAULT '#ffffff',
  sidebar_accent text DEFAULT '#f1f5f9',
  sidebar_accent_foreground text DEFAULT '#0f172a',
  sidebar_border text DEFAULT '#e2e8f0',
  sidebar_ring text DEFAULT '#3b82f6',
  -- Dark mode sidebar colors
  sidebar_background_dark text DEFAULT '#020817',
  sidebar_foreground_dark text DEFAULT '#f8fafc',
  sidebar_primary_dark text DEFAULT '#60a5fa',
  sidebar_primary_foreground_dark text DEFAULT '#0f172a',
  sidebar_accent_dark text DEFAULT '#1e293b',
  sidebar_accent_foreground_dark text DEFAULT '#f8fafc',
  sidebar_border_dark text DEFAULT '#334155',
  sidebar_ring_dark text DEFAULT '#60a5fa',
  -- Typography
  font_family text DEFAULT 'inter',
  base_font_size text DEFAULT '16',
  font_display_lg text DEFAULT '4rem',
  font_display_md text DEFAULT '3rem',
  font_display_sm text DEFAULT '2.25rem',
  font_heading_lg text DEFAULT '1.875rem',
  font_heading_md text DEFAULT '1.5rem',
  font_heading_sm text DEFAULT '1.25rem',
  font_body_lg text DEFAULT '1.125rem',
  font_body_md text DEFAULT '1rem',
  font_body_sm text DEFAULT '0.875rem',
  font_caption text DEFAULT '0.75rem',
  -- Spacing
  spacing_xs text DEFAULT '0.5rem',
  spacing_sm text DEFAULT '0.75rem',
  spacing_md text DEFAULT '1rem',
  spacing_lg text DEFAULT '1.5rem',
  spacing_xl text DEFAULT '2rem',
  spacing_2xl text DEFAULT '3rem',
  spacing_3xl text DEFAULT '4rem',
  spacing_4xl text DEFAULT '6rem',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.design_system_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own design system tokens" 
ON public.design_system_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own design system tokens" 
ON public.design_system_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own design system tokens" 
ON public.design_system_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own design system tokens" 
ON public.design_system_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Migrate existing token data from design_system_settings to design_system_tokens
INSERT INTO public.design_system_tokens (
  user_id, primary_color, secondary_color, accent_color, success_color, destructive_color, warning_color,
  background_color, foreground_color, muted_color, border_color, ring_color,
  primary_color_dark, secondary_color_dark, accent_color_dark, success_color_dark, destructive_color_dark, warning_color_dark,
  background_color_dark, foreground_color_dark, muted_color_dark, border_color_dark, ring_color_dark,
  sidebar_background, sidebar_foreground, sidebar_primary, sidebar_primary_foreground, sidebar_accent, sidebar_accent_foreground,
  sidebar_border, sidebar_ring, sidebar_background_dark, sidebar_foreground_dark, sidebar_primary_dark, sidebar_primary_foreground_dark,
  sidebar_accent_dark, sidebar_accent_foreground_dark, sidebar_border_dark, sidebar_ring_dark,
  font_family, base_font_size, font_display_lg, font_display_md, font_display_sm, font_heading_lg, font_heading_md, font_heading_sm,
  font_body_lg, font_body_md, font_body_sm, font_caption,
  spacing_xs, spacing_sm, spacing_md, spacing_lg, spacing_xl, spacing_2xl, spacing_3xl, spacing_4xl
)
SELECT 
  user_id, primary_color, secondary_color, accent_color, success_color, destructive_color, warning_color,
  background_color, foreground_color, muted_color, border_color, ring_color,
  primary_color_dark, secondary_color_dark, accent_color_dark, success_color_dark, destructive_color_dark, warning_color_dark,
  background_color_dark, foreground_color_dark, muted_color_dark, border_color_dark, ring_color_dark,
  sidebar_background, sidebar_foreground, sidebar_primary, sidebar_primary_foreground, sidebar_accent, sidebar_accent_foreground,
  sidebar_border, sidebar_ring, sidebar_background_dark, sidebar_foreground_dark, sidebar_primary_dark, sidebar_primary_foreground_dark,
  sidebar_accent_dark, sidebar_accent_foreground_dark, sidebar_border_dark, sidebar_ring_dark,
  font_family, base_font_size, font_display_lg, font_display_md, font_display_sm, font_heading_lg, font_heading_md, font_heading_sm,
  font_body_lg, font_body_md, font_body_sm, font_caption,
  spacing_xs, spacing_sm, spacing_md, spacing_lg, spacing_xl, spacing_2xl, spacing_3xl, spacing_4xl
FROM public.design_system_settings;

-- Remove token columns from design_system_settings table
ALTER TABLE public.design_system_settings 
DROP COLUMN IF EXISTS primary_color,
DROP COLUMN IF EXISTS secondary_color,
DROP COLUMN IF EXISTS accent_color,
DROP COLUMN IF EXISTS success_color,
DROP COLUMN IF EXISTS destructive_color,
DROP COLUMN IF EXISTS warning_color,
DROP COLUMN IF EXISTS background_color,
DROP COLUMN IF EXISTS foreground_color,
DROP COLUMN IF EXISTS muted_color,
DROP COLUMN IF EXISTS border_color,
DROP COLUMN IF EXISTS ring_color,
DROP COLUMN IF EXISTS primary_color_dark,
DROP COLUMN IF EXISTS secondary_color_dark,
DROP COLUMN IF EXISTS accent_color_dark,
DROP COLUMN IF EXISTS success_color_dark,
DROP COLUMN IF EXISTS destructive_color_dark,
DROP COLUMN IF EXISTS warning_color_dark,
DROP COLUMN IF EXISTS background_color_dark,
DROP COLUMN IF EXISTS foreground_color_dark,
DROP COLUMN IF EXISTS muted_color_dark,
DROP COLUMN IF EXISTS border_color_dark,
DROP COLUMN IF EXISTS ring_color_dark,
DROP COLUMN IF EXISTS sidebar_background,
DROP COLUMN IF EXISTS sidebar_foreground,
DROP COLUMN IF EXISTS sidebar_primary,
DROP COLUMN IF EXISTS sidebar_primary_foreground,
DROP COLUMN IF EXISTS sidebar_accent,
DROP COLUMN IF EXISTS sidebar_accent_foreground,
DROP COLUMN IF EXISTS sidebar_border,
DROP COLUMN IF EXISTS sidebar_ring,
DROP COLUMN IF EXISTS sidebar_background_dark,
DROP COLUMN IF EXISTS sidebar_foreground_dark,
DROP COLUMN IF EXISTS sidebar_primary_dark,
DROP COLUMN IF EXISTS sidebar_primary_foreground_dark,
DROP COLUMN IF EXISTS sidebar_accent_dark,
DROP COLUMN IF EXISTS sidebar_accent_foreground_dark,
DROP COLUMN IF EXISTS sidebar_border_dark,
DROP COLUMN IF EXISTS sidebar_ring_dark,
DROP COLUMN IF EXISTS font_family,
DROP COLUMN IF EXISTS base_font_size,
DROP COLUMN IF EXISTS font_display_lg,
DROP COLUMN IF EXISTS font_display_md,
DROP COLUMN IF EXISTS font_display_sm,
DROP COLUMN IF EXISTS font_heading_lg,
DROP COLUMN IF EXISTS font_heading_md,
DROP COLUMN IF EXISTS font_heading_sm,
DROP COLUMN IF EXISTS font_body_lg,
DROP COLUMN IF EXISTS font_body_md,
DROP COLUMN IF EXISTS font_body_sm,
DROP COLUMN IF EXISTS font_caption,
DROP COLUMN IF EXISTS spacing_xs,
DROP COLUMN IF EXISTS spacing_sm,
DROP COLUMN IF EXISTS spacing_md,
DROP COLUMN IF EXISTS spacing_lg,
DROP COLUMN IF EXISTS spacing_xl,
DROP COLUMN IF EXISTS spacing_2xl,
DROP COLUMN IF EXISTS spacing_3xl,
DROP COLUMN IF EXISTS spacing_4xl;

-- Create trigger for updated_at
CREATE TRIGGER update_design_system_tokens_updated_at
  BEFORE UPDATE ON public.design_system_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
