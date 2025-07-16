import { supabase } from "@/integrations/supabase/client";

export interface BlogPostGenerationInput {
  prompt: string;
  category: string;
  authorName: string;
  authorId: string;
  tags: string[];
  thumbnailUrl?: string;
  heroImageUrl?: string;
  videoUrl?: string;
  useVideoThumbnail?: boolean;
  useVideoHero?: boolean;
  publishedAt: string; // ISO date string
}

export const generateBlogPost = async (
  input: BlogPostGenerationInput,
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('generate-blog-post', {
    body: input,
  });

  if (error) throw error;
  return data;
};
