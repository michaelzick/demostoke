import type { ValidGoogleImageSearchResult } from "./googleImageFilters.ts";

export const ELIGIBLE_GEAR_CATEGORIES = [
  "skis",
  "snowboards",
  "surfboards",
  "mountain-bikes",
] as const;

export type EligibleGearCategory = (typeof ELIGIBLE_GEAR_CATEGORIES)[number];

export type GearReviewCandidate = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  size?: string | null;
  weight?: string | null;
  material?: string | null;
  suitable_skill_level?: string | null;
  subcategory?: string | null;
  price_per_day?: number | null;
  price_per_hour?: number | null;
  price_per_week?: number | null;
  location_address?: string | null;
  review_count?: number | null;
  images?: string[];
};

export type ExistingGearReviewPost = {
  title?: string | null;
  slug?: string | null;
  tags?: string[] | null;
};

export type AlreadyReviewedContext = {
  successfulRunEquipmentIds?: Set<string>;
  equipmentReviewIds?: Set<string>;
  existingPosts?: ExistingGearReviewPost[];
  knownStaticReviewedTerms?: string[];
};

export type AlreadyReviewedResult = {
  alreadyReviewed: boolean;
  reason?: string;
};

export type SourceSnippet = {
  title: string;
  link: string;
  snippet?: string;
  displayLink?: string;
};

export type GeneratedReviewDraft = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  claimCheckSummary?: string[];
};

export type SelectedBlogImages = {
  heroImage: string;
  thumbnail: string;
  evidence: {
    hero: Pick<ValidGoogleImageSearchResult, "url" | "thumbnail" | "title" | "source" | "width" | "height">;
    thumbnail: Pick<ValidGoogleImageSearchResult, "url" | "thumbnail" | "title" | "source" | "width" | "height">;
  };
};

export const CATEGORY_TAGS: Record<EligibleGearCategory, string> = {
  skis: "skis",
  snowboards: "snowboards",
  surfboards: "surfboards",
  "mountain-bikes": "mountain bikes",
};

export const KNOWN_STATIC_REVIEWED_GEAR_TERMS = [
  "firewire seaside",
  "firewire sci fi 2",
  "firewire sci-fi 2",
  "ibis oso",
  "lib tech orca",
  "libtech orca",
  "never summer proto type two",
  "pyzel gremlin",
  "softech mason twin",
  "tom wallisch pro",
  "line tom wallisch pro",
];

const GENERIC_NAME_TERMS = new Set([
  "bike",
  "bikes",
  "board",
  "boards",
  "demo",
  "gear",
  "mountain",
  "rental",
  "ski",
  "skis",
  "snowboard",
  "snowboards",
  "surfboard",
  "surfboards",
  "trail",
]);

const PUBLIC_COPY_BLOCKLIST = [
  /verified by/i,
  /guardrail/i,
  /qa process/i,
  /quality assurance/i,
  /source audit/i,
  /claim-?check/i,
  /internal evidence/i,
  /generation metadata/i,
  /hidden evidence/i,
];

const FIRST_HAND_CLAIM_PATTERNS = [
  /\b(i|we)\s+(tested|rode|ridden|demoed|paddled|carved|took)\b/i,
  /\bafter\s+(testing|riding|demoing|paddling|carving)\b/i,
];

const RENTAL_PRICE_PATTERNS = [
  /\$\s*\d+(?:[,.]\d{2})?(?:\s*(?:\/|per|a)\s*(?:day|hour|week|night|month|hr|wk|mo))?/i,
  /\b\d+(?:[,.]\d{2})?\s*\/\s*(?:day|hour|week|night|month|hr|wk|mo)\b/i,
  /\b(?:per|a)\s+(?:day|hour|week|night|month|hr|wk|mo)\b/i,
];

const SHOP_OR_RENTAL_PUBLIC_COPY_PATTERNS = [
  /\brent(?:al|als|ed|ing)?\b/i,
  /\bdemo\s+(?:price|prices|rate|rates|fee|fees|rental|rentals|program|fleet)\b/i,
  /\bshop(?:s)?\b/i,
  /\bavailable\s+(?:at|from|through)\b/i,
  /\bbook(?:ing)?\s+(?:this|the)\b/i,
];

const STOP_TAGS = new Set(["the", "and", "with", "for", "mens", "women", "womens"]);

