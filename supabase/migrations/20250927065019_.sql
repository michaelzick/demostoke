-- Update design_system_tokens table with correct DemoStoke theme hex values
-- These values correspond to the HSL values in designTokens.ts converted to hex

-- Update default values for existing tokens to match DemoStoke theme
UPDATE design_system_tokens SET
  -- Core colors (light mode)
  primary_color = '#00bfff',           -- 186 100% 48% -> DemoStoke cyan blue
  secondary_color = '#f4d291',         -- 39 71% 84% -> DemoStoke warm beige
  accent_color = '#f7fafc',            -- 210 40% 96.1% -> neutral light
  success_color = '#22c55e',           -- 142 70% 45% -> green success
  destructive_color = '#f56565',       -- 0 84.2% 60.2% -> red destructive
  warning_color = '#f59e0b',           -- 38 95% 55% -> amber warning
  background_color = '#ffffff',        -- 0 0% 100% -> pure white
  foreground_color = '#0c1222',        -- 222.2 84% 4.9% -> dark text
  muted_color = '#f7fafc',             -- 210 40% 96.1% -> muted background
  border_color = '#e4e9f2',            -- 214.3 31.8% 91.4% -> light borders
  ring_color = '#1e9eff',              -- 199 89% 48% -> focus ring
  
  -- Core colors (dark mode)  
  primary_color_dark = '#1e9eff',      -- 199 89% 48% -> primary in dark
  secondary_color_dark = '#d4c29c',    -- 39 30% 76% -> secondary in dark
  accent_color_dark = '#334663',       -- 217.2 32.6% 17.5% -> dark accent
  success_color_dark = '#34d399',      -- 142 70% 50% -> success in dark
  destructive_color_dark = '#7c2d12',  -- 0 62.8% 30.6% -> destructive in dark
  warning_color_dark = '#fbbf24',      -- 38 90% 60% -> warning in dark
  background_color_dark = '#0c1222',   -- 222.2 84% 4.9% -> dark background
  foreground_color_dark = '#f7fafc',   -- 210 40% 98% -> light text in dark
  muted_color_dark = '#334663',        -- 217.2 32.6% 17.5% -> muted in dark
  border_color_dark = '#334663',       -- 217.2 32.6% 17.5% -> borders in dark
  ring_color_dark = '#4dabf7',         -- 224.3 76.3% 48% -> focus ring in dark
  
  -- Sidebar colors (light mode)
  sidebar_background = '#fafbfc',      -- 0 0% 98% -> sidebar background
  sidebar_foreground = '#57708a',      -- 240 5.3% 26.1% -> sidebar text
  sidebar_primary = '#1a202c',         -- 240 5.9% 10% -> sidebar primary
  sidebar_primary_foreground = '#fafbfc', -- 0 0% 98% -> text on sidebar primary
  sidebar_accent = '#f7f8f9',          -- 240 4.8% 95.9% -> sidebar accent
  sidebar_accent_foreground = '#1a202c', -- 240 5.9% 10% -> text on sidebar accent
  sidebar_border = '#d7dde7',          -- 220 13% 91% -> sidebar borders
  sidebar_ring = '#339af0',            -- 217.2 91.2% 59.8% -> sidebar focus ring
  
  -- Sidebar colors (dark mode)
  sidebar_background_dark = '#1a202c',  -- 240 5.9% 10% -> dark sidebar background
  sidebar_foreground_dark = '#f7f8f9',  -- 240 4.8% 95.9% -> dark sidebar text
  sidebar_primary_dark = '#4dabf7',     -- 224.3 76.3% 48% -> dark sidebar primary
  sidebar_primary_foreground_dark = '#f7fafc', -- 210 40% 98% -> text on dark sidebar primary
  sidebar_accent_dark = '#374458',      -- 240 3.7% 15.9% -> dark sidebar accent
  sidebar_accent_foreground_dark = '#f7f8f9', -- 240 4.8% 95.9% -> text on dark sidebar accent
  sidebar_border_dark = '#374458',      -- 240 3.7% 15.9% -> dark sidebar borders
  sidebar_ring_dark = '#339af0'         -- 217.2 91.2% 59.8% -> dark sidebar focus ring
WHERE user_id IS NOT NULL;

-- Update the default column values in the schema for future inserts
ALTER TABLE design_system_tokens 
  ALTER COLUMN primary_color SET DEFAULT '#00bfff',
  ALTER COLUMN secondary_color SET DEFAULT '#f4d291',
  ALTER COLUMN accent_color SET DEFAULT '#f7fafc',
  ALTER COLUMN success_color SET DEFAULT '#22c55e',
  ALTER COLUMN destructive_color SET DEFAULT '#f56565',
  ALTER COLUMN warning_color SET DEFAULT '#f59e0b',
  ALTER COLUMN background_color SET DEFAULT '#ffffff',
  ALTER COLUMN foreground_color SET DEFAULT '#0c1222',
  ALTER COLUMN muted_color SET DEFAULT '#f7fafc',
  ALTER COLUMN border_color SET DEFAULT '#e4e9f2',
  ALTER COLUMN ring_color SET DEFAULT '#1e9eff',
  
  ALTER COLUMN primary_color_dark SET DEFAULT '#1e9eff',
  ALTER COLUMN secondary_color_dark SET DEFAULT '#d4c29c',
  ALTER COLUMN accent_color_dark SET DEFAULT '#334663',
  ALTER COLUMN success_color_dark SET DEFAULT '#34d399',
  ALTER COLUMN destructive_color_dark SET DEFAULT '#7c2d12',
  ALTER COLUMN warning_color_dark SET DEFAULT '#fbbf24',
  ALTER COLUMN background_color_dark SET DEFAULT '#0c1222',
  ALTER COLUMN foreground_color_dark SET DEFAULT '#f7fafc',
  ALTER COLUMN muted_color_dark SET DEFAULT '#334663',
  ALTER COLUMN border_color_dark SET DEFAULT '#334663',
  ALTER COLUMN ring_color_dark SET DEFAULT '#4dabf7',
  
  ALTER COLUMN sidebar_background SET DEFAULT '#fafbfc',
  ALTER COLUMN sidebar_foreground SET DEFAULT '#57708a',
  ALTER COLUMN sidebar_primary SET DEFAULT '#1a202c',
  ALTER COLUMN sidebar_primary_foreground SET DEFAULT '#fafbfc',
  ALTER COLUMN sidebar_accent SET DEFAULT '#f7f8f9',
  ALTER COLUMN sidebar_accent_foreground SET DEFAULT '#1a202c',
  ALTER COLUMN sidebar_border SET DEFAULT '#d7dde7',
  ALTER COLUMN sidebar_ring SET DEFAULT '#339af0',
  
  ALTER COLUMN sidebar_background_dark SET DEFAULT '#1a202c',
  ALTER COLUMN sidebar_foreground_dark SET DEFAULT '#f7f8f9',
  ALTER COLUMN sidebar_primary_dark SET DEFAULT '#4dabf7',
  ALTER COLUMN sidebar_primary_foreground_dark SET DEFAULT '#f7fafc',
  ALTER COLUMN sidebar_accent_dark SET DEFAULT '#374458',
  ALTER COLUMN sidebar_accent_foreground_dark SET DEFAULT '#f7f8f9',
  ALTER COLUMN sidebar_border_dark SET DEFAULT '#374458',
  ALTER COLUMN sidebar_ring_dark SET DEFAULT '#339af0';;
