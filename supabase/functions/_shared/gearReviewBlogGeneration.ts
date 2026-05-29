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

export const GEAR_REVIEW_DRAFT_PROMPT_VERSION = "gear-review-blog-draft-v4";

export const CATEGORY_TAGS: Record<EligibleGearCategory, string> = {
  skis: "skis",
  snowboards: "snowboards",
  surfboards: "surfboards",
  "mountain-bikes": "mountain bikes",
};

const CATEGORY_REVIEW_LABELS: Record<EligibleGearCategory, string> = {
  skis: "ski",
  snowboards: "snowboard",
  surfboards: "surfboard",
  "mountain-bikes": "mountain bike",
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
  /\brenter(?:s)?\b/i,
  /\blisting(?:s)?\b/i,
  /\blisted\s+(?:as|at|by|for|on)\b/i,
  /\bdemo\s+(?:price|prices|rate|rates|fee|fees|rental|rentals|program|fleet)\b/i,
  /\bshop(?:s)?\b/i,
  /\bretailer(?:s)?\b/i,
  /\bowner(?:s)?\b/i,
  /\bavailable\s+(?:at|from|through)\b/i,
  /\bavailable\s+to\s+(?:rent|demo|book)\b/i,
  /\bbook(?:ing)?\s+(?:this|the)\b/i,
  /\bpick\s*(?:up|it\s+up)\b/i,
  /\brental\s+(?:page|copy|rack|fleet|listing|option|program)\b/i,
];

const STOP_TAGS = new Set(["the", "and", "with", "for", "mens", "women", "womens"]);

const LOCATION_COMPONENT_STOPWORDS = new Set([
  "address",
  "avenue",
  "blvd",
  "boulevard",
  "center",
  "centre",
  "circle",
  "city",
  "court",
  "drive",
  "highway",
  "lane",
  "north",
  "place",
  "plaza",
  "road",
  "route",
  "south",
  "state",
  "states",
  "street",
  "suite",
  "trail",
  "united",
  "west",
]);

export const TARGET_GENERATED_REVIEW_BODY_WORDS = 1200;
export const MIN_GENERATED_REVIEW_BODY_WORDS = 1000;
export const MAX_GENERATED_REVIEW_BODY_WORDS = 1400;

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

const slugifyGearPathToken = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const hasSizeInName = (name: string, size: string): boolean => {
  const normalizedName = normalizeToken(name);
  const normalizedSize = normalizeToken(size);
  return normalizedSize.length > 0 && normalizedName.includes(normalizedSize);
};

const buildGearDisplayName = (name: string, size?: string | null): string => {
  const trimmedName = name.trim();
  const trimmedSize = size?.trim();

  if (!trimmedSize || hasSizeInName(trimmedName, trimmedSize)) {
    return trimmedName;
  }

  return `${trimmedName} ${trimmedSize}`;
};

export const buildGearDetailPath = (gear: Pick<GearReviewCandidate, "id" | "name" | "size">): string => {
  const displayName = buildGearDisplayName(gear.name, gear.size);
  return `/gear/${slugifyGearPathToken(displayName)}--${gear.id}`;
};

export const buildGearDetailUrl = (
  gear: Pick<GearReviewCandidate, "id" | "name" | "size">,
  baseUrl = "https://www.demostoke.com",
): string => `${baseUrl}${buildGearDetailPath(gear)}`;

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

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getListingLocationTerms = (gear: GearReviewCandidate): string[] => {
  const locationAddress = gear.location_address?.trim();
  if (!locationAddress) {
    return [];
  }

  const terms = new Set<string>();
  for (const rawComponent of locationAddress.split(/[,;\n]+/)) {
    const component = rawComponent.replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim();
    const normalizedComponent = normalizeTextForMatch(component);
    const tokens = normalizedComponent.split(" ").filter(Boolean);
    const meaningfulTokens = tokens.filter((token) => !LOCATION_COMPONENT_STOPWORDS.has(token));

    if (
      normalizedComponent.length >= 5 &&
      meaningfulTokens.length > 0 &&
      !LOCATION_COMPONENT_STOPWORDS.has(normalizedComponent)
    ) {
      terms.add(component);
    }

    const singleToken = tokens.length === 1 ? meaningfulTokens[0] : null;
    if (singleToken && singleToken.length >= 5) {
      terms.add(singleToken);
    }
  }

  return Array.from(terms);
};

const publicCopyMentionsListingLocation = (
  draft: GeneratedReviewDraft,
  gear: GearReviewCandidate | null | undefined,
): boolean => {
  if (!gear) {
    return false;
  }

  const publicText = [draft.title, draft.excerpt, draft.content, draft.tags.join(" ")].join(" ");
  return getListingLocationTerms(gear).some((term) =>
    new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(publicText),
  );
};

const FINAL_CALL_HEADING_PATTERN = /<h[23][^>]*>\s*Final Call\s*<\/h[23]>/i;

const getFinalCallHtml = (content: string): string | null => {
  const headingMatch = content.match(FINAL_CALL_HEADING_PATTERN);
  if (!headingMatch || headingMatch.index === undefined) {
    return null;
  }

  const finalCallStart = headingMatch.index + headingMatch[0].length;
  const afterFinalCall = content.slice(finalCallStart);
  const nextHeadingIndex = afterFinalCall.search(/<h[23][^>]*>/i);
  return nextHeadingIndex === -1 ? afterFinalCall : afterFinalCall.slice(0, nextHeadingIndex);
};

