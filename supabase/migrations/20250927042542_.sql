-- Update design system settings with correct design token values
-- Based on the HSL values from the design tokens file

UPDATE design_system_settings SET
  -- Main colors (correcting the wrong primary color)
  primary_color = '#00bfbe',  -- was #1c32c6, should be from HSL(186, 100%, 48%)
  accent_color = '#ff6b35',   -- from HSL(14, 100%, 60%)
  success_color = '#22c55e',  -- from HSL(142, 71%, 45%)
  destructive_color = '#ef4444', -- from HSL(0, 84%, 60%)
  warning_color = '#f59e0b',  -- from HSL(43, 96%, 56%)
  background_color = '#ffffff', -- from HSL(0, 0%, 100%)
  foreground_color = '#020817', -- from HSL(222, 84%, 5%)
  muted_color = '#f1f5f9',    -- from HSL(210, 40%, 96%)
  border_color = '#e2e8f0',   -- from HSL(214, 32%, 91%)
  ring_color = '#00bfbe',     -- same as primary
  
  -- Dark mode colors
  accent_color_dark = '#ff8c66', -- from HSL(14, 100%, 70%)
  success_color_dark = '#4ade80', -- from HSL(142, 69%, 58%)
  destructive_color_dark = '#f87171', -- from HSL(0, 84%, 73%)
  warning_color_dark = '#fbbf24',  -- from HSL(43, 96%, 56%)
  background_color_dark = '#020817', -- from HSL(222, 84%, 5%)
  foreground_color_dark = '#f8fafc', -- from HSL(210, 40%, 98%)
  muted_color_dark = '#1e293b',   -- from HSL(215, 28%, 17%)
  border_color_dark = '#334155',  -- from HSL(215, 25%, 27%)
  ring_color_dark = '#0da2e7',    -- same as primary_dark
  
  -- Sidebar colors
  sidebar_background = '#f8fafc',  -- from HSL(210, 40%, 98%)
  sidebar_foreground = '#020817',  -- from HSL(222, 84%, 5%)
  sidebar_primary = '#00bfbe',     -- same as primary
  sidebar_primary_foreground = '#ffffff', -- white
  sidebar_accent = '#f1f5f9',      -- from HSL(210, 40%, 96%)
  sidebar_accent_foreground = '#020817', -- from HSL(222, 84%, 5%)
  sidebar_border = '#e2e8f0',      -- from HSL(214, 32%, 91%)
  sidebar_ring = '#00bfbe',        -- same as primary
  
  -- Sidebar dark colors
  sidebar_background_dark = '#020817', -- from HSL(222, 84%, 5%)
  sidebar_foreground_dark = '#f8fafc', -- from HSL(210, 40%, 98%)
  sidebar_primary_dark = '#0da2e7',    -- same as primary_dark
  sidebar_primary_foreground_dark = '#020817', -- from HSL(222, 84%, 5%)
  sidebar_accent_dark = '#1e293b',     -- from HSL(215, 28%, 17%)
  sidebar_accent_foreground_dark = '#f8fafc', -- from HSL(210, 40%, 98%)
  sidebar_border_dark = '#334155',     -- from HSL(215, 25%, 27%)
  sidebar_ring_dark = '#0da2e7',       -- same as primary_dark
  
  -- Spacing (update to pixel values)
  spacing_xs = '4px',
  spacing_sm = '8px', 
  spacing_md = '16px',
  spacing_lg = '24px',
  spacing_xl = '32px',
  spacing_2xl = '48px',
  spacing_3xl = '64px',
  spacing_4xl = '96px',
  
  -- Typography sizes
  font_display_lg = '64px',
  font_display_md = '48px',
  font_display_sm = '36px',
  font_heading_lg = '30px',
  font_heading_md = '24px', 
  font_heading_sm = '20px',
  font_body_lg = '18px',
  font_body_md = '16px',
  font_body_sm = '14px',
  font_caption = '12px'

WHERE TRUE; -- Update all existing records;