export const MIN_GENERATED_REVIEW_BODY_WORDS = 1500;

export const isEligibleGearCategory = (category: string): category is EligibleGearCategory =>
  (ELIGIBLE_GEAR_CATEGORIES as readonly string[]).includes(category);

export const normalizeTextForMatch = (value: string | null | undefined): string =>
  (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const slugifyReviewTitle = (value: string): string =>
  normalizeTextForMatch(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "");

export const buildUniqueSlug = (baseSlug: string, existingSlugs: Set<string>): string => {
  const cleanBase = baseSlug || "gear-review";
  if (!existingSlugs.has(cleanBase)) {
    return cleanBase;
  }

  let suffix = 2;
  while (existingSlugs.has(`${cleanBase}-${suffix}`)) {
    suffix += 1;
  }
  return `${cleanBase}-${suffix}`;
};

export const chooseRandomCategory = (
  random: () => number = Math.random,
): EligibleGearCategory => {
  const index = Math.floor(random() * ELIGIBLE_GEAR_CATEGORIES.length);
  return ELIGIBLE_GEAR_CATEGORIES[Math.min(index, ELIGIBLE_GEAR_CATEGORIES.length - 1)];
};

export const shuffleCategories = (
  firstCategory: EligibleGearCategory,
  random: () => number = Math.random,
): EligibleGearCategory[] => {
  const remaining = ELIGIBLE_GEAR_CATEGORIES.filter((category) => category !== firstCategory);
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [remaining[index], remaining[swapIndex]] = [remaining[swapIndex], remaining[index]];
  }
  return [firstCategory, ...remaining];
};

const significantTokens = (value: string): string[] =>
  normalizeTextForMatch(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !GENERIC_NAME_TERMS.has(token));

const postSearchText = (post: ExistingGearReviewPost): string =>
  normalizeTextForMatch(
    [post.title, post.slug, ...(Array.isArray(post.tags) ? post.tags : [])].filter(Boolean).join(" "),
  );

export const hasEnoughGearDetail = (gear: GearReviewCandidate): boolean => {
  if (!isEligibleGearCategory(gear.category) || !gear.name?.trim()) {
    return false;
  }

  const descriptionWords = normalizeTextForMatch(gear.description).split(" ").filter(Boolean);
  const images = gear.images ?? [];

  return descriptionWords.length >= 8 && images.length > 0;
};

export const getAlreadyReviewedReason = (
  gear: GearReviewCandidate,
  context: AlreadyReviewedContext,
): AlreadyReviewedResult => {
  if (context.successfulRunEquipmentIds?.has(gear.id)) {
    return { alreadyReviewed: true, reason: "prior_successful_generated_review" };
  }

  if (context.equipmentReviewIds?.has(gear.id) || (gear.review_count ?? 0) > 0) {
    return { alreadyReviewed: true, reason: "existing_equipment_review" };
  }

  const normalizedName = normalizeTextForMatch(gear.name);
  const nameTokens = significantTokens(gear.name);

  for (const term of context.knownStaticReviewedTerms ?? KNOWN_STATIC_REVIEWED_GEAR_TERMS) {
    const normalizedTerm = normalizeTextForMatch(term);
    if (normalizedTerm && (normalizedName.includes(normalizedTerm) || normalizedTerm.includes(normalizedName))) {
      return { alreadyReviewed: true, reason: "known_static_review" };
    }
  }

  if (nameTokens.length < 2 && normalizedName.length < 10) {
    return { alreadyReviewed: false };
  }

  for (const post of context.existingPosts ?? []) {
    const searchText = postSearchText(post);
    if (!searchText) {
      continue;
    }

    if (normalizedName.length >= 10 && searchText.includes(normalizedName)) {
      return { alreadyReviewed: true, reason: "existing_blog_review" };
    }

    const matchedTokens = nameTokens.filter((token) => searchText.includes(token));
    if (nameTokens.length >= 3 && matchedTokens.length >= Math.min(3, nameTokens.length)) {
      return { alreadyReviewed: true, reason: "existing_blog_review" };
    }
  }

  return { alreadyReviewed: false };
};

export const isAlreadyReviewedGear = (
  gear: GearReviewCandidate,
  context: AlreadyReviewedContext,
): boolean => getAlreadyReviewedReason(gear, context).alreadyReviewed;

