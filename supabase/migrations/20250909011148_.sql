-- Add missing color token columns to design_system_settings table
ALTER TABLE public.design_system_settings 
ADD COLUMN IF NOT EXISTS destructive_color text DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS warning_color text DEFAULT '#f59e0b',
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS foreground_color text DEFAULT '#0f172a',
ADD COLUMN IF NOT EXISTS muted_color text DEFAULT '#f1f5f9',
ADD COLUMN IF NOT EXISTS border_color text DEFAULT '#e2e8f0',
ADD COLUMN IF NOT EXISTS ring_color text DEFAULT '#3b82f6',

-- Add dark mode variants for colors
ADD COLUMN IF NOT EXISTS primary_color_dark text DEFAULT '#60a5fa',
ADD COLUMN IF NOT EXISTS secondary_color_dark text DEFAULT '#9ca3af',
ADD COLUMN IF NOT EXISTS accent_color_dark text DEFAULT '#fbbf24',
ADD COLUMN IF NOT EXISTS success_color_dark text DEFAULT '#34d399',
ADD COLUMN IF NOT EXISTS destructive_color_dark text DEFAULT '#f87171',
ADD COLUMN IF NOT EXISTS warning_color_dark text DEFAULT '#fbbf24',
ADD COLUMN IF NOT EXISTS background_color_dark text DEFAULT '#0f172a',
ADD COLUMN IF NOT EXISTS foreground_color_dark text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS muted_color_dark text DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS border_color_dark text DEFAULT '#334155',
ADD COLUMN IF NOT EXISTS ring_color_dark text DEFAULT '#60a5fa',

-- Add sidebar color tokens
ADD COLUMN IF NOT EXISTS sidebar_background text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS sidebar_foreground text DEFAULT '#0f172a',
ADD COLUMN IF NOT EXISTS sidebar_primary text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS sidebar_primary_foreground text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS sidebar_accent text DEFAULT '#f1f5f9',
ADD COLUMN IF NOT EXISTS sidebar_accent_foreground text DEFAULT '#0f172a',
ADD COLUMN IF NOT EXISTS sidebar_border text DEFAULT '#e2e8f0',
ADD COLUMN IF NOT EXISTS sidebar_ring text DEFAULT '#3b82f6',

-- Add dark mode sidebar variants
ADD COLUMN IF NOT EXISTS sidebar_background_dark text DEFAULT '#020817',
ADD COLUMN IF NOT EXISTS sidebar_foreground_dark text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS sidebar_primary_dark text DEFAULT '#60a5fa',
ADD COLUMN IF NOT EXISTS sidebar_primary_foreground_dark text DEFAULT '#0f172a',
ADD COLUMN IF NOT EXISTS sidebar_accent_dark text DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS sidebar_accent_foreground_dark text DEFAULT '#f8fafc',
ADD COLUMN IF NOT EXISTS sidebar_border_dark text DEFAULT '#334155',
ADD COLUMN IF NOT EXISTS sidebar_ring_dark text DEFAULT '#60a5fa',

-- Add spacing tokens
ADD COLUMN IF NOT EXISTS spacing_xs text DEFAULT '0.5rem',
ADD COLUMN IF NOT EXISTS spacing_sm text DEFAULT '0.75rem',
ADD COLUMN IF NOT EXISTS spacing_md text DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS spacing_lg text DEFAULT '1.5rem',
ADD COLUMN IF NOT EXISTS spacing_xl text DEFAULT '2rem',
ADD COLUMN IF NOT EXISTS spacing_2xl text DEFAULT '3rem',
ADD COLUMN IF NOT EXISTS spacing_3xl text DEFAULT '4rem',
ADD COLUMN IF NOT EXISTS spacing_4xl text DEFAULT '6rem',

-- Add typography scale tokens
ADD COLUMN IF NOT EXISTS font_display_lg text DEFAULT '4rem',
ADD COLUMN IF NOT EXISTS font_display_md text DEFAULT '3rem',
ADD COLUMN IF NOT EXISTS font_display_sm text DEFAULT '2.25rem',
ADD COLUMN IF NOT EXISTS font_heading_lg text DEFAULT '1.875rem',
ADD COLUMN IF NOT EXISTS font_heading_md text DEFAULT '1.5rem',
ADD COLUMN IF NOT EXISTS font_heading_sm text DEFAULT '1.25rem',
ADD COLUMN IF NOT EXISTS font_body_lg text DEFAULT '1.125rem',
ADD COLUMN IF NOT EXISTS font_body_md text DEFAULT '1rem',
ADD COLUMN IF NOT EXISTS font_body_sm text DEFAULT '0.875rem',
ADD COLUMN IF NOT EXISTS font_caption text DEFAULT '0.75rem';;
