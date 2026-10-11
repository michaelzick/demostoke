import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { timingSafeEqualString } from "../_shared/timingSafeEqual.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");

const MIN_SEARCH_URLS = 8;
const MAX_SEARCH_URLS_HARD_CAP = 24;
// Two queries per category per run (round-robin across the four categories).
const MAX_QUERY_ATTEMPTS = 8;
const MAX_PARSE_PAGES = 10;
// Sized for the Firecrawl free plan: 10 /scrape and 10 /search requests per
// minute, 2 concurrent browsers, 1,000 credits per month. One weekly run uses
// 8 searches (2 credits each) plus at most 10 scrapes (1 credit each).
const MAX_SCRAPE_PAGES = 10;
const SCRAPE_CONCURRENCY = 2;
const PARSE_CONCURRENCY = 2;
const SOFT_RUNTIME_LIMIT_MS = 100_000;
const SEARCH_RESULTS_PER_QUERY = 6;
const SEARCH_CONCURRENCY = 2;
const SEARCH_REQUEST_TIMEOUT_MS = 15_000;
const SCRAPE_REQUEST_TIMEOUT_MS = 15_000;
const OPENAI_REQUEST_TIMEOUT_MS = 12_000;
const MAPBOX_REQUEST_TIMEOUT_MS = 7_000;

const ALLOWED_GEAR_CATEGORIES = [
  "surfboards",
  "snowboards",
  "skis",
  "mountain-bikes",
] as const;

type GearCategory = (typeof ALLOWED_GEAR_CATEGORIES)[number];
type DiscoverySource = "manual" | "cron";

type DemoEventDiscoveryConfigRow = {
  id: boolean;
  enabled: boolean;
  cron_secret: string;
  search_scope: string;
  window_months: number;
  max_candidates_per_run: number;
  last_cron_attempt_at: string | null;
  auto_publish: boolean;
  publish_owner_user_id: string | null;
};

type SearchResult = {
  title: string;
  link: string;
  snippet?: string;
};

type ScrapedPage = {
  url: string;
  title?: string;
  snippet?: string;
  markdown: string;
  html?: string;
};

type ParsedEvent = {
  title?: string;
  company?: string;
  gear_category?: string;
  event_date?: string;
  event_time?: string | null;
  location?: string;
  equipment_available?: string | null;
};

type NormalizedEvent = {
  external_event_id: string;
  title: string;
  company: string;
  gear_category: GearCategory;
  event_date: string;
  event_time: string | null;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  equipment_available: string | null;
  source_primary_url: string;
  source_domain: string | null;
  source_urls: string[];
  source_snippet: string | null;
  thumbnail_url: string | null;
  raw_payload: Record<string, unknown>;
};

type DiscoveryStats = {
  new_candidates: number;
  updated_pending: number;
  skipped_approved: number;
  skipped_rejected: number;
  skipped_missing_required: number;
  skipped_out_of_window: number;
  total_processed: number;
  published: number;
  skipped_duplicate: number;
  unfeatured_expired: number;
  expired_candidates: number;
};

type DiscoverPayload = {
  source?: DiscoverySource;
  force?: boolean;
};

const BLOCKED_DOMAINS = [
  "yelp.com",
  "tripadvisor.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "youtube.com",
  "tiktok.com",
  "reddit.com",
  "wikipedia.org",
  "google.com",
  "bing.com",
  "yahoo.com",
];

// Surf-first: surfboards lead the search order. Queries are interleaved across
// categories in buildQueries so the small per-run query budget still reaches
// every category instead of spending itself on the first one.
const CATEGORY_SEARCH_TERMS: Record<GearCategory, string[]> = {
  surfboards: ["surfboard demo day", "surfboard test ride", "surf demo event"],
  snowboards: ["snowboard demo day", "snowboard test ride", "snowboard demo event"],
  skis: ["ski demo day", "ski test event", "ski demo tour"],
  "mountain-bikes": ["mountain bike demo day", "mtb demo ride", "bike park demo event"],
};

