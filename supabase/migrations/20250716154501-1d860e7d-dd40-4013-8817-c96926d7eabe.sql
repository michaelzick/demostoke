-- Create blog_posts table for AI-generated blog posts
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author text NOT NULL,
  author_id text NOT NULL,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  read_time integer NOT NULL DEFAULT 5,
  hero_image text,
  thumbnail text,
  video_embed text,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read blog posts
CREATE POLICY "Anyone can read blog posts"
ON public.blog_posts
FOR SELECT
USING (true);

-- Allow admins to manage blog posts
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();