
import { supabase } from "@/integrations/supabase/client";

export interface GenerateBlogTextParams {
  prompt: string;
  category: string;
}

export interface GenerateBlogTextResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const generateBlogText = async (
  params: GenerateBlogTextParams,
): Promise<GenerateBlogTextResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-blog-text",
      { body: params },
    );

    if (error) {
      console.error("Supabase function error:", error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      return { success: true, content: data.content };
    } else {
      return { success: false, error: data?.error || "Unknown error occurred" };
    }
  } catch (err) {
    console.error("Error generating blog text:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error occurred" };
  }
};