// Every demo event uses its category's image (Pexels License, or a public domain
// picryl photo hosted in our gear-images bucket for surfboards). Hand-copied
// from DEMO_EVENT_CATEGORY_IMAGES in src/lib/seo/publicMetadata.js; keep in sync.
const pexelsSquareThumb = (photoId: number) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop`;

const DEMO_EVENT_CATEGORY_IMAGES: Record<GearCategory, string> = {
  surfboards:
    "https://qtlhqsqanbxgfbcjigrl.supabase.co/storage/v1/object/public/gear-images/demo-event-thumbnails/surfboards-picryl-cc28fe.jpg",
  snowboards: pexelsSquareThumb(10808867),
  skis: pexelsSquareThumb(6783201),
  "mountain-bikes": pexelsSquareThumb(3880623),
};

const GEAR_CATEGORY_KEYWORDS: Record<GearCategory, string[]> = {
  surfboards: ["surf", "surfboard", "surfboards", "wave", "longboard", "shortboard"],
  snowboards: ["snowboard", "snowboards", "snowboarding"],
  skis: ["ski", "skis", "skiing", "alpine", "nordic", "powder"],
  "mountain-bikes": ["mountain bike", "mountain bikes", "mtb", "bike park", "trail bike", "enduro", "downhill"],
};

const isValidGearCategory = (value: string): value is GearCategory =>
  ALLOWED_GEAR_CATEGORIES.includes(value as GearCategory);

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeToken = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const extractDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

const isBlockedDomain = (url: string): boolean => {
  const domain = extractDomain(url);
  if (!domain) return true;
  return BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked));
};

const toIsoDate = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

const toIsoTime = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
  }

  const parsed = new Date(`1970-01-01T${trimmed}`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(11, 19);
  }

  return null;
};

const buildQueries = (searchScope: string): string[] => {
  const currentYear = new Date().getUTCFullYear();
  const nextYear = currentYear + 1;
  const scopeSuffix = searchScope === "us" ? "United States" : searchScope;

  // Build each category's query list, then interleave them round-robin so the
  // first N queries cover N categories (surfboards first) rather than N
  // variants of a single category's first term.
  const perCategory = (Object.entries(CATEGORY_SEARCH_TERMS) as [GearCategory, string[]][]).map(
    ([gearCategory, terms]) =>
      terms.flatMap((term) => [
        `${term} ${scopeSuffix} ${currentYear}`,
        `${term} ${scopeSuffix} ${nextYear}`,
        `${term} ${scopeSuffix} upcoming`,
        `${term} ${scopeSuffix} calendar`,
        `${term} hosted by brand shop ${gearCategory} ${scopeSuffix}`,
        `${term} inurl:events ${scopeSuffix}`,
      ]),
  );

  const queries: string[] = [];
  const longest = Math.max(...perCategory.map((list) => list.length));
  for (let position = 0; position < longest; position += 1) {
    for (const list of perCategory) {
      if (position < list.length) {
        queries.push(list[position]);
      }
    }
  }

  return queries;
};

const inferGearCategoryFromText = (value: string): GearCategory | null => {
  const text = normalizeToken(value);
  if (!text) return null;

  for (const [category, keywords] of Object.entries(GEAR_CATEGORY_KEYWORDS) as [GearCategory, string[]][]) {
    if (keywords.some((keyword) => text.includes(normalizeToken(keyword)))) {
      return category;
    }
  }

  return null;
};

const inferCompanyFromSource = (title: string, sourceDomain: string | null): string | null => {
  const normalizedTitle = normalizeWhitespace(title);
  if (normalizedTitle) {
    const titleParts = normalizedTitle
      .split(/\s[\-|–|—|:|•]\s| by /i)
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean);

    const candidatePart = titleParts.find((part) => {
      const normalized = normalizeToken(part);
      return !["demo", "event", "calendar", "upcoming"].every((term) => normalized.includes(term));
    });

    if (candidatePart && candidatePart.length >= 2) {
      return candidatePart.slice(0, 80);
    }
  }

  if (!sourceDomain) return null;
  const domainToken = sourceDomain.split(".")[0]?.replace(/[-_]+/g, " ").trim();
  if (!domainToken) return null;

  return domainToken
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getRequiredEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const fetchWithTimeout = async (
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const jsonArrayFromText = (input: string): unknown[] => {
  const trimmed = input.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      try {
        const parsed = JSON.parse(fenced[1]);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
};

const sha256Hex = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const withinWindow = (isoDate: string, windowMonths: number): boolean => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + windowMonths);

  const eventDate = new Date(`${isoDate}T00:00:00Z`);
  return eventDate >= start && eventDate <= end;
};

const pacificDateIso = (offsetDays = 0): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const date = new Date(`${parts}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });

  await Promise.all(runners);
  return results;
}

