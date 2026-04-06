import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import {
  buildGearMetaDescription,
  buildGearProductSchema,
  buildGearSummaryText,
  buildLegacyGearNamePattern,
  parseLegacyGearRoute,
} from "../lib/seo/gearSeo.js";

const ROOT = path.resolve(__dirname, "../../");

describe("Gear SEO helpers", () => {
  it("parses public legacy gear routes and rejects non-gear routes", () => {
    expect(parseLegacyGearRoute("/surfboards/demo-shop/lost-rnf-96")).toEqual({
      category: "surfboards",
      ownerSlug: "demo-shop",
      slug: "lost-rnf-96",
    });
    expect(parseLegacyGearRoute("/demo-calendar/event/spring-demo")).toBeNull();
    expect(parseLegacyGearRoute("/blog/some-post/comments")).toBeNull();
  });

  it("builds the same legacy name pattern the client lookup expects", () => {
    expect(buildLegacyGearNamePattern("lost-rnf-96")).toBe("%lost%rnf%96%");
    expect(buildLegacyGearNamePattern("")).toBeNull();
  });

  it("builds a single Product payload with canonical URL and rental offers", () => {
    const summaryText = buildGearSummaryText({
      displayName: "Lost RNF 96 5'8",
      locationText: "Encinitas, CA",
      lastVerified: "2026-03-30",
    });
    const schema = buildGearProductSchema({
      canonicalUrl:
        "https://www.demostoke.com/gear/lost-rnf-96-5-8--123e4567-e89b-12d3-a456-426614174000",
      category: "surfboards",
      displayName: "Lost RNF 96 5'8",
      imageUrls: ["https://cdn.example.com/board.webp"],
      isAvailable: true,
      lastVerified: "2026-03-30",
      pricePerHour: 20,
      pricePerDay: 55,
      pricePerWeek: 250,
      rating: 4.8,
      reviewCount: 11,
      summaryText,
    });

    expect(schema["@type"]).toBe("Product");
    expect(schema.url).toBe(
      "https://www.demostoke.com/gear/lost-rnf-96-5-8--123e4567-e89b-12d3-a456-426614174000",
    );
    expect(schema.description).toBe(summaryText);
    expect(schema.offers).toMatchObject({
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "20",
      highPrice: "250",
      offerCount: "3",
    });
    expect(schema.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: 4.8,
      reviewCount: 11,
    });
  });

  it("builds a consistent meta description from the shared summary text", () => {
    const summaryText = buildGearSummaryText({
      displayName: "Burton Custom 156",
      locationText: "Mammoth Lakes, CA",
      lastVerified: "2026-03-30",
    });

    expect(
      buildGearMetaDescription({
        summaryText,
        rawDescription: "Directional twin all-mountain snowboard in excellent condition.",
      }),
    ).toContain(summaryText);
  });

  it("adds review objects only when public review data is provided", () => {
    const schema = buildGearProductSchema({
      canonicalUrl: "https://www.demostoke.com/gear/test-board--123e4567-e89b-12d3-a456-426614174000",
      category: "surfboards",
      displayName: "Test Board 5'8",
      imageUrls: ["https://cdn.example.com/board.webp"],
      isAvailable: true,
      lastVerified: "2026-03-30",
      pricePerDay: 55,
      rating: 4.8,
      reviewCount: 2,
      reviews: [
        {
          authorName: "Taylor Rider",
          createdAt: "2026-03-28",
          rating: 5,
          reviewText: "Fast paddler and easy to control in shoulder-high surf.",
        },
      ],
      summaryText: "Test Board 5'8 is available in Encinitas, CA. Last verified 2026-03-30.",
    });

    expect(schema.review).toEqual([
      expect.objectContaining({
        "@type": "Review",
        author: { "@type": "Person", name: "Taylor Rider" },
      }),
    ]);
  });
});

describe("Gear SEO server regression coverage", () => {
  const serverPath = path.join(ROOT, "server/index.js");
  const serverSource = fs.readFileSync(serverPath, "utf-8");
  const pagePath = path.join(ROOT, "src/pages/EquipmentDetailPage.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf-8");

  it("registers a server-side redirect route for legacy gear URLs", () => {
    expect(serverSource).toMatch(/app\.get\('\/:category\/:ownerSlug\/:slug'/);
    expect(serverSource).toMatch(/resolveLegacyGearCanonicalUrl/);
    expect(serverSource).toMatch(/res\.redirect\(301,\s*canonicalUrl\)/);
  });

  it("redirects stale /gear/ slugs to the exact canonical product URL", () => {
    expect(serverSource).toMatch(
      /canonicalPathname[\s\S]*appendOriginalSearch\(meta\.canonicalUrl\.replace\(PUBLIC_SITE_URL,\s*requestOrigin\),\s*req\.originalUrl\)/,
    );
  });

  it("uses the shared gear Product builder in both server SSR and client metadata", () => {
    expect(serverSource).toMatch(/buildGearProductSchema/);
    expect(pageSource).toMatch(/buildGearProductSchema/);
  });

  it("accepts the legacy Supabase anon env var as a metadata fallback", () => {
    expect(serverSource).toMatch(/VITE_SUPABASE_ANON_KEY/);
  });
});

describe("Gear SEO sitemap regression coverage", () => {
  const serverPath = path.join(ROOT, "server/index.js");
  const serverSource = fs.readFileSync(serverPath, "utf-8");
  const sitemapPath = path.join(ROOT, "public/sitemap.xml");

  it("does not ship a static sitemap file that can shadow the runtime endpoint", () => {
    expect(fs.existsSync(sitemapPath)).toBe(false);
  });

  it("builds dynamic gear URLs in the runtime sitemap", () => {
    expect(serverSource).toMatch(/app\.get\('\/sitemap\.xml'/);
    expect(serverSource).toMatch(/path:\s*`\/gear\/\$\{buildGearSlug/);
  });

  it("keeps private and API routes out of the sitemap source", () => {
    expect(serverSource).not.toMatch(/path:\s*'\/api\/gear\/search'/);
    expect(serverSource).not.toMatch(/path:\s*'\/profile'/);
    expect(serverSource).not.toMatch(/path:\s*'\/my-gear'/);
    expect(serverSource).not.toMatch(/path:\s*'\/admin'/);
  });
});
