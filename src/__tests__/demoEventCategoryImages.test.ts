import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { GEAR_CATEGORIES } from "@/lib/gearCategories";
import {
  DEMO_EVENT_CATEGORY_IMAGES,
  getDemoEventCategoryImage,
} from "@/lib/seo/publicMetadata";

const readRepoFile = (path: string) => readFileSync(resolve(__dirname, "../..", path), "utf8");

describe("demo event category images", () => {
  it("has an https Pexels image for every gear category", () => {
    for (const { slug } of GEAR_CATEGORIES) {
      const image = getDemoEventCategoryImage(slug);
      expect(image, slug).toMatch(/^https:\/\/images\.pexels\.com\/photos\/\d+\//);
    }
  });

  it("returns null for unknown categories", () => {
    expect(getDemoEventCategoryImage("kayaks")).toBeNull();
  });

  it("stays in sync with the edge function and migration copies", () => {
    const edgeFunction = readRepoFile("supabase/functions/discover-demo-events/index.ts");
    const migration = readRepoFile(
      "supabase/migrations/20261011140000_refresh_demo_event_surf_mtb_thumbnails.sql",
    );

    for (const [category, url] of Object.entries(DEMO_EVENT_CATEGORY_IMAGES) as [string, string][]) {
      const photoId = url.match(/photos\/(\d+)\//)?.[1];
      const key = category.includes("-") ? `"${category}"` : category;
      expect(edgeFunction, category).toContain(`${key}: pexelsSquareThumb(${photoId})`);
      expect(migration, category).toContain(url);
    }
  });
});
