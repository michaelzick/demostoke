import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../integrations/supabase/types";
import { blogPosts } from "./index.ts";
import type { BlogPost } from "./types";

const PUBLIC_POST_COLUMNS = "id, slug, title, excerpt, content, category, author, author_id, published_at, read_time, hero_image, thumbnail, video_embed, tags";
type CommaSeparatedFields<Fields extends string> = Fields extends `${infer First}, ${infer Rest}`
  ? First | CommaSeparatedFields<Rest>
  : Fields;
type PublicPostRow = Pick<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  CommaSeparatedFields<typeof PUBLIC_POST_COLUMNS>
>;

export function formatPublishedBlogPost(row: PublicPostRow): BlogPost {
  return {
    id: row.slug || row.id,
    databaseId: row.id,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || "",
    author: row.author || "",
    authorId: row.author_id || "",
    publishedAt: row.published_at,
    readTime: row.read_time,
    heroImage: row.hero_image || "",
    thumbnail: row.thumbnail || "",
    videoEmbed: row.video_embed || undefined,
    tags: row.tags || [],
  };
}

export async function getPublishedBlogPost(
  supabase: SupabaseClient<Database> | null,
  slug: string,
  signal: AbortSignal,
): Promise<BlogPost | null> {
  const staticPost = blogPosts.find((post) => post.id === slug) ?? null;
  if (!supabase) {
    if (staticPost) return staticPost;
    throw new Error("Published article lookup unavailable");
  }

  const findPost = (field: "id" | "slug") => supabase
    .from("blog_posts")
    .select(PUBLIC_POST_COLUMNS)
    .eq("status", "published")
    .eq(field, slug)
    .abortSignal(signal)
    .maybeSingle();

  let result = await findPost("slug");
  if (!result.error && !result.data && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(slug)) {
    result = await findPost("id");
  }

  if (result.error && !staticPost) throw new Error("Published article lookup failed");
  return result.data ? formatPublishedBlogPost(result.data) : staticPost;
}
