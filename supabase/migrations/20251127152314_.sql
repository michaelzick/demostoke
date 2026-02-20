-- Add created_from_post_id column to track when a draft is created from an existing published post
ALTER TABLE blog_posts 
ADD COLUMN created_from_post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_blog_posts_created_from_post_id ON blog_posts(created_from_post_id);;