const normalizeGearHref = (href: string): string =>
  href.trim().replace(/^https?:\/\/(?:www\.)?demostoke\.com/i, "");

const finalCallHasGearDetailLink = (
  draft: GeneratedReviewDraft,
  gear: GearReviewCandidate | null | undefined,
): boolean => {
  if (!gear) {
    return true;
  }

  const finalCallHtml = getFinalCallHtml(draft.content);
  if (!finalCallHtml) {
    return false;
  }

  const gearPath = buildGearDetailPath(gear);
  const hrefs = Array.from(finalCallHtml.matchAll(/href\s*=\s*["']([^"']+)["']/gi))
    .map((match) => normalizeGearHref(match[1]));

  return hrefs.some((href) => href === gearPath);
};

export const getPublicCopyViolation = (
  draft: GeneratedReviewDraft,
  gear?: GearReviewCandidate,
): string | null => {
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

  if (publicCopyMentionsListingLocation(draft, gear)) {
    return "public_copy_mentions_listing_location";
  }

  if (!finalCallHasGearDetailLink(draft, gear)) {
    return "public_copy_missing_final_call_gear_detail_link";
  }

  const contentWords = countContentWords(draft.content);
  if (contentWords < MIN_GENERATED_REVIEW_BODY_WORDS) {
    return "content_under_1000_words";
  }

  if (contentWords > MAX_GENERATED_REVIEW_BODY_WORDS) {
    return "content_over_1400_words";
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

export const buildGeneratedReviewSystemPrompt = (): string =>
  [
    "You write evergreen product-review blog drafts for action-sports riders.",
    "The voice is natural, no-nonsense, knowledgeable, specific, and useful, like an expert buying guide.",
    "Write about the gear model itself, not a marketplace listing, rental page, shop page, local demo, travel guide, or availability page.",
    "Return valid JSON only, with no markdown code fence.",
    "Required JSON fields: title, excerpt, content, tags, claimCheckSummary.",
    "The content field must be HTML only. Use h2, h3, p, ul, and li. Do not use h1.",
    `The content field should be around ${TARGET_GENERATED_REVIEW_BODY_WORDS} visible words after HTML tags are removed. Stay between ${MIN_GENERATED_REVIEW_BODY_WORDS} and ${MAX_GENERATED_REVIEW_BODY_WORDS} visible words.`,
    "Use a standalone review structure: overview, who it is for, design and construction, ride or use profile, ideal conditions, setup guidance, strengths, tradeoffs, care or tuning tips, and Final Call.",
    "For snowboards, cover profile options, camber or rocker, flex, ideal conditions, boots, bindings, size guidance, and tuning where relevant.",
    "For surfboards, cover outline, rocker, rails, tail, fin setup, paddling, wave range, sizing, skill fit, strengths, tradeoffs, and Final Call. Do not mention specific beaches or surf towns.",
    "For skis, cover rocker and camber profile, flex, construction, turn shape, terrain fit, boot or binding pairing if useful, sizing, tuning, strengths, tradeoffs, and Final Call.",
    "For mountain bikes, cover frame platform, suspension, geometry, drivetrain, brakes, wheels or tires if known, climbing, descending, sizing, setup, maintenance, strengths, tradeoffs, and Final Call.",
    "If exact tech details vary by model year or trim, say they vary instead of inventing a single exact spec.",
    "Do not use listing metadata as article material. Ignore owner, shop, pickup, booking, availability, address, city, state, region, daily rates, weekly rates, rental details, and demo-program details.",
    "Do not claim first-hand testing, personal ownership, direct demo time, or measured performance unless those facts are supplied.",
    "Do not mention evidence, verification, guardrails, QA, source audits, internal process, or claim checks in public copy.",
    "Do not mention availability, booking details, listing locations, shops, rental prices, dollar amounts, or rate structures in public copy.",
    "Do not use em dashes anywhere in public copy.",
  ].join("\n");

export const buildGeneratedReviewUserPrompt = (gear: GearReviewCandidate): string => {
  const category = isEligibleGearCategory(gear.category)
    ? CATEGORY_REVIEW_LABELS[gear.category]
    : "action-sports gear";

  return [
    `Write a comprehensive evergreen product review of the ${gear.name} ${category}.`,
    "Make it read like a standalone model review, not a shop listing, rental page, local guide, or marketplace availability page.",
    "Focus on design, ride feel, ideal user, setup guidance, strengths, tradeoffs, care or tuning, and Final Call.",
    `The final section must be exactly <h2>Final Call</h2> and must include one natural HTML link to the reviewed gear detail page: <a href="${buildGearDetailUrl(gear)}">${gear.name} gear detail page</a>.`,
  ].join("\n");
};

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

const getVisibleContentText = (content: string): string =>
  content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const countContentCharacters = (content: string): number =>
  getVisibleContentText(content).length;

export const countContentWords = (content: string): number =>
  getVisibleContentText(content).split(/\s+/).filter(Boolean).length;

export const calculateReadTime = (content: string): number =>
  Math.max(1, Math.ceil(countContentWords(content) / 200));
