import { supabase } from "@/integrations/supabase/client";

export interface GenerateBlogPostInput {
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
  input: GenerateBlogPostInput,
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-blog-post",
      { body: input },
    );
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error generating blog post:", err);
    throw err;
  }
};
