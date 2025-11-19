import { supabase } from "@/integrations/supabase/client";

const FEATURED_POSTS_KEY = "featured_blog_posts";
export const MAX_FEATURED_POSTS = 5;

export const featuredPostsService = {
  // Get featured blog posts from Supabase
  async getFeaturedPosts(): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_app_setting', {
        key: FEATURED_POSTS_KEY
      });

      if (error) {
        console.error('Error fetching featured posts:', error);
        return [];
      }

      return Array.isArray(data) ? data.filter((item): item is string => typeof item === 'string') : [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },

  // Set featured blog posts in Supabase
  async setFeaturedPosts(postIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: FEATURED_POSTS_KEY,
          setting_value: postIds,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) {
        console.error('Error updating featured posts:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating featured posts:', error);
      return false;
    }
  },

  // Add a post to featured posts
  async addFeaturedPost(postId: string): Promise<{ success: boolean; posts: string[] }> {
    const currentPosts = await this.getFeaturedPosts();
    
    if (currentPosts.includes(postId)) {
      return { success: true, posts: currentPosts };
    }

    if (currentPosts.length >= MAX_FEATURED_POSTS) {
      return { success: false, posts: currentPosts };
    }

    const newPosts = [...currentPosts, postId];
    const success = await this.setFeaturedPosts(newPosts);
    
    return { success, posts: success ? newPosts : currentPosts };
  },

  // Remove a post from featured posts
  async removeFeaturedPost(postId: string): Promise<{ success: boolean; posts: string[] }> {
    const currentPosts = await this.getFeaturedPosts();
    const newPosts = currentPosts.filter(id => id !== postId);
    
    const success = await this.setFeaturedPosts(newPosts);
    
    return { success, posts: success ? newPosts : currentPosts };
  }
};
