import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { GEAR_CATEGORIES } from "@/lib/gearCategories";
import {
  DEMO_EVENT_CATEGORY_IMAGES,
  getDemoEventCategoryImage,
} from "@/lib/seo/publicMetadata";

const readRepoFile = (path: string) => readFileSync(resolve(__dirname, "../..", path), "utf8");

// Pexels CDN crops, or copies hosted in our own public storage bucket. Never
// hotlink hosts that block crawlers (such as picryl).
const ALLOWED_IMAGE_URL =
  /^https:\/\/(images\.pexels\.com\/photos\/\d+\/|qtlhqsqanbxgfbcjigrl\.supabase\.co\/storage\/v1\/object\/public\/gear-images\/demo-event-thumbnails\/)/;

describe("demo event category images", () => {
  it("has an https Pexels or self-hosted image for every gear category", () => {
    for (const { slug } of GEAR_CATEGORIES) {
      const image = getDemoEventCategoryImage(slug);
      expect(image, slug).toMatch(ALLOWED_IMAGE_URL);
    }
  });

  it("returns null for unknown categories", () => {
    expect(getDemoEventCategoryImage("kayaks")).toBeNull();
  });

  it("stays in sync with the edge function and migration copies", () => {
    const edgeFunction = readRepoFile("supabase/functions/discover-demo-events/index.ts");
    const migration = readRepoFile(
      "supabase/migrations/20261011150000_picryl_surf_demo_event_thumbnail.sql",
    );

    for (const [category, url] of Object.entries(DEMO_EVENT_CATEGORY_IMAGES) as [string, string][]) {
      const key = category.includes("-") ? `"${category}"` : category;
      const photoId = url.match(/images\.pexels\.com\/photos\/(\d+)\//)?.[1];
      const edgeFunctionEntry = photoId
        ? `${key}: pexelsSquareThumb(${photoId})`
        : `${key}:\n    "${url}"`;
      expect(edgeFunction, category).toContain(edgeFunctionEntry);
      expect(migration, category).toContain(url);
    }
  });
});