const categoryIntentTag = (gear: GearReviewCandidate): string | null => {
  const text = normalizeTextForMatch([gear.subcategory, gear.description].filter(Boolean).join(" "));
  const intents = [
    "all mountain",
    "freeride",
    "freestyle",
    "powder",
    "park",
    "longboard",
    "shortboard",
    "trail",
    "enduro",
    "cross country",
    "hardtail",
  ];

  return intents.find((intent) => text.includes(normalizeTextForMatch(intent))) ?? null;
};

const extractBrandTag = (gearName: string): string | null => {
  const firstToken = significantTokens(gearName)[0];
  if (!firstToken || STOP_TAGS.has(firstToken)) {
    return null;
  }
  return firstToken;
};

const normalizeTag = (tag: string): string =>
  normalizeTextForMatch(tag)
    .replace(/\bmtb\b/g, "mountain bikes")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeGeneratedTags = (
  gear: GearReviewCandidate,
  generatedTags: string[] | null | undefined,
): string[] => {
  const tags = new Set<string>();
  tags.add("gear reviews");

  if (isEligibleGearCategory(gear.category)) {
    tags.add(CATEGORY_TAGS[gear.category]);
  }

  const brand = extractBrandTag(gear.name);
  if (brand) {
    tags.add(brand);
  }

  const modelTag = normalizeTag(gear.name);
  if (modelTag && modelTag.length <= 40) {
    tags.add(modelTag);
  }

  const intentTag = categoryIntentTag(gear);
  if (intentTag) {
    tags.add(intentTag);
  }

  for (const tag of generatedTags ?? []) {
    const normalized = normalizeTag(tag);
    if (normalized && normalized.length <= 32) {
      tags.add(normalized);
    }
    if (tags.size >= 8) {
      break;
    }
  }

  return Array.from(tags).slice(0, 8);
};

export const getPublicCopyViolation = (draft: GeneratedReviewDraft): string | null => {
  const publicText = [draft.title, draft.excerpt, draft.content, draft.tags.join(" ")].join(" ");

  for (const pattern of PUBLIC_COPY_BLOCKLIST) {
    if (pattern.test(publicText)) {
      return "public_copy_mentions_internal_process";
    }
  }

  for (const pattern of FIRST_HAND_CLAIM_PATTERNS) {
    if (pattern.test(publicText)) {
      return "public_copy_claims_first_hand_testing";
    }
  }

  if (/[—]|&mdash;/i.test(publicText)) {
    return "public_copy_contains_em_dash";
  }

  for (const pattern of RENTAL_PRICE_PATTERNS) {
    if (pattern.test(publicText)) {
      return "public_copy_mentions_rental_price";
    }
  }

  for (const pattern of SHOP_OR_RENTAL_PUBLIC_COPY_PATTERNS) {
    if (pattern.test(publicText)) {
      return "public_copy_mentions_shop_or_rental_info";
    }
  }

  if (countContentWords(draft.content) < MIN_GENERATED_REVIEW_BODY_WORDS) {
    return "content_under_1500_words";
  }

  return null;
};

export const selectBlogImages = (
  images: ValidGoogleImageSearchResult[],
): SelectedBlogImages | null => {
  const hero = images.find((image) => image.width >= image.height) ?? images[0];
  if (!hero) {
    return null;
  }

  const thumbnail = images.find((image) => image.url !== hero.url) ?? hero;

  return {
    heroImage: hero.url,
    thumbnail: thumbnail.url,
    evidence: {
      hero,
      thumbnail,
    },
  };
};

const formatGearFacts = (gear: GearReviewCandidate): string =>
  [
    `Name: ${gear.name}`,
    `Category: ${isEligibleGearCategory(gear.category) ? CATEGORY_TAGS[gear.category] : gear.category}`,
    gear.subcategory ? `Subcategory: ${gear.subcategory}` : null,
    gear.description ? `Listing description: ${gear.description}` : null,
    gear.size ? `Listed sizes: ${gear.size}` : null,
    gear.weight ? `Weight: ${gear.weight}` : null,
    gear.material ? `Material: ${gear.material}` : null,
    gear.suitable_skill_level ? `Suitable skill level: ${gear.suitable_skill_level}` : null,
  ]
    .filter(Boolean)
    .join("\n");

