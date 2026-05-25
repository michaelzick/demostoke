import { describe, expect, it } from "vitest";

import {
  buildUniqueSlug,
  chooseRandomCategory,
  getAlreadyReviewedReason,
  getPublicCopyViolation,
  hasEnoughGearDetail,
  isEligibleGearCategory,
  normalizeGeneratedTags,
  selectBlogImages,
  type GearReviewCandidate,
} from "../../supabase/functions/_shared/gearReviewBlogGeneration";
import type { ValidGoogleImageSearchResult } from "../../supabase/functions/_shared/googleImageFilters";

const gear = (overrides: Partial<GearReviewCandidate> = {}): GearReviewCandidate => ({
  id: "gear-1",
  name: "Firewire Seaside",
  category: "surfboards",
  description: "A versatile alternative surfboard that works in a wide range of smaller surf conditions.",
  subcategory: "Alternative/Fun",
  size: "5'7",
  review_count: 0,
  images: ["https://images.example.com/firewire-seaside.jpg"],
  ...overrides,
});

const image = (
  overrides: Partial<ValidGoogleImageSearchResult> = {},
): ValidGoogleImageSearchResult => ({
  url: "https://images.example.com/hero.jpg",
  thumbnail: "https://images.example.com/thumb.jpg",
  title: "Gear image",
  source: "example.com",
  width: 1600,
  height: 1000,
  ...overrides,
});

describe("gear review blog generation helpers", () => {
  it("limits automatic generation to the four gear categories", () => {
    expect(isEligibleGearCategory("skis")).toBe(true);
    expect(isEligibleGearCategory("snowboards")).toBe(true);
    expect(isEligibleGearCategory("surfboards")).toBe(true);
    expect(isEligibleGearCategory("mountain-bikes")).toBe(true);
    expect(isEligibleGearCategory("helmets")).toBe(false);
  });

  it("can choose a deterministic category for tests", () => {
    expect(chooseRandomCategory(() => 0)).toBe("skis");
    expect(chooseRandomCategory(() => 0.99)).toBe("mountain-bikes");
  });

  it("rejects gear without enough listing detail or images", () => {
    expect(hasEnoughGearDetail(gear())).toBe(true);
    expect(hasEnoughGearDetail(gear({ description: "Too short.", images: ["https://x.test/a.jpg"] }))).toBe(false);
    expect(hasEnoughGearDetail(gear({ images: [] }))).toBe(false);
    expect(hasEnoughGearDetail(gear({ category: "helmets" }))).toBe(false);
  });

  it("excludes already-reviewed gear from previous runs, user reviews, existing posts, and static reviews", () => {
    expect(
      getAlreadyReviewedReason(gear(), {
        successfulRunEquipmentIds: new Set(["gear-1"]),
      }).reason,
    ).toBe("prior_successful_generated_review");

    expect(
      getAlreadyReviewedReason(gear({ id: "gear-2", review_count: 1 }), {}).reason,
    ).toBe("existing_equipment_review");

    expect(
      getAlreadyReviewedReason(gear({ id: "gear-3", name: "Softech Mason Twin" }), {}).reason,
    ).toBe("known_static_review");

    expect(
      getAlreadyReviewedReason(gear({ id: "gear-4", name: "Lib Tech Orca" }), {
        existingPosts: [
          {
            title: "The Lib Tech Orca Snowboard: A Deep Dive",
            slug: "the-lib-tech-orca-snowboard-review",
            tags: ["gear reviews", "snowboards"],
          },
        ],
      }).reason,
    ).toBe("known_static_review");
  });

  it("creates unique slugs without changing the first available slug", () => {
    expect(buildUniqueSlug("firewire-seaside-review", new Set())).toBe("firewire-seaside-review");
    expect(
      buildUniqueSlug(
        "firewire-seaside-review",
        new Set(["firewire-seaside-review", "firewire-seaside-review-2"]),
      ),
    ).toBe("firewire-seaside-review-3");
  });

  it("normalizes SEO tags around review intent, category, brand/model, and use case", () => {
    const tags = normalizeGeneratedTags(
      gear({
        name: "Norco Sight C",
        category: "mountain-bikes",
        subcategory: "trail",
      }),
      ["bike review", "trail", "mountain bikes"],
    );

    expect(tags).toContain("gear reviews");
    expect(tags).toContain("mountain bikes");
    expect(tags).toContain("norco");
    expect(tags).toContain("norco sight c");
    expect(tags).toContain("trail");
    expect(tags.length).toBeLessThanOrEqual(8);
  });

  it("catches internal-process language and unsupported first-hand claims in public copy", () => {
    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: "<p>This was verified by our internal evidence process.</p>",
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_mentions_internal_process");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: "<p>We tested this board in shoulder-high surf.</p>",
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_claims_first_hand_testing");
  });

  it("selects a large hero image and a separate thumbnail candidate when available", () => {
    const selected = selectBlogImages([
      image({
        url: "https://images.example.com/portrait.jpg",
        thumbnail: "https://images.example.com/portrait-thumb.jpg",
        width: 1200,
        height: 1600,
      }),
      image({
        url: "https://images.example.com/landscape.jpg",
        thumbnail: "https://images.example.com/landscape-thumb.jpg",
        width: 1800,
        height: 1200,
      }),
    ]);

    expect(selected?.heroImage).toBe("https://images.example.com/landscape.jpg");
    expect(selected?.thumbnail).toBe("https://images.example.com/portrait-thumb.jpg");
  });
});
