import { describe, expect, it } from "vitest";

import {
  buildGeneratedReviewSystemPrompt,
  buildGeneratedReviewUserPrompt,
  buildUniqueSlug,
  chooseRandomCategory,
  GEAR_REVIEW_DRAFT_PROMPT_VERSION,
  getAlreadyReviewedReason,
  getPublicCopyViolation,
  hasEnoughGearDetail,
  isEligibleGearCategory,
  MIN_GENERATED_REVIEW_BODY_CHARACTERS,
  normalizeGeneratedDraft,
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

const longContent = (characterCount = MIN_GENERATED_REVIEW_BODY_CHARACTERS): string =>
  `<p>${"a".repeat(characterCount)}</p>`;

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

  it("catches cron draft editorial rule violations in public copy", () => {
    expect(
      getPublicCopyViolation({
        title: "Burton Custom Review: $150/day Demo Notes",
        excerpt: "A useful quick take.",
        content: longContent(),
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_mentions_rental_price");

    expect(
      getPublicCopyViolation({
        title: "Burton Custom Review",
        excerpt: "A useful quick take.",
        content: `${longContent()}<p>Available from a rental shop with weekly booking options.</p>`,
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_mentions_shop_or_rental_info");

    expect(
      getPublicCopyViolation({
        title: "Surf Prescriptions Pro Fish Review: Performance shortboard for Waikiki",
        excerpt: "A useful quick take.",
        content: longContent(),
        tags: ["gear reviews"],
      }, gear({ location_address: "Waikiki, Honolulu, HI" })),
    ).toBe("public_copy_mentions_listing_location");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A white-knuckle ride feel without local place copy.",
        content: longContent(),
        tags: ["gear reviews"],
      }, gear({ location_address: "Big White, BC" })),
    ).toBeNull();

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take — with shape notes.",
        content: longContent(),
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_contains_em_dash");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: "<p>Too short.</p>",
        tags: ["gear reviews"],
      }),
    ).toBe("content_under_2000_characters");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: longContent(),
        tags: ["gear reviews"],
      }),
    ).toBeNull();
  });

  it("frames generated review prompts as evergreen model reviews instead of listings", () => {
    const prompt = buildGeneratedReviewUserPrompt(
      gear({
        price_per_day: 95,
        price_per_hour: 30,
        price_per_week: 420,
        location_address: "123 Rental Shop Way",
      }),
    );

    expect(prompt).toContain("comprehensive evergreen product review of the Firewire Seaside surfboard");
    expect(prompt).toContain("standalone model review");
    expect(prompt).not.toContain("$95");
    expect(prompt).not.toContain("$30");
    expect(prompt).not.toContain("$420");
    expect(prompt).not.toContain("123 Rental Shop Way");
  });

  it("uses product-review structure and prompt version v3", () => {
    const systemPrompt = buildGeneratedReviewSystemPrompt();

    expect(systemPrompt).toContain("evergreen product-review");
    expect(systemPrompt).toContain("not a marketplace listing");
    expect(systemPrompt).toContain("camber or rocker");
    expect(systemPrompt).toContain("outline, rocker, rails, tail, fin setup");
    expect(systemPrompt).toContain("Do not mention availability, booking details, listing locations");
    expect(systemPrompt).toContain("at least 2000 visible characters");
    expect(GEAR_REVIEW_DRAFT_PROMPT_VERSION).toBe("gear-review-blog-draft-v3");
  });

  it("normalizes em dashes out of generated public copy and claim notes", () => {
    const normalized = normalizeGeneratedDraft(gear(), {
      title: "Firewire Seaside — Review",
      excerpt: "Fast — loose — useful.",
      content: "<p>Trim speed — paddle comfort.</p>",
      tags: ["gear reviews", "surfboards — alternative"],
      claimCheckSummary: ["Used listing — and source snippets."],
    });

    expect([normalized.title, normalized.excerpt, normalized.content, ...normalized.tags].join(" ")).not.toContain("—");
    expect(normalized.claimCheckSummary?.join(" ")).not.toContain("—");
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
    expect(selected?.thumbnail).toBe("https://images.example.com/portrait.jpg");
  });
});
