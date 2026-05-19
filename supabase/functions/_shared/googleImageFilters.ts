export type GoogleImageSearchResult = {
  url?: unknown;
  thumbnail?: unknown;
  title?: unknown;
  source?: unknown;
  width?: unknown;
  height?: unknown;
};

export type ValidGoogleImageSearchResult = {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  width: number;
  height: number;
};

const MINIMUM_PRIMARY_DIMENSION = 1200;

const BLOCKED_MAIN_METADATA_TERMS = [
  "youtube",
  "youtu.be",
  "ytimg",
  "video",
  "thumbnail",
  "thumb",
  "logo",
  "banner",
  "avatar",
  "icon",
  "poster",
  "sprite",
  "placeholder",
  "maxresdefault",
  "hqdefault",
  "mqdefault",
  "sddefault",
];

const BLOCKED_THUMBNAIL_TERMS = [
  "youtube",
  "youtu.be",
  "ytimg",
  "maxresdefault",
  "hqdefault",
  "mqdefault",
  "sddefault",
  "/vi/",
];

const isHttpsString = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("https://");

const toDimension = (value: unknown): number | null => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : null;
};

const containsBlockedTerm = (value: string, blockedTerms: string[]) => {
  const normalizedValue = value.toLowerCase();
  return blockedTerms.some((term) => normalizedValue.includes(term));
};

export const buildGearImageSearchQuery = (
  query: string,
  gearType?: string,
) => {
  const gearTerms = [query, gearType, "product", "gear"]
    .map((term) => term?.trim())
    .filter(Boolean)
    .join(" ");

  return `${gearTerms} -youtube -video -thumbnail -logo -banner -poster -ad -avatar -icon`;
};

export const isHighResolutionGearImageResult = (
  result: GoogleImageSearchResult,
): result is ValidGoogleImageSearchResult => {
  if (!isHttpsString(result.url) || !isHttpsString(result.thumbnail)) {
    return false;
  }

  const width = toDimension(result.width);
  const height = toDimension(result.height);

  if (!width || !height) {
    return false;
  }

  const isLandscape = width > height;
  const isPortrait = height > width;
  const meetsDimensionRequirement = isLandscape
    ? width >= MINIMUM_PRIMARY_DIMENSION
    : isPortrait
      ? height >= MINIMUM_PRIMARY_DIMENSION
      : Math.max(width, height) >= MINIMUM_PRIMARY_DIMENSION;

  if (!meetsDimensionRequirement) {
    return false;
  }

  const mainMetadata = [
    result.url,
    typeof result.title === "string" ? result.title : "",
    typeof result.source === "string" ? result.source : "",
  ].join(" ");

  if (containsBlockedTerm(mainMetadata, BLOCKED_MAIN_METADATA_TERMS)) {
    return false;
  }

  if (containsBlockedTerm(result.thumbnail, BLOCKED_THUMBNAIL_TERMS)) {
    return false;
  }

  return true;
};

export const filterHighResolutionGearImageResults = (
  results: GoogleImageSearchResult[] | undefined,
  limit = 10,
): ValidGoogleImageSearchResult[] => {
  const uniqueUrls = new Set<string>();
  const filteredResults: ValidGoogleImageSearchResult[] = [];

  for (const result of results ?? []) {
    if (!isHighResolutionGearImageResult(result) || uniqueUrls.has(result.url)) {
      continue;
    }

    uniqueUrls.add(result.url);
    filteredResults.push({
      url: result.url,
      thumbnail: result.thumbnail,
      title: typeof result.title === "string" ? result.title : "",
      source: typeof result.source === "string" ? result.source : "Unknown",
      width: toDimension(result.width) ?? 0,
      height: toDimension(result.height) ?? 0,
    });

    if (filteredResults.length >= limit) {
      break;
    }
  }

  return filteredResults;
};
