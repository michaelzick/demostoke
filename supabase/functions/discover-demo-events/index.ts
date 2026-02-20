import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const GOOGLE_CSE_ID = Deno.env.get("GOOGLE_CSE_ID");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MAPBOX_TOKEN = Deno.env.get("MAPBOX_TOKEN");

const MIN_SEARCH_URLS = 20;
const MAX_SEARCH_URLS_HARD_CAP = 80;
const MAX_QUERY_ATTEMPTS = 20;
const MAX_PARSE_PAGES = 40;
const SCRAPE_CONCURRENCY = 5;
const PARSE_CONCURRENCY = 4;
const SOFT_RUNTIME_LIMIT_MS = 50_000;

const ALLOWED_GEAR_CATEGORIES = [
  "snowboards",
  "skis",
  "surfboards",
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
};

type SearchResult = {
  title: string;
  link: string;
  snippet?: string;
  displayLink?: string;
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
  "eventbrite.com",
  "meetup.com",
  "ticketmaster.com",
];

const CATEGORY_SEARCH_TERMS: Record<GearCategory, string[]> = {
  skis: ["ski demo day", "ski test event", "ski demo tour"],
  snowboards: ["snowboard demo day", "snowboard test ride", "snowboard demo event"],
  surfboards: ["surfboard demo day", "surfboard test ride", "surf demo event"],
  "mountain-bikes": ["mountain bike demo day", "mtb demo ride", "bike park demo event"],
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

  const queries: string[] = [];
  for (const [gearCategory, terms] of Object.entries(CATEGORY_SEARCH_TERMS) as [GearCategory, string[]][]) {
    for (const term of terms) {
      queries.push(`${term} ${scopeSuffix} ${currentYear}`);
      queries.push(`${term} ${scopeSuffix} ${nextYear}`);
      queries.push(`${term} hosted by brand shop ${gearCategory} ${scopeSuffix}`);
    }
  }

  return queries;
};

const getRequiredEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
    .select("id, enabled, cron_secret, search_scope, window_months, max_candidates_per_run, last_cron_attempt_at")
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
  supabaseAnonKey: string,
): Promise<string> {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Manual runs require Authorization bearer token");
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData?.user?.id) {
    throw new Error("Unable to verify user for manual run");
  }

  const { data: isAdmin, error: adminError } = await authClient.rpc("is_admin", {
    user_id: userData.user.id,
  });

  if (adminError || !isAdmin) {
    throw new Error("Admin access required for manual run");
  }

  return userData.user.id;
}

async function verifyCronSecret(req: Request, config: DemoEventDiscoveryConfigRow): Promise<void> {
  const cronSecret = req.headers.get("x-cron-secret")?.trim();
  if (!cronSecret || cronSecret !== config.cron_secret) {
    throw new Error("Invalid cron secret");
  }
}

async function googleSearch(query: string): Promise<SearchResult[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID");
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CSE_ID);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    console.error("Google search failed", { query, text });
    return [];
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    displayLink: item.displayLink,
  }));
}

async function scrapePage(result: SearchResult): Promise<ScrapedPage | null> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error("Missing FIRECRAWL_API_KEY");
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: result.link,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

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

  const content = (page.markdown || page.html || "").slice(0, 18000);
  if (!content) return [];

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Extract upcoming US demo events for skis, snowboards, surfboards, and mountain bikes from this page.\nReturn ONLY a JSON array.\nEach item must include:\n- title (string)\n- company (string)\n- gear_category (one of: snowboards, skis, surfboards, mountain-bikes)\n- event_date (YYYY-MM-DD)\n- event_time (HH:MM 24h or null)\n- location (string)\n- equipment_available (string or null)\nRules:\n- Include only real upcoming events with explicit dates.\n- Skip generic rentals with no event date.\n- Normalize gear_category exactly to allowed values.\n- If no qualifying events exist, return []\nCurrent date: ${today}.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
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
      max_completion_tokens: 4000,
    }),
  });

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
    const response = await fetch(url);
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
  const company = normalizeWhitespace(parsedEvent.company || "");
  const gearCategory = normalizeWhitespace(parsedEvent.gear_category || "").toLowerCase();
  const location = normalizeWhitespace(parsedEvent.location || "");
  const eventDateIso = toIsoDate(parsedEvent.event_date || null);

  const hasRequired = Boolean(title && company && location && eventDateIso && isValidGearCategory(gearCategory));
  if (!hasRequired) {
    return { event: null, missingRequired: true, outOfWindow: false };
  }

  if (!withinWindow(eventDateIso, windowMonths)) {
    return { event: null, missingRequired: false, outOfWindow: true };
  }

  const eventTime = toIsoTime(parsedEvent.event_time || null);
  const equipmentAvailable = normalizeWhitespace(parsedEvent.equipment_available || "") || null;
  const sourceDomain = extractDomain(page.url);
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
      gear_category: gearCategory as GearCategory,
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

