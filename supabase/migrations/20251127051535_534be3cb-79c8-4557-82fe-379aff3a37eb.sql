-- Add draft system columns to blog_posts table
ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_auto_saved_at timestamp with time zone;

-- Make fields nullable for incomplete drafts
ALTER TABLE public.blog_posts 
  ALTER COLUMN excerpt DROP NOT NULL,
  ALTER COLUMN content DROP NOT NULL,
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN author DROP NOT NULL,
  ALTER COLUMN author_id DROP NOT NULL;

-- Add check constraint for valid status values
ALTER TABLE public.blog_posts 
  ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON public.blog_posts(status, published_at DESC);

-- Update existing posts to have status = 'published' (for any NULL status)
UPDATE public.blog_posts SET status = 'published' WHERE status IS NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

-- Create new RLS policies for draft system

-- Public can only view published posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

-- Users can view their own posts (any status)
CREATE POLICY "Users can view their own blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own posts
CREATE POLICY "Users can create their own blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());