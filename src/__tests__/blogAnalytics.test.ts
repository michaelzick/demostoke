import { describe, expect, it } from "vitest";

import { buildGeneratedReviewAnalyticsProperties } from "@/utils/blogAnalytics";
import type { BlogPost } from "@/lib/blog/types";

describe("generated gear review analytics", () => {
  it("builds safe generated-review properties without hidden evidence or prompts", () => {
    const post: BlogPost = {
      id: "norco-sight-c-review",
      databaseId: "post-1",
      title: "Norco Sight C Review",
      excerpt: "A quick take on the Norco Sight C.",
      content: "<p>Fun trail bike.</p>",
      category: "gear reviews",
      author: "Chad G.",
      authorId: "chad-g",
      publishedAt: "2026-05-25T17:00:00Z",
      readTime: 4,
      heroImage: "https://images.example.com/hero.jpg",
      thumbnail: "https://images.example.com/thumb.jpg",
      tags: ["gear reviews", "mountain bikes", "norco"],
      isGeneratedGearReview: true,
      sourceEquipmentId: "gear-1",
      sourceGearCategory: "mountain-bikes",
    };

    const properties = buildGeneratedReviewAnalyticsProperties(post, "published");

    expect(properties).toEqual({
      post_id: "post-1",
      post_slug: "norco-sight-c-review",
      category: "gear reviews",
      equipment_id: "gear-1",
      gear_category: "mountain-bikes",
      author: "Chad G.",
      generated: true,
      post_mode: "published",
    });

    expect(Object.keys(properties)).not.toContain("hidden_evidence");
    expect(Object.keys(properties)).not.toContain("source_snippets");
    expect(Object.keys(properties)).not.toContain("prompt");
  });
});