async function fetchDiscoveryConfig(serviceClient: any): Promise<DemoEventDiscoveryConfigRow> {
  const { data, error } = await serviceClient
    .from("demo_event_discovery_config")
    .select(
      "id, enabled, cron_secret, search_scope, window_months, max_candidates_per_run, last_cron_attempt_at, auto_publish, publish_owner_user_id",
    )
    .eq("id", true)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load discovery config: ${error?.message || "missing config"}`);
  }

  return data as DemoEventDiscoveryConfigRow;
}

async function verifyManualAdmin(
  req: Request,
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
): Promise<string> {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Manual runs require Authorization bearer token");
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: userData, error: userError } = await serviceClient.auth.getUser(
    authorization.slice("Bearer ".length)
  );
  if (userError || !userData?.user?.id) {
    throw new Error("Unable to verify user for manual run");
  }

  const { data: adminRole, error: adminError } = await serviceClient
    .from("user_roles")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (adminError || !adminRole) {
    throw new Error("Admin access required for manual run");
  }

  return userData.user.id;
}

async function verifyCronSecret(req: Request, config: DemoEventDiscoveryConfigRow): Promise<void> {
  const cronSecret = req.headers.get("x-cron-secret")?.trim();
  if (!cronSecret || !timingSafeEqualString(cronSecret, config.cron_secret ?? "")) {
    throw new Error("Invalid cron secret");
  }
}

async function firecrawlSearch(query: string, searchScope: string): Promise<SearchResult[]> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }

  try {
    const response = await fetchWithTimeout("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: SEARCH_RESULTS_PER_QUERY,
        ...(searchScope === "us" ? { location: "United States" } : {}),
        timeout: SEARCH_REQUEST_TIMEOUT_MS - 1_000,
        ignoreInvalidURLs: true,
      }),
    }, SEARCH_REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      const text = await response.text();
      console.error("Firecrawl search failed", { query, status: response.status, text });
      return [];
    }

    const data = await response.json();
    const items = Array.isArray(data?.data) ? data.data : [];
    return items
      .filter((item: any) => typeof item?.url === "string")
      .map((item: any) => ({
        title: typeof item.title === "string" ? item.title : "",
        link: item.url,
        snippet: typeof item.description === "string" ? item.description : undefined,
      }));
  } catch (error) {
    console.error("Firecrawl search exception", { query, error });
    return [];
  }
}

async function scrapePage(result: SearchResult): Promise<ScrapedPage | null> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }

  try {
    const response = await fetchWithTimeout("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: result.link,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 1000,
      }),
    }, SCRAPE_REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      const text = await response.text();
      console.error("Firecrawl scrape failed", { url: result.link, text });
      return null;
    }

    const data = await response.json();
    const markdown = data?.data?.markdown || data?.markdown || "";
    const html = data?.data?.html || data?.html || "";
    if (!markdown && !html) {
      return null;
    }

    return {
      url: result.link,
      title: result.title,
      snippet: result.snippet,
      markdown,
      html,
    };
  } catch (error) {
    console.error("Firecrawl scrape exception", { url: result.link, error });
    return null;
  }
}

async function parseEventsFromPage(page: ScrapedPage): Promise<ParsedEvent[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const content = (page.markdown || page.html || "").slice(0, 9000);
  if (!content) return [];

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Extract upcoming US demo events for surfboards, snowboards, skis, and mountain bikes from this page.\nReturn ONLY a JSON array.\nEach item must include:\n- title (string)\n- company (string)\n- gear_category (one of: surfboards, snowboards, skis, mountain-bikes)\n- event_date (YYYY-MM-DD)\n- event_time (HH:MM 24h or null)\n- location (string)\n- equipment_available (string or null)\nRules:\n- Include only real upcoming events with explicit dates.\n- Skip generic rentals with no event date.\n- Normalize gear_category exactly to allowed values.\n- If no qualifying events exist, return []\nCurrent date: ${today}.`;

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract structured event data. Return strict JSON arrays only with no explanation.",
        },
        {
          role: "user",
          content: `${prompt}\n\nSource URL: ${page.url}\n\nPage Content:\n${content}`,
        },
      ],
      max_completion_tokens: 1200,
    }),
  }, OPENAI_REQUEST_TIMEOUT_MS);

  if (!response.ok) {
    const text = await response.text();
    console.error("OpenAI parse failed", { url: page.url, text });
    return [];
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const parsed = jsonArrayFromText(raw);
  return parsed as ParsedEvent[];
}

