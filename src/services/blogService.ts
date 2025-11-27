
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/lib/blog/types";
import { blogPosts as staticBlogPosts } from "@/lib/blog";
import { slugify } from "@/utils/slugify";

export const blogService = {
  // Get all published blog posts (database + static)
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      // Get database posts (published only)
      const { data: dbPosts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
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
  },

  // Save or update a draft
  async saveDraft(postData: Partial<BlogPost> & { id?: string; userId: string; createdFromPostId?: string }): Promise<{ success: boolean; post?: BlogPost; error?: string }> {
    try {
      const now = new Date().toISOString();
      
      if (postData.id) {
        // Update existing draft
        const { data, error } = await supabase
          .from('blog_posts')
          .update({
            title: postData.title,
            slug: postData.id,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            author: postData.author,
            author_id: postData.authorId,
            hero_image: postData.heroImage,
            thumbnail: postData.thumbnail,
            video_embed: postData.videoEmbed,
            tags: postData.tags,
            last_auto_saved_at: now,
            updated_at: now
          })
          .eq('id', postData.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating draft:', error);
          return { success: false, error: error.message };
        }

        return { success: true, post: this.formatDbPost(data) };
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{
            title: postData.title || 'Untitled Draft',
            slug: postData.id,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            author: postData.author,
            author_id: postData.authorId,
            hero_image: postData.heroImage,
            thumbnail: postData.thumbnail,
            video_embed: postData.videoEmbed,
            tags: postData.tags,
            status: 'draft',
            user_id: postData.userId,
            created_from_post_id: postData.createdFromPostId || null,
            last_auto_saved_at: now,
            published_at: now,
            read_time: 5
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating draft:', error);
          return { success: false, error: error.message };
        }

        return { success: true, post: this.formatDbPost(data) };
      }
    } catch (error) {
      console.error('Error in saveDraft:', error);
      return { success: false, error: 'Failed to save draft' };
    }
  },

  // Get user's drafts
  async getDrafts(userId: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['draft', 'scheduled', 'archived'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching drafts:', error);
        return [];
      }

      return (data || []).map(post => this.formatDbPost(post));
    } catch (error) {
      console.error('Error in getDrafts:', error);
      return [];
    }
  },

  // Get single draft by ID
  async getDraftById(postId: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching draft:', error);
        return null;
      }

      return data ? this.formatDbPost(data) : null;
    } catch (error) {
      console.error('Error in getDraftById:', error);
      return null;
    }
  },

  // Publish a draft
  async publishDraft(postId: string, readTime?: number, title?: string): Promise<{ success: boolean; error?: string }> {
    try {
      let slug: string | undefined;
      
      // Generate slug from title if provided
      if (title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const updateData: any = {
        status: 'published',
        published_at: new Date().toISOString(),
        read_time: readTime || 5
      };

      if (slug) {
        updateData.slug = slug;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        console.error('Error publishing draft:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in publishDraft:', error);
      return { success: false, error: 'Failed to publish draft' };
    }
  },

  // Schedule a draft for future publishing
  async scheduleDraft(postId: string, scheduledFor: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledFor
        })
        .eq('id', postId);

      if (error) {
        console.error('Error scheduling draft:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in scheduleDraft:', error);
      return { success: false, error: 'Failed to schedule draft' };
    }
  },

  // Archive a post
  async archivePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: 'archived' })
        .eq('id', postId);

      if (error) {
        console.error('Error archiving post:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in archivePost:', error);
      return { success: false, error: 'Failed to archive post' };
    }
  },

  // Unpublish a post (revert to draft)
  async unpublishPost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: 'draft' })
        .eq('id', postId);

      if (error) {
        console.error('Error unpublishing post:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in unpublishPost:', error);
      return { success: false, error: 'Failed to unpublish post' };
    }
  },

  // Delete a draft permanently
  async deleteDraft(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting draft:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteDraft:', error);
      return { success: false, error: 'Failed to delete draft' };
    }
  },

  // Check if slug exists for other posts (excluding specific post IDs)
  async checkSlugExists(slug: string, excludeIds: string[] = []): Promise<boolean> {
    try {
      const filteredIds = excludeIds.filter(id => id); // Remove null/undefined
      
      let query = supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug);
      
      if (filteredIds.length > 0) {
        query = query.not('id', 'in', `(${filteredIds.join(',')})`);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error checking slug:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkSlugExists:', error);
      return false;
    }
  },

  // Update post slug
  async updatePostSlug(postId: string, newSlug: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ slug: newSlug })
        .eq('id', postId);

      if (error) {
        console.error('Error updating post slug:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updatePostSlug:', error);
      return { success: false, error: 'Failed to update slug' };
    }
  },

  // Get original post details
  async getOriginalPostDetails(createdFromPostId: string): Promise<{ title: string; slug: string; status: string } | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, slug, status')
        .eq('id', createdFromPostId)
        .single();

      if (error) {
        console.error('Error fetching original post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOriginalPostDetails:', error);
      return null;
    }
  },

  // Publish draft from existing post (handles slug updates and un-publishing)
  async publishDraftFromExistingPost(
    draftId: string,
    newPostSlug: string,
    originalPostId: string,
    originalPostSlug: string,
    unpublishOriginal: boolean,
    readTime: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update original post's slug
      const slugUpdateResult = await this.updatePostSlug(originalPostId, originalPostSlug);
      if (!slugUpdateResult.success) {
        return { success: false, error: `Failed to update original post slug: ${slugUpdateResult.error}` };
      }

      // Un-publish original post if requested
      if (unpublishOriginal) {
        const unpublishResult = await this.unpublishPost(originalPostId);
        if (!unpublishResult.success) {
          return { success: false, error: `Failed to un-publish original post: ${unpublishResult.error}` };
        }
      }

      // Publish the new draft with new slug
      const { error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          slug: newPostSlug,
          published_at: new Date().toISOString(),
          read_time: readTime
        })
        .eq('id', draftId);

      if (error) {
        console.error('Error publishing draft:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in publishDraftFromExistingPost:', error);
      return { success: false, error: 'Failed to publish draft from existing post' };
    }
  },

  // Get published post by slug (returns database ID)
  async getPublishedPostBySlug(slug: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        console.error('Error fetching post by slug:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in getPublishedPostBySlug:', error);
      return null;
    }
  },

  // Update published post (in-place editing)
  async updatePublishedPost(postId: string, postData: Partial<BlogPost>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        category: postData.category,
        author: postData.author,
        hero_image: postData.heroImage,
        thumbnail: postData.thumbnail,
        video_embed: postData.videoEmbed,
        tags: postData.tags,
        updated_at: new Date().toISOString()
      };

      // Update slug if title changed
      if (postData.title) {
        updateData.slug = slugify(postData.title);
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        console.error('Error updating published post:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updatePublishedPost:', error);
      return { success: false, error: 'Failed to update post' };
    }
  },

  // Helper to format DB post to BlogPost type
  formatDbPost(post: any): BlogPost {
    return {
      id: post.slug || post.id,
      title: post.title || 'Untitled',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || '',
      author: post.author || '',
      authorId: post.author_id || '',
      publishedAt: post.published_at,
      readTime: post.read_time || 5,
      heroImage: post.hero_image || '',
      thumbnail: post.thumbnail || '',
      videoEmbed: post.video_embed || undefined,
      tags: post.tags || [],
      status: post.status || 'published',
      userId: post.user_id,
      scheduledFor: post.scheduled_for,
      lastAutoSavedAt: post.last_auto_saved_at,
      createdFromPostId: post.created_from_post_id
    };
  }
};
