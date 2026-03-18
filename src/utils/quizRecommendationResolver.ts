import { fallbackSearch } from "@/services/equipment/aiSearchService";
import { Equipment } from "@/types";
import { QuizRecommendation } from "@/types/quiz";

const GENERIC_TITLE_TOKENS = new Set([
  "best",
  "gear",
  "ideal",
  "option",
  "options",
  "package",
  "perfect",
  "quiver",
  "recommendation",
  "recommendations",
  "setup",
]);

const SKILL_LEVEL_TOKENS = new Set([
  "advanced",
  "beginner",
  "beginners",
  "expert",
  "intermediate",
  "pro",
]);

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "into",
  "its",
  "that",
  "the",
  "their",
  "them",
  "these",
  "this",
  "with",
  "your",
]);

const MIN_FALLBACK_RELEVANCE_SCORE = 8;
const MAX_MATCHES_PER_RECOMMENDATION = 2;
const DEFAULT_MAX_MATCHES = 8;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(" ")
    .filter(Boolean);

const humanizeCategory = (category?: string): string =>
  category ? category.replace(/-/g, " ") : "";

const getMeaningfulTokens = (value: string, limit: number): string[] => {
  const uniqueTokens: string[] = [];

  for (const token of tokenize(value)) {
    if (token.length <= 2 || STOP_WORDS.has(token)) {
      continue;
    }

    if (!uniqueTokens.includes(token)) {
      uniqueTokens.push(token);
    }

    if (uniqueTokens.length >= limit) {
      break;
    }
  }

  return uniqueTokens;
};

const isSpecificRecommendationTitle = (
  title: string,
  category?: string,
): boolean => {
  const categoryTokens = new Set(tokenize(humanizeCategory(category)));
  const meaningfulTokens = tokenize(title).filter(
    (token) =>
      !GENERIC_TITLE_TOKENS.has(token) &&
      !SKILL_LEVEL_TOKENS.has(token) &&
      !categoryTokens.has(token),
  );

  return meaningfulTokens.length >= 2;
};

const buildRecommendationQueries = (
  recommendation: QuizRecommendation,
  category?: string,
  skillLevel?: string,
): string[] => {
  const queries: string[] = [];
  const categoryLabel = humanizeCategory(category);
  const featureTokens = recommendation.keyFeatures.flatMap((feature) =>
    getMeaningfulTokens(feature, 2),
  );
  const descriptionTokens = getMeaningfulTokens(recommendation.description, 4);

  const addQuery = (...parts: Array<string | undefined>) => {
    const query = parts
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (query && !queries.includes(query)) {
      queries.push(query);
    }
  };

  addQuery(recommendation.title);
  addQuery(recommendation.title, categoryLabel);

  if (isSpecificRecommendationTitle(recommendation.title, category)) {
    addQuery(recommendation.title, ...featureTokens.slice(0, 2));
  } else {
    addQuery(skillLevel, categoryLabel, ...featureTokens.slice(0, 3));
    addQuery(categoryLabel, ...descriptionTokens.slice(0, 4));
  }

  return queries.slice(0, 4);
};

interface ResolveQuizRecommendationsOptions {
  inventory: Equipment[];
  matchedIds?: string[];
  recommendations?: QuizRecommendation[];
  category?: string;
  skillLevel?: string;
  maxMatches?: number;
}

export const resolveQuizRecommendationsToEquipment = ({
  inventory,
  matchedIds = [],
  recommendations = [],
  category,
  skillLevel,
  maxMatches = DEFAULT_MAX_MATCHES,
}: ResolveQuizRecommendationsOptions): Equipment[] => {
  if (inventory.length === 0) {
    return [];
  }

  const categoryInventory = category
    ? inventory.filter((item) => item.category === category)
    : inventory;

  const inventoryById = new Map(inventory.map((item) => [item.id, item]));
  const resolvedMatches = new Map<string, Equipment>();

  const addMatch = (equipment?: Equipment) => {
    if (!equipment) {
      return;
    }

    if (resolvedMatches.size >= maxMatches) {
      return;
    }

    resolvedMatches.set(equipment.id, equipment);
  };

  for (const matchedId of matchedIds) {
    addMatch(inventoryById.get(matchedId));
  }

  for (const recommendation of recommendations) {
    if (resolvedMatches.size >= maxMatches) {
      break;
    }

    const normalizedTitle = normalizeText(recommendation.title);
    if (
      normalizedTitle &&
      isSpecificRecommendationTitle(recommendation.title, category)
    ) {
      for (const equipment of categoryInventory) {
        const normalizedName = normalizeText(equipment.name);
        if (
          normalizedName === normalizedTitle ||
          normalizedName.includes(normalizedTitle) ||
          normalizedTitle.includes(normalizedName)
        ) {
          addMatch(equipment);
        }
      }
    }

    if (resolvedMatches.size >= maxMatches) {
      break;
    }

    const queries = buildRecommendationQueries(
      recommendation,
      category,
      skillLevel,
    );

    for (const query of queries) {
      const searchResults = fallbackSearch(query, categoryInventory)
        .filter(
          (item) =>
            (item.fallback_relevance_score ?? 0) >=
            MIN_FALLBACK_RELEVANCE_SCORE,
        )
        .slice(0, MAX_MATCHES_PER_RECOMMENDATION);

      for (const match of searchResults) {
        addMatch(match);
      }

      if (searchResults.length > 0 || resolvedMatches.size >= maxMatches) {
        break;
      }
    }
  }

  return Array.from(resolvedMatches.values()).slice(0, maxMatches);
};
