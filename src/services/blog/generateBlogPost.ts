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

export const generateBlogPost = async (
  params: GenerateBlogPostParams,
): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-blog-post",
      { body: params },
    );

    if (error) {
      console.error("Supabase function error:", error);
      return null;
    }

    return (data as any)?.post ?? null;
  } catch (err) {
    console.error("Error generating blog post:", err);
    return null;
  }
};
