import { describe, expect, it } from "vitest";

import {
  buildGearImageSearchQuery,
  filterHighResolutionGearImageResults,
  isHighResolutionGearImageResult,
  type GoogleImageSearchResult,
} from "../../supabase/functions/_shared/googleImageFilters";

const result = (
  overrides: Partial<GoogleImageSearchResult> = {},
): GoogleImageSearchResult => ({
  url: "https://images.example.com/burton-custom.jpg",
  thumbnail: "https://images.example.com/thumbs/burton-custom.jpg",
  title: "Burton Custom snowboard product image",
  source: "burton.example.com",
  width: 1600,
  height: 1000,
  ...overrides,
});

describe("Google image search filters", () => {
  it("builds a product-focused query with media exclusions", () => {
    expect(buildGearImageSearchQuery("Burton Custom", "snowboards")).toBe(
      "Burton Custom snowboards product gear -youtube -video -thumbnail -logo -banner -poster -ad -avatar -icon",
    );
  });

  it("accepts landscape images that are at least 1200px wide", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: 1200, height: 800 })),
    ).toBe(true);
  });

  it("rejects landscape images less than 1200px wide", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: 1199, height: 800 })),
    ).toBe(false);
  });

  it("accepts portrait images that are at least 1200px tall", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: 800, height: 1200 })),
    ).toBe(true);
  });

  it("rejects portrait images less than 1200px tall", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: 800, height: 1199 })),
    ).toBe(false);
  });

  it("accepts square images with a side at least 1200px", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: 1200, height: 1200 })),
    ).toBe(true);
  });

  it("rejects results with missing dimensions", () => {
    expect(
      isHighResolutionGearImageResult(result({ width: undefined })),
    ).toBe(false);
    expect(
      isHighResolutionGearImageResult(result({ height: undefined })),
    ).toBe(false);
  });

  it("rejects YouTube thumbnails and other non-gear media metadata", () => {
    expect(
      isHighResolutionGearImageResult(
        result({
          url: "https://i.ytimg.com/vi/demo/maxresdefault.jpg",
          thumbnail: "https://i.ytimg.com/vi/demo/hqdefault.jpg",
          title: "Burton Custom video review thumbnail",
          source: "youtube.com",
        }),
      ),
    ).toBe(false);
    expect(
      isHighResolutionGearImageResult(
        result({ title: "Burton Custom logo icon" }),
      ),
    ).toBe(false);
    expect(
      isHighResolutionGearImageResult(
        result({ url: "https://cdn.example.com/banner/burton-custom.jpg" }),
      ),
    ).toBe(false);
  });

  it("filters, deduplicates, and limits valid image results", () => {
    const filtered = filterHighResolutionGearImageResults(
      [
        result({ url: "http://images.example.com/insecure.jpg" }),
        result({ width: 900, height: 600 }),
        result({ title: "Burton Custom video thumbnail" }),
        result({ url: "https://images.example.com/valid-1.jpg" }),
        result({ url: "https://images.example.com/valid-1.jpg" }),
        result({ url: "https://images.example.com/valid-2.jpg" }),
      ],
      2,
    );

    expect(filtered.map((image) => image.url)).toEqual([
      "https://images.example.com/valid-1.jpg",
      "https://images.example.com/valid-2.jpg",
    ]);
  });
});
