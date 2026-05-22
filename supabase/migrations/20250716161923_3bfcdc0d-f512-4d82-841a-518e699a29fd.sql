-- Add slug column to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN slug text;

-- Create unique index on slug for faster lookups
CREATE UNIQUE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Update existing posts to have slugs (if any exist)
UPDATE public.blog_posts 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;