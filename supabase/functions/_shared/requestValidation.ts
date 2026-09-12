import { z } from "https://esm.sh/zod@3.25.76";
import { HttpError } from "./http.ts";

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, "Invalid request fields");
  return result.data;
}

const text = (max: number) => z.string().trim().min(1).max(max);
const webUrl = z.string().max(2048).url().refine((value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username &&
      !url.password;
  } catch {
    return false;
  }
});
export const discoveryRequest = z.object({
  region: text(100).default("los-angeles"),
  categories: z.array(
    z.enum(["surfboard", "snowboard", "ski", "mountain bike", "mtb"]),
  )
    .min(1).max(5).default(["surfboard", "snowboard", "ski", "mountain bike"]),
  maxShops: z.number().int().min(1).max(20).default(5),
});
export const crawlRequest = z.object({
  urls: z.array(webUrl).min(1).max(20),
  keywords: z.array(text(100)).min(1).max(10).default([
    "surfboard",
    "snowboard",
    "ski",
    "mountain bike",
  ]),
  limit: z.number().int().min(5).max(80).default(30),
});
export const extractionRequest = z.object({ html: text(200_000) });
export const blogTextRequest = z.object({
  prompt: text(10_000),
  category: text(100),
});
export const blogPostRequest = blogTextRequest.extend({
  author: text(100),
  tags: z.array(text(100)).max(30).default([]),
  thumbnail: webUrl.or(z.literal("")).default(""),
  heroImage: webUrl.or(z.literal("")).default(""),
  youtubeUrl: webUrl.or(z.literal("")).default(""),
  useYoutubeThumbnail: z.boolean().default(false),
  useYoutubeHero: z.boolean().default(false),
  publishedAt: z.string().datetime({ offset: true }),
});
export const contactRequest = z.object({
  firstName: text(100).refine((value) => !/[\r\n]/.test(value)),
  lastName: text(100).refine((value) => !/[\r\n]/.test(value)),
  email: text(254).email(),
  subject: text(200).refine((value) => !/[\r\n]/.test(value)),
  message: text(10_000),
  captchaToken: text(4096),
});
