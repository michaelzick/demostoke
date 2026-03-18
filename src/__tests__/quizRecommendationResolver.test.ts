import { describe, expect, it } from "vitest";
import { Equipment } from "@/types";
import { QuizRecommendation } from "@/types/quiz";
import { resolveQuizRecommendationsToEquipment } from "@/utils/quizRecommendationResolver";

const buildEquipment = (overrides: Partial<Equipment>): Equipment => ({
  id: overrides.id ?? "gear-1",
  name: overrides.name ?? "Demo Gear",
  category: overrides.category ?? "snowboards",
  description: overrides.description ?? "Demo description",
  image_url: overrides.image_url ?? "",
  images: overrides.images ?? [],
  price_per_day: overrides.price_per_day ?? 45,
  rating: overrides.rating ?? 4.8,
  review_count: overrides.review_count ?? 12,
  owner: overrides.owner ?? {
    id: "owner-1",
    name: "Demo Shop",
    imageUrl: "",
    rating: 4.9,
    reviewCount: 28,
    responseRate: 98,
  },
  location: overrides.location ?? {
    lat: 34.0195,
    lng: -118.4912,
    address: "Santa Monica, CA",
  },
  distance: overrides.distance ?? 0,
  specifications: overrides.specifications ?? {
    size: "",
    weight: "",
    material: "",
    suitable: "intermediate",
  },
  availability: overrides.availability ?? {
    available: true,
  },
  pricing_options: overrides.pricing_options ?? [],
  ...overrides,
});

const buildRecommendation = (
  overrides: Partial<QuizRecommendation>,
): QuizRecommendation => ({
  category: overrides.category ?? "intermediate",
  title: overrides.title ?? "Demo Recommendation",
  description: overrides.description ?? "Demo recommendation description",
  keyFeatures: overrides.keyFeatures ?? ["Balanced ride"],
  suitableFor: overrides.suitableFor ?? "All-around riding",
});

describe("resolveQuizRecommendationsToEquipment", () => {
  it("keeps exact matchedIds when they exist in the public inventory", () => {
    const inventory = [
      buildEquipment({ id: "gear-1", name: "Burton Custom Camber" }),
      buildEquipment({ id: "gear-2", name: "Capita DOA" }),
    ];

    const resolved = resolveQuizRecommendationsToEquipment({
      inventory,
      matchedIds: ["gear-2"],
      recommendations: [buildRecommendation({ title: "Capita DOA" })],
      category: "snowboards",
      skillLevel: "intermediate",
    });

    expect(resolved.map((item) => item.id)).toEqual(["gear-2"]);
  });

  it("maps a specific AI recommendation title onto a matching inventory item", () => {
    const inventory = [
      buildEquipment({
        id: "orca",
        name: "Lib Tech Orca 153",
        description: "Directional all-mountain snowboard built for powder days.",
      }),
      buildEquipment({
        id: "navigator",
        name: "Jones Navigator",
        description: "Freeride snowboard for mixed conditions.",
      }),
    ];

    const resolved = resolveQuizRecommendationsToEquipment({
      inventory,
      recommendations: [buildRecommendation({ title: "Lib Tech Orca" })],
      category: "snowboards",
      skillLevel: "advanced",
    });

    expect(resolved.map((item) => item.id)).toContain("orca");
  });

  it("uses feature-based fallback search for generic quiz recommendations", () => {
    const inventory = [
      buildEquipment({
        id: "soft-top",
        name: "Wavestorm 8ft Soft Top",
        category: "surfboards",
        description:
          "Beginner friendly soft top surfboard with easy paddling and a stable outline for small waves.",
        specifications: {
          size: "8ft",
          weight: "",
          material: "Foam",
          suitable: "beginner",
        },
      }),
      buildEquipment({
        id: "performance-shortboard",
        name: "Sharp Eye Inferno 72",
        category: "surfboards",
        description:
          "High-performance shortboard tuned for fast, critical surfing.",
        specifications: {
          size: "5'10",
          weight: "",
          material: "PU",
          suitable: "advanced",
        },
      }),
    ];

    const resolved = resolveQuizRecommendationsToEquipment({
      inventory,
      recommendations: [
        buildRecommendation({
          category: "beginner",
          title: "Beginner surfboard recommendation",
          description:
            "Choose something forgiving that is easy to paddle, stable, and confidence-building in smaller surf.",
          keyFeatures: [
            "Soft top construction",
            "Easy paddling",
            "Stable outline",
          ],
          suitableFor: "First-time surfers",
        }),
      ],
      category: "surfboards",
      skillLevel: "beginner",
    });

    expect(resolved.map((item) => item.id)).toContain("soft-top");
    expect(resolved.map((item) => item.id)).not.toContain(
      "performance-shortboard",
    );
  });
});
