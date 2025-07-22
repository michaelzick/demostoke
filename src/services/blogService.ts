
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/lib/blog/types";
import { blogPosts as staticBlogPosts } from "@/lib/blog";

export const blogService = {
  // Get all blog posts (database + static)
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      // Get database posts
      const { data: dbPosts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching database blog posts:', error);
        return staticBlogPosts;
      }

      // Convert database posts to BlogPost format with slug as id
      const formattedDbPosts: BlogPost[] = (dbPosts || []).map(post => {
        console.log('Processing DB post:', { id: post.id, slug: post.slug, author: post.author });
        return {
          id: post.slug || post.id, // Use slug as id for routing
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          authorId: post.author_id,
          publishedAt: post.published_at,
          readTime: post.read_time,
          heroImage: post.hero_image || '',
          thumbnail: post.thumbnail || '',
          videoEmbed: post.video_embed || undefined,
          tags: post.tags || []
        };
      });

      // Combine and sort by publishedAt
      const allPosts = [...formattedDbPosts, ...staticBlogPosts]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      console.log('Final combined posts count:', allPosts.length);
      console.log('Sample post for debugging:', allPosts.find(p => p.id === 'b7eda836-d10c-450f-8db4-3be940ed63a6'));

      return allPosts;
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      return staticBlogPosts;
    }
  },

  // Get featured post IDs from database + static posts
  async getFeaturedPostIds(): Promise<string[]> {
    try {
      const { data: dbPosts } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('is_featured', true);

      return (dbPosts || []).map(post => post.id);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },

  // Create a new blog post in the database
  async createPost(postData: Omit<BlogPost, 'id'> & { slug?: string }): Promise<{ success: boolean; post?: BlogPost; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          category: postData.category,
          author: postData.author,
          author_id: postData.authorId,
          published_at: postData.publishedAt,
          read_time: postData.readTime,
          hero_image: postData.heroImage,
          thumbnail: postData.thumbnail,
          video_embed: postData.videoEmbed,
          tags: postData.tags,
          is_featured: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        return { success: false, error: error.message };
      }

      const createdPost: BlogPost = {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author,
        authorId: data.author_id,
        publishedAt: data.published_at,
        readTime: data.read_time,
        heroImage: data.hero_image || '',
        thumbnail: data.thumbnail || '',
        videoEmbed: data.video_embed || undefined,
        tags: data.tags || []
      };

      return { success: true, post: createdPost };
    } catch (error) {
      console.error('Error in createPost:', error);
      return { success: false, error: 'Failed to create blog post' };
    }
  },

  // Update featured status
  async updateFeaturedStatus(postId: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_featured: featured })
        .eq('id', postId);

      if (error) {
        console.error('Error updating featured status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateFeaturedStatus:', error);
      return { success: false, error: 'Failed to update featured status' };
    }
  }
};
