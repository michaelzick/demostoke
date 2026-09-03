import { describe, expect, it } from "vitest";

import {
  buildGearDetailPath,
  buildGearDetailUrl,
  buildGeneratedReviewSystemPrompt,
  buildGeneratedReviewUserPrompt,
  buildUniqueSlug,
  chooseRandomCategory,
  ensureFinalCallGearDetailLink,
  GEAR_REVIEW_DRAFT_PROMPT_VERSION,
  getAlreadyReviewedReason,
  getPublicCopyViolation,
  hasEnoughGearDetail,
  isEligibleGearCategory,
  MAX_GENERATED_REVIEW_BODY_WORDS,
  MIN_GENERATED_REVIEW_BODY_WORDS,
  normalizeGeneratedDraft,
  normalizeGeneratedTags,
  selectBlogImages,
  SURF_CATEGORY_WEIGHT,
  TARGET_GENERATED_REVIEW_BODY_WORDS,
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

const wordContent = (
  wordCount = TARGET_GENERATED_REVIEW_BODY_WORDS,
  detailGear: GearReviewCandidate | null = null,
): string => {
  const words = Array.from({ length: wordCount }, (_, index) => `word${index}`).join(" ");
  const finalCall = detailGear
    ? `<h2>Final Call</h2><p>Read the <a href="${buildGearDetailPath(detailGear)}">${detailGear.name} gear detail page</a>.</p>`
    : "";

  return `<p>${words}</p>${finalCall}`;
};

describe("gear review blog generation helpers", () => {
  it("limits automatic generation to the four gear categories", () => {
    expect(isEligibleGearCategory("skis")).toBe(true);
    expect(isEligibleGearCategory("snowboards")).toBe(true);
    expect(isEligibleGearCategory("surfboards")).toBe(true);
    expect(isEligibleGearCategory("mountain-bikes")).toBe(true);
    expect(isEligibleGearCategory("helmets")).toBe(false);
  });

  it("chooses surfboards whenever the first draw lands under the surf weight", () => {
    expect(chooseRandomCategory(() => 0)).toBe("surfboards");
    expect(chooseRandomCategory(() => SURF_CATEGORY_WEIGHT - 0.01)).toBe("surfboards");
  });

  it("splits the remaining weight evenly across the other categories", () => {
    const sequence = (...values: number[]) => {
      let index = 0;
      return () => values[Math.min(index++, values.length - 1)];
    };
    expect(chooseRandomCategory(sequence(0.6, 0))).toBe("snowboards");
    expect(chooseRandomCategory(sequence(0.6, 0.5))).toBe("skis");
    expect(chooseRandomCategory(sequence(0.6, 0.99))).toBe("mountain-bikes");
  });

  it("lands on surfboards about half the time with a seeded generator", () => {
    let seed = 42;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const draws = 2000;
    let surfCount = 0;
    for (let i = 0; i < draws; i += 1) {
      if (chooseRandomCategory(random) === "surfboards") surfCount += 1;
    }
    const share = surfCount / draws;
    expect(share).toBeGreaterThan(0.44);
    expect(share).toBeLessThan(0.56);
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

  it("normalizes SEO tags to post category, gear category, and brand", () => {
    const tags = normalizeGeneratedTags(
      gear({
        name: "Stockli Stormrider 95",
        category: "skis",
        subcategory: "all mountain",
      }),
      ["ski review", "all mountain", "stockli stormrider 95"],
    );

    expect(tags).toEqual(["gear reviews", "skis", "stockli"]);
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
        content: wordContent(),
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_mentions_rental_price");

    expect(
      getPublicCopyViolation({
        title: "Burton Custom Review",
        excerpt: "A useful quick take.",
        content: `${wordContent()}<p>Available from a rental shop with weekly booking options.</p>`,
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_mentions_shop_or_rental_info");

    expect(
      getPublicCopyViolation({
        title: "Surf Prescriptions Pro Fish Review: Performance shortboard for Waikiki",
        excerpt: "A useful quick take.",
        content: wordContent(),
        tags: ["gear reviews"],
      }, gear({ location_address: "Waikiki, Honolulu, HI" })),
    ).toBe("public_copy_mentions_listing_location");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A white-knuckle ride feel without local place copy.",
        content: wordContent(TARGET_GENERATED_REVIEW_BODY_WORDS, gear({ location_address: "Big White, BC" })),
        tags: ["gear reviews"],
      }, gear({ location_address: "Big White, BC" })),
    ).toBeNull();

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take — with shape notes.",
        content: wordContent(),
        tags: ["gear reviews"],
      }),
    ).toBe("public_copy_contains_em_dash");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: wordContent(MIN_GENERATED_REVIEW_BODY_WORDS - 1),
        tags: ["gear reviews"],
      }),
    ).toBe("content_under_1000_words");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: wordContent(MAX_GENERATED_REVIEW_BODY_WORDS + 1),
        tags: ["gear reviews"],
      }),
    ).toBe("content_over_1400_words");

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: wordContent(),
        tags: ["gear reviews"],
      }),
    ).toBeNull();
  });

  it("requires the Final Call section to link to the reviewed gear detail page", () => {
    const reviewedGear = gear({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Lost RNF 96",
      size: "5'8",
    });

    expect(buildGearDetailPath(reviewedGear)).toBe(
      "/gear/lost-rnf-96-5-8--123e4567-e89b-12d3-a456-426614174000",
    );

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: `${wordContent()}<h2>Final Call</h2><p>A useful closing note without the link.</p>`,
        tags: ["gear reviews"],
      }, reviewedGear),
    ).toBe("public_copy_missing_final_call_gear_detail_link");

    const normalizedFinalThoughts = normalizeGeneratedDraft(reviewedGear, {
      title: "A clean review",
      excerpt: "A useful quick take.",
      content: `${wordContent()}<h2>Final Thoughts</h2><p>A useful closing note without the link.</p>`,
      tags: ["gear reviews"],
    });

    expect(normalizedFinalThoughts.content).toContain("<h2>Final Call</h2>");
    expect(normalizedFinalThoughts.content).toContain(
      `<a href="${buildGearDetailPath(reviewedGear)}">${reviewedGear.name} gear detail page</a>`,
    );
    expect(getPublicCopyViolation(normalizedFinalThoughts, reviewedGear)).toBeNull();

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: wordContent(TARGET_GENERATED_REVIEW_BODY_WORDS, reviewedGear),
        tags: ["gear reviews"],
      }, reviewedGear),
    ).toBeNull();

    expect(
      getPublicCopyViolation({
        title: "A clean review",
        excerpt: "A useful quick take.",
        content: `<p>${Array.from({ length: TARGET_GENERATED_REVIEW_BODY_WORDS }, (_, index) => `word${index}`).join(" ")}</p><h2>Final Call</h2><p>Read the <a href="${buildGearDetailUrl(reviewedGear)}">${reviewedGear.name} gear detail page</a>.</p>`,
        tags: ["gear reviews"],
      }, reviewedGear),
    ).toBeNull();
  });

  it("adds a Final Call gear detail link when the generated content omits one", () => {
    const reviewedGear = gear({
      id: "gear-2",
      name: "Burton Custom",
      category: "snowboards",
      size: "158",
    });
    const content = ensureFinalCallGearDetailLink(
      reviewedGear,
      "<h2>Overview</h2><p>Specific board review copy.</p><h2>Verdict</h2><p>A useful closing note.</p>",
    );

    expect(content).toContain("<h2>Final Call</h2>");
    expect(content).toContain('<a href="/gear/burton-custom-158--gear-2">Burton Custom gear detail page</a>');
    expect(content).not.toContain("<h2>Verdict</h2>");
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
    expect(prompt).toContain(`<h2>Final Call</h2>`);
    expect(prompt).toContain(buildGearDetailPath(gear()));
    expect(prompt).not.toContain("$95");
    expect(prompt).not.toContain("$30");
    expect(prompt).not.toContain("$420");
    expect(prompt).not.toContain("123 Rental Shop Way");
  });

  it("uses product-review structure and prompt version v5", () => {
    const systemPrompt = buildGeneratedReviewSystemPrompt();

    expect(systemPrompt).toContain("evergreen product-review");
    expect(systemPrompt).toContain("not a marketplace listing");
    expect(systemPrompt).toContain("Who it's for");
    expect(systemPrompt).toContain("not formal labels like <h2>Who it is for</h2>");
    expect(systemPrompt).toContain("Example: gear reviews, skis, stockli");
    expect(systemPrompt).toContain("camber or rocker");
    expect(systemPrompt).toContain("outline, rocker, rails, tail, fin setup");
    expect(systemPrompt).toContain("Do not mention availability, booking details, listing locations");
    expect(systemPrompt).toContain("around 1200 visible words");
    expect(systemPrompt).toContain("between 1000 and 1400 visible words");
    expect(GEAR_REVIEW_DRAFT_PROMPT_VERSION).toBe("gear-review-blog-draft-v6");
  });

  it("normalizes formal section wording into natural language", () => {
    const normalized = normalizeGeneratedDraft(gear(), {
      title: "Firewire Seaside Review",
      excerpt: "A useful quick take.",
      content: "<h2>Who it is for</h2><p>This section explains who it is for.</p>",
      tags: ["gear reviews"],
      claimCheckSummary: [],
    });

    expect(normalized.content).toContain("<h2>Who it's for</h2>");
    expect(normalized.content).toContain("who it's for");
    expect(normalized.content).not.toContain("Who it is for");
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
