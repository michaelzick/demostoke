import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/lib/blog";

export interface GenerateBlogPostParams {
  prompt: string;
  category: string;
  author: string;
  authorId: string;
  tags: string[];
  thumbnail: string;
  heroImage: string;
  youtubeUrl: string;
  useYoutubeThumbnail: boolean;
  useYoutubeHero: boolean;
  publishedAt: string;
}

export interface GenerateBlogPostResponse {
  success: boolean;
  post?: BlogPost;
  error?: string;
}

export const generateBlogPost = async (
  params: GenerateBlogPostParams,
): Promise<GenerateBlogPostResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-blog-post",
      { body: params },
    );

    if (error) {
      console.error("Supabase function error:", error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      return { success: true, post: data.post };
    } else {
      return { success: false, error: data?.error || "Unknown error occurred" };
    }
  } catch (err) {
    console.error("Error generating blog post:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error occurred" };
  }
};