const formatSources = (sources: SourceSnippet[]): string =>
  sources.length > 0
    ? sources
        .slice(0, 5)
        .map((source, index) =>
          `${index + 1}. ${source.title}\nURL: ${source.link}\nSnippet: ${source.snippet ?? ""}`,
        )
        .join("\n\n")
    : "No external source snippets were available. Use only the listing facts above.";

export const buildGeneratedReviewSystemPrompt = (): string =>
  [
    "You write DemoStoke gear review drafts for action-sports riders.",
    "The voice is natural, loose, fun, and knowledgeable: a strong outdoor writer with some surfer-bro energy.",
    "Keep it smart, specific, and useful. Avoid cringe, fake stoke, corporate polish, and dumbed-down explanations.",
    "Use only model-level gear facts from the supplied listing and source snippets.",
    "Write like a general gear publication reviewing the product, not like a marketplace, rental listing, or shop profile.",
    "Do not include shop-specific analysis, shop names, store names, rental availability, rental terms, booking details, or rental/demo pricing anywhere in public copy.",
    "Do not mention prices, dollar amounts, per-day rates, per-hour rates, per-week rates, rental rates, or demo rates anywhere in public copy.",
    "Use source snippets only for model specifications, design intent, and general third-party review context. Ignore shop-specific source details.",
    "Do not claim first-hand testing, personal ownership, direct demo time, or measured performance unless those facts are supplied.",
    "Do not mention evidence, verification, guardrails, QA, source audits, internal process, or claim checks in public copy.",
    "Do not use em dashes anywhere in public copy.",
    "Write at least 1500 words in the HTML content body.",
    "Return valid JSON only, with no markdown code fence.",
  ].join("\n");

export const buildGeneratedReviewUserPrompt = (
  gear: GearReviewCandidate,
  sources: SourceSnippet[],
): string =>
  [
    "Create one gear-review blog draft for this DemoStoke listing.",
    "",
    "Required JSON shape:",
    "{",
    '  "title": "Specific gear model first, clear review intent, 50-80 characters",',
    '  "excerpt": "Concise answer-oriented summary, 120-170 characters",',
    '  "content": "HTML only. Use h2, h3, p, ul, li. No h1.",',
    '  "tags": ["gear reviews", "category", "brand/model", "intent"],',
    '  "claimCheckSummary": ["Internal note about what facts were used"]',
    "}",
    "",
    "Content structure:",
    "- Quick take",
    "- Who it is for",
    "- Ride/use profile",
    "- Strengths",
    "- Tradeoffs",
    "- Final call",
    "",
    "Required editorial rules:",
    "- The excerpt is the subtitle. Keep it focused on general gear-review value, not marketplace availability.",
    "- Do not include shop-specific analysis, shop names, store names, rental availability, rental terms, booking details, rental/demo pricing, dollar amounts, per-day rates, per-hour rates, or per-week rates anywhere in title, excerpt, content, or tags.",
    "- Talk about the gear in a general way that is not tied to a specific shop, location, rental program, or DemoStoke listing.",
    "- Pretend you are reviewing the gear for a general outdoor/action-sports publication.",
    "- Do not use em dashes anywhere. Use commas, colons, parentheses, or short sentences instead.",
    "- The content field must be at least 1500 words after HTML tags are removed.",
    "",
    "Gear facts:",
    formatGearFacts(gear),
    "",
    "Source snippets for factual grounding:",
    formatSources(sources),
  ].join("\n");

export const normalizeGeneratedDraft = (
  gear: GearReviewCandidate,
  draft: GeneratedReviewDraft,
): GeneratedReviewDraft => {
  const replaceEmDashes = (value: string): string =>
    value.replace(/&mdash;/gi, " - ").replace(/—/g, " - ").replace(/\s+/g, " ").trim();

  return {
    title: replaceEmDashes(draft.title),
    excerpt: replaceEmDashes(draft.excerpt),
    content: replaceEmDashes(draft.content),
    tags: normalizeGeneratedTags(gear, draft.tags.map((tag) => replaceEmDashes(tag))),
    claimCheckSummary: Array.isArray(draft.claimCheckSummary)
      ? draft.claimCheckSummary
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => replaceEmDashes(item))
          .slice(0, 10)
      : [],
  };
};

export const countContentWords = (content: string): number =>
  content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

export const calculateReadTime = (content: string): number =>
  Math.max(1, Math.ceil(countContentWords(content) / 200));