async function upsertCandidate(
  serviceClient: any,
  candidate: NormalizedEvent,
  stats: DiscoveryStats,
): Promise<void> {
  const nowIso = new Date().toISOString();

  const { data: existingCandidate, error: existingCandidateError } = await serviceClient
    .from("demo_event_candidates")
    .select("id, status, seen_count, admin_edited, source_urls")
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

    const { error: insertError } = await serviceClient.from("demo_event_candidates").insert({
      ...candidate,
      status: "pending",
      seen_count: 1,
      first_seen_at: nowIso,
      last_seen_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    });

    if (insertError) {
      throw new Error(`Failed to insert candidate: ${insertError.message}`);
    }

    stats.new_candidates += 1;
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
        };

    const { error: updateError } = await serviceClient
      .from("demo_event_candidates")
      .update(updatePayload)
      .eq("id", existingCandidate.id);

    if (updateError) {
      throw new Error(`Failed to update pending candidate: ${updateError.message}`);
    }

    stats.updated_pending += 1;
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
    const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY);

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const payload = (await req.json().catch(() => ({}))) as DiscoverPayload;
    const source: DiscoverySource = payload.source === "cron" ? "cron" : "manual";

    const config = await fetchDiscoveryConfig(serviceClient);

    if (source === "cron") {
      await verifyCronSecret(req, config);
    } else {
      await verifyManualAdmin(req, supabaseUrl, supabaseAnonKey);
    }

    const stats: DiscoveryStats = {
      new_candidates: 0,
      updated_pending: 0,
      skipped_approved: 0,
      skipped_rejected: 0,
      skipped_missing_required: 0,
      skipped_out_of_window: 0,
      total_processed: 0,
    };

    const maxCandidates = Math.max(1, Math.min(config.max_candidates_per_run || 50, 200));
    const queries = buildQueries(config.search_scope || "us");

    const searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();
    const maxSearchUrls = Math.min(
      Math.max(maxCandidates * 2, MIN_SEARCH_URLS),
      MAX_SEARCH_URLS_HARD_CAP,
    );
    let queryAttempts = 0;

    for (const query of queries) {
      if (searchResults.length >= maxSearchUrls) break;
      if (queryAttempts >= MAX_QUERY_ATTEMPTS) break;
      if (runtimeExceeded()) break;

      queryAttempts += 1;
      const results = await googleSearch(query);

      for (const result of results) {
        if (searchResults.length >= maxSearchUrls) break;
        if (!result.link || isBlockedDomain(result.link)) continue;

        const normalizedUrl = result.link.split("#")[0];
        if (seenUrls.has(normalizedUrl)) continue;
        seenUrls.add(normalizedUrl);
        searchResults.push({ ...result, link: normalizedUrl });
      }
    }

    const scrapedPages = (
      await runWithConcurrency(searchResults, SCRAPE_CONCURRENCY, scrapePage)
    ).filter((page): page is ScrapedPage => Boolean(page));

    const maxPagesToParse = Math.min(
      Math.max(maxCandidates, MIN_SEARCH_URLS),
      MAX_PARSE_PAGES,
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
      await upsertCandidate(serviceClient, event, stats);
      stats.total_processed += 1;
    }

    const runtime_limited = runtimeExceeded();

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