async function geocodeLocation(
  location: string,
  cache: Map<string, { lat: number; lng: number } | null>,
): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;

  const key = normalizeWhitespace(location).toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=us`;
    const response = await fetchWithTimeout(url, {}, MAPBOX_REQUEST_TIMEOUT_MS);
    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = await response.json();
    const firstFeature = data?.features?.[0];
    if (!firstFeature?.center || !Array.isArray(firstFeature.center)) {
      cache.set(key, null);
      return null;
    }

    const [lng, lat] = firstFeature.center;
    const result = { lat: Number(lat), lng: Number(lng) };
    cache.set(key, result);
    return result;
  } catch (error) {
    console.error("Mapbox geocoding error", { location, error });
    cache.set(key, null);
    return null;
  }
}

async function normalizeParsedEvent(
  parsedEvent: ParsedEvent,
  page: ScrapedPage,
  windowMonths: number,
  geocodeCache: Map<string, { lat: number; lng: number } | null>,
): Promise<{ event: NormalizedEvent | null; missingRequired: boolean; outOfWindow: boolean }> {
  const title = normalizeWhitespace(parsedEvent.title || "");
  const sourceDomain = extractDomain(page.url);
  const company = normalizeWhitespace(parsedEvent.company || "") || inferCompanyFromSource(title, sourceDomain) || "";
  const parsedGearCategory = normalizeWhitespace(parsedEvent.gear_category || "").toLowerCase();
  const inferredGearCategory = inferGearCategoryFromText(
    `${title} ${company} ${parsedEvent.equipment_available || ""} ${page.title || ""} ${page.snippet || ""} ${page.url}`,
  );
  const gearCategory =
    (isValidGearCategory(parsedGearCategory) ? parsedGearCategory : inferredGearCategory) || "";
  const location = normalizeWhitespace(parsedEvent.location || "");
  const eventDateIso = toIsoDate(parsedEvent.event_date || null);

  if (!title || !company || !location || !eventDateIso || !isValidGearCategory(gearCategory)) {
    return { event: null, missingRequired: true, outOfWindow: false };
  }

  if (!withinWindow(eventDateIso, windowMonths)) {
    return { event: null, missingRequired: false, outOfWindow: true };
  }

  const eventTime = toIsoTime(parsedEvent.event_time || null);
  const equipmentAvailable = normalizeWhitespace(parsedEvent.equipment_available || "") || null;
  const normalizedKey = [
    gearCategory,
    normalizeToken(company),
    normalizeToken(title),
    eventDateIso,
    normalizeToken(location),
  ].join("|");

  const keyHash = await sha256Hex(normalizedKey);
  const externalEventId = `demo_evt_${keyHash}`;
  const geocoded = await geocodeLocation(location, geocodeCache);

  return {
    event: {
      external_event_id: externalEventId,
      title,
      company,
      gear_category: gearCategory,
      event_date: eventDateIso,
      event_time: eventTime,
      location,
      location_lat: geocoded?.lat ?? null,
      location_lng: geocoded?.lng ?? null,
      equipment_available: equipmentAvailable,
      source_primary_url: page.url,
      source_domain: sourceDomain,
      source_urls: [page.url],
      source_snippet: page.snippet || null,
      thumbnail_url: DEMO_EVENT_CATEGORY_IMAGES[gearCategory],
      raw_payload: {
        parsed_event: parsedEvent,
        source_title: page.title || null,
        normalized_key: normalizedKey,
      },
    },
    missingRequired: false,
    outOfWindow: false,
  };
}

function mergeSourceUrls(existing: unknown, incoming: string[]): string[] {
  const existingList = Array.isArray(existing)
    ? existing.filter((value): value is string => typeof value === "string")
    : [];

  return Array.from(new Set([...existingList, ...incoming]));
}

type PublishContext = {
  enabled: boolean;
  ownerUserId: string | null;
};

const titlesOverlap = (a: string, b: string): boolean => {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
};

// Hand-seeded or admin-created calendar rows carry different external ids, so
// also treat a same-day, same-category row from the same company (or with an
// overlapping title) as the same event.
async function findDuplicateCalendarEvent(
  serviceClient: any,
  candidate: NormalizedEvent,
): Promise<string | null> {
  const { data, error } = await serviceClient
    .from("demo_calendar")
    .select("id, title, company")
    .eq("gear_category", candidate.gear_category)
    .eq("event_date", candidate.event_date);

  if (error) {
    throw new Error(`Failed calendar duplicate lookup: ${error.message}`);
  }

  const companyToken = normalizeToken(candidate.company);
  const duplicate = (data || []).find(
    (row: { title: string; company: string }) =>
      (companyToken && normalizeToken(row.company || "") === companyToken) ||
      titlesOverlap(row.title || "", candidate.title),
  );

  return duplicate?.id ?? null;
}

async function markCandidateApproved(
  serviceClient: any,
  candidateId: string,
  demoEventId: string,
): Promise<void> {
  const nowIso = new Date().toISOString();
  // approved_by stays null: the weekly discovery run approved it, not an admin.
  const { error } = await serviceClient
    .from("demo_event_candidates")
    .update({
      status: "approved",
      approved_at: nowIso,
      approved_demo_event_id: demoEventId,
      updated_at: nowIso,
    })
    .eq("id", candidateId);

  if (error) {
    throw new Error(`Failed to mark candidate approved: ${error.message}`);
  }
}

async function publishCandidate(
  serviceClient: any,
  candidateId: string,
  candidate: NormalizedEvent,
  publish: PublishContext,
  stats: DiscoveryStats,
): Promise<void> {
  if (!publish.enabled || !publish.ownerUserId) return;

  const duplicateId = await findDuplicateCalendarEvent(serviceClient, candidate);
  if (duplicateId) {
    await markCandidateApproved(serviceClient, candidateId, duplicateId);
    stats.skipped_duplicate += 1;
    return;
  }

  const { data: inserted, error: insertError } = await serviceClient
    .from("demo_calendar")
    .insert({
      title: candidate.title,
      company: candidate.company,
      gear_category: candidate.gear_category,
      event_date: candidate.event_date,
      event_time: candidate.event_time,
      location: candidate.location,
      location_lat: candidate.location_lat,
      location_lng: candidate.location_lng,
      equipment_available: candidate.equipment_available,
      thumbnail_url: candidate.thumbnail_url,
      is_featured: false,
      created_by: publish.ownerUserId,
      external_event_id: candidate.external_event_id,
      source_primary_url: candidate.source_primary_url,
    })
    .select("id")
    .single();

  if (insertError) {
    // A concurrent run may have published the same external id first.
    if (insertError.code === "23505") {
      const { data: existing } = await serviceClient
        .from("demo_calendar")
        .select("id")
        .eq("external_event_id", candidate.external_event_id)
        .maybeSingle();
      if (existing?.id) {
        await markCandidateApproved(serviceClient, candidateId, existing.id);
        stats.skipped_duplicate += 1;
        return;
      }
    }
    throw new Error(`Failed to publish demo event: ${insertError.message}`);
  }

  await markCandidateApproved(serviceClient, candidateId, inserted.id);
  stats.published += 1;
}

// Housekeeping at the start of every run. The home page already hides expired
// events client-side; this keeps the stored flags and the review queue tidy.
async function cleanUpExpiredEvents(serviceClient: any, stats: DiscoveryStats): Promise<void> {
  const nowIso = new Date().toISOString();

  const { data: unfeatured, error: unfeatureError } = await serviceClient
    .from("demo_calendar")
    .update({ is_featured: false })
    .eq("is_featured", true)
    .lt("event_date", pacificDateIso(-1))
    .select("id");

  if (unfeatureError) {
    throw new Error(`Failed to unfeature expired events: ${unfeatureError.message}`);
  }
  stats.unfeatured_expired = unfeatured?.length ?? 0;

  const { data: expiredCandidates, error: expireError } = await serviceClient
    .from("demo_event_candidates")
    .update({
      status: "rejected",
      rejected_at: nowIso,
      rejection_reason: "expired",
      updated_at: nowIso,
    })
    .eq("status", "pending")
    .lt("event_date", pacificDateIso())
    .select("id");

  if (expireError) {
    throw new Error(`Failed to expire stale candidates: ${expireError.message}`);
  }
  stats.expired_candidates = expiredCandidates?.length ?? 0;
}

async function upsertCandidate(
  serviceClient: any,
  candidate: NormalizedEvent,
  publish: PublishContext,
  stats: DiscoveryStats,
): Promise<void> {
  const nowIso = new Date().toISOString();

  const { data: existingCandidate, error: existingCandidateError } = await serviceClient
    .from("demo_event_candidates")
    .select("id, status, seen_count, admin_edited, source_urls, thumbnail_url")
    .eq("external_event_id", candidate.external_event_id)
    .maybeSingle();

  if (existingCandidateError) {
    throw new Error(`Failed candidate dedupe lookup: ${existingCandidateError.message}`);
  }

  if (!existingCandidate) {
    const { data: existingPublished, error: existingPublishedError } = await serviceClient
      .from("demo_calendar")
      .select("id")
      .eq("external_event_id", candidate.external_event_id)
      .maybeSingle();

    if (existingPublishedError) {
      throw new Error(`Failed published dedupe lookup: ${existingPublishedError.message}`);
    }

    if (existingPublished) {
      stats.skipped_approved += 1;
      return;
    }

    const { data: insertedCandidate, error: insertError } = await serviceClient
      .from("demo_event_candidates")
      .insert({
        ...candidate,
        status: "pending",
        seen_count: 1,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to insert candidate: ${insertError.message}`);
    }

    stats.new_candidates += 1;
    await publishCandidate(serviceClient, insertedCandidate.id, candidate, publish, stats);
    return;
  }

  const baseUpdate = {
    seen_count: (existingCandidate.seen_count || 1) + 1,
    last_seen_at: nowIso,
    source_primary_url: candidate.source_primary_url,
    source_domain: candidate.source_domain,
    source_urls: mergeSourceUrls(existingCandidate.source_urls, candidate.source_urls),
    source_snippet: candidate.source_snippet,
    raw_payload: candidate.raw_payload,
    updated_at: nowIso,
  };

  if (existingCandidate.status === "pending") {
    const updatePayload = existingCandidate.admin_edited
      ? baseUpdate
      : {
          ...baseUpdate,
          title: candidate.title,
          company: candidate.company,
          gear_category: candidate.gear_category,
          event_date: candidate.event_date,
          event_time: candidate.event_time,
          location: candidate.location,
          location_lat: candidate.location_lat,
          location_lng: candidate.location_lng,
          equipment_available: candidate.equipment_available,
          thumbnail_url: existingCandidate.thumbnail_url || candidate.thumbnail_url,
        };

    const { error: updateError } = await serviceClient
      .from("demo_event_candidates")
      .update(updatePayload)
      .eq("id", existingCandidate.id);

    if (updateError) {
      throw new Error(`Failed to update pending candidate: ${updateError.message}`);
    }

    stats.updated_pending += 1;

    // Candidates an admin is actively editing stay in the queue for manual approval.
    if (!existingCandidate.admin_edited) {
      await publishCandidate(
        serviceClient,
        existingCandidate.id,
        {
          ...candidate,
          thumbnail_url: existingCandidate.thumbnail_url || candidate.thumbnail_url,
        },
        publish,
        stats,
      );
    }
    return;
  }

  const { error: metadataUpdateError } = await serviceClient
    .from("demo_event_candidates")
    .update(baseUpdate)
    .eq("id", existingCandidate.id);

  if (metadataUpdateError) {
    throw new Error(`Failed to update candidate metadata: ${metadataUpdateError.message}`);
  }

  if (existingCandidate.status === "approved") {
    stats.skipped_approved += 1;
  } else if (existingCandidate.status === "rejected") {
    stats.skipped_rejected += 1;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startedAt = Date.now();
    const runtimeExceeded = () => Date.now() - startedAt > SOFT_RUNTIME_LIMIT_MS;

    const supabaseUrl = getRequiredEnv("SUPABASE_URL", SUPABASE_URL);
    const supabaseServiceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const payload = (await req.json().catch(() => ({}))) as DiscoverPayload;
    const source: DiscoverySource = payload.source === "cron" ? "cron" : "manual";

    const config = await fetchDiscoveryConfig(serviceClient);

    if (source === "cron") {
      await verifyCronSecret(req, config);
    } else {
      await verifyManualAdmin(req, supabaseUrl, supabaseServiceRoleKey);
    }

    const stats: DiscoveryStats = {
      new_candidates: 0,
      updated_pending: 0,
      skipped_approved: 0,
      skipped_rejected: 0,
      skipped_missing_required: 0,
      skipped_out_of_window: 0,
      total_processed: 0,
      published: 0,
      skipped_duplicate: 0,
      unfeatured_expired: 0,
      expired_candidates: 0,
    };

    await cleanUpExpiredEvents(serviceClient, stats);

    const publish: PublishContext = {
      enabled: config.auto_publish !== false,
      ownerUserId: config.publish_owner_user_id,
    };
    if (publish.enabled && !publish.ownerUserId) {
      console.error("discover-demo-events: auto_publish is on but publish_owner_user_id is not set");
    }

    const maxCandidates = Math.max(1, Math.min(config.max_candidates_per_run || 50, 200));
    const queries = buildQueries(config.search_scope || "us");

    const searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();
    const maxSearchUrls = Math.max(
      MIN_SEARCH_URLS,
      Math.min(maxCandidates, MAX_SEARCH_URLS_HARD_CAP),
    );
    const queriesToRun = queries.slice(0, MAX_QUERY_ATTEMPTS);
    const queryAttempts = queriesToRun.length;
    const resultsByQuery = await runWithConcurrency(
      queriesToRun,
      SEARCH_CONCURRENCY,
      (query) => firecrawlSearch(query, config.search_scope || "us"),
    );

    // Take results rank by rank across queries so every category (queries are
    // interleaved by category) gets URLs before the cap is reached.
    const longestResultList = Math.max(0, ...resultsByQuery.map((results) => results.length));
    for (let rank = 0; rank < longestResultList; rank += 1) {
      for (const results of resultsByQuery) {
        if (searchResults.length >= maxSearchUrls) break;
        const result = results[rank];
        if (!result?.link || isBlockedDomain(result.link)) continue;

        const normalizedUrl = result.link.split("#")[0];
        if (seenUrls.has(normalizedUrl)) continue;
        seenUrls.add(normalizedUrl);
        searchResults.push({ ...result, link: normalizedUrl });
      }
    }

    const desiredPagesToParse = Math.max(4, Math.min(Math.ceil(maxCandidates / 4), MAX_PARSE_PAGES));
    const maxUrlsToScrape = Math.min(
      searchResults.length,
      Math.max(desiredPagesToParse * 2, MIN_SEARCH_URLS),
      MAX_SCRAPE_PAGES,
    );
    const searchResultsToScrape = searchResults.slice(0, maxUrlsToScrape);

    const scrapedPages = (
      await runWithConcurrency(searchResultsToScrape, SCRAPE_CONCURRENCY, scrapePage)
    ).filter((page): page is ScrapedPage => Boolean(page));

    const maxPagesToParse = Math.min(
      desiredPagesToParse,
      scrapedPages.length,
    );
    const pagesToParse = scrapedPages.slice(0, maxPagesToParse);
    const parsedByPage = await runWithConcurrency(
      pagesToParse,
      PARSE_CONCURRENCY,
      async (page) => {
        try {
          const parsedEvents = await parseEventsFromPage(page);
          return { page, parsedEvents };
        } catch (error) {
          console.error("Failed to parse scraped page", { url: page.url, error });
          return { page, parsedEvents: [] as ParsedEvent[] };
        }
      },
    );

    const geocodeCache = new Map<string, { lat: number; lng: number } | null>();
    const eventsByExternalId = new Map<string, NormalizedEvent>();

    for (const parsedPage of parsedByPage) {
      if (runtimeExceeded()) break;
      const page = parsedPage.page;
      const parsedEvents = parsedPage.parsedEvents;
      for (const parsedEvent of parsedEvents) {
        const normalized = await normalizeParsedEvent(
          parsedEvent,
          page,
          config.window_months || 6,
          geocodeCache,
        );

        if (normalized.missingRequired) {
          stats.skipped_missing_required += 1;
          continue;
        }

        if (normalized.outOfWindow) {
          stats.skipped_out_of_window += 1;
          continue;
        }

        if (!normalized.event) continue;

        const existing = eventsByExternalId.get(normalized.event.external_event_id);
        if (!existing) {
          eventsByExternalId.set(normalized.event.external_event_id, normalized.event);
        } else {
          const mergedSourceUrls = Array.from(
            new Set([...existing.source_urls, ...normalized.event.source_urls]),
          );
          eventsByExternalId.set(normalized.event.external_event_id, {
            ...existing,
            source_urls: mergedSourceUrls,
            source_primary_url: existing.source_primary_url || normalized.event.source_primary_url,
            source_snippet: existing.source_snippet || normalized.event.source_snippet,
          });
        }
      }
    }

    const normalizedEvents = Array.from(eventsByExternalId.values())
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, maxCandidates);

    for (const event of normalizedEvents) {
      if (runtimeExceeded()) break;
      await upsertCandidate(serviceClient, event, publish, stats);
      stats.total_processed += 1;
    }

    const runtime_limited = runtimeExceeded();

    const { error: successUpdateError } = await serviceClient
      .from("demo_event_discovery_config")
      .update({ last_success_at: new Date().toISOString() })
      .eq("id", true);
    if (successUpdateError) {
      console.error("Failed to record discovery success time", successUpdateError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        source,
        stats,
        runtime_limited,
        queries_executed: queryAttempts,
        scanned_urls: searchResults.length,
        scraped_pages: scrapedPages.length,
        parsed_pages: pagesToParse.length,
        unique_events_considered: eventsByExternalId.size,
        processed_events: stats.total_processed,
        auto_publish: publish.enabled,
        publish_skipped_reason: publish.enabled && !publish.ownerUserId ? "missing_publish_owner" : null,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("discover-demo-events failed", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
