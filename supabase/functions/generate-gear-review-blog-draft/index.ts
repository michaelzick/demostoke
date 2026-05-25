import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildGearImageSearchQuery,
  filterHighResolutionGearImageResults,
  type ValidGoogleImageSearchResult,
} from "../_shared/googleImageFilters.ts";
import {
  calculateReadTime,
  chooseRandomCategory,
  getAlreadyReviewedReason,
  getPublicCopyViolation,
  buildGeneratedReviewSystemPrompt,
  buildGeneratedReviewUserPrompt,
  buildUniqueSlug,
  hasEnoughGearDetail,
  normalizeGeneratedDraft,
  selectBlogImages,
  shuffleCategories,
  slugifyReviewTitle,
  type ExistingGearReviewPost,
  type GearReviewCandidate,
  type GeneratedReviewDraft,
  type SourceSnippet,
} from "../_shared/gearReviewBlogGeneration.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GenerationSource = "cron" | "manual";

type GenerateRequest = {
  source?: GenerationSource;
  dryRun?: boolean;
};

type ConfigRow = {
  enabled: boolean;
  cron_secret: string;
  draft_owner_user_id: string | null;
};

type CandidateRow = GearReviewCandidate & {
  equipment_images?: Array<{
    image_url: string;
    display_order: number | null;
    is_primary: boolean | null;
  }> | null;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const GOOGLE_API_KEY =
  Deno.env.get("GOOGLE_SEARCH_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY") ?? "";
const GOOGLE_SEARCH_ENGINE_ID =
  Deno.env.get("GOOGLE_SEARCH_ENGINE_ID") ?? Deno.env.get("GOOGLE_CSE_ID") ?? "";
const OPENAI_MODEL = Deno.env.get("GEAR_REVIEW_BLOG_MODEL") ?? "gpt-5-mini";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const extractJsonObject = (value: string): unknown => {
  const trimmed = value.trim();
  const fenceMatch =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i) ??
    trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  const jsonText = fenceMatch?.[1] ?? trimmed;
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Generated content did not contain a JSON object");
  }

  return JSON.parse(jsonText.slice(start, end + 1));
};

const asGeneratedReviewDraft = (value: unknown): GeneratedReviewDraft => {
  if (!value || typeof value !== "object") {
    throw new Error("Generated content was not an object");
  }

  const draft = value as Record<string, unknown>;
  if (
    typeof draft.title !== "string" ||
    typeof draft.excerpt !== "string" ||
    typeof draft.content !== "string" ||
    !Array.isArray(draft.tags)
  ) {
    throw new Error("Generated content was missing required fields");
  }

  return {
    title: draft.title,
    excerpt: draft.excerpt,
    content: draft.content,
    tags: draft.tags.filter((tag): tag is string => typeof tag === "string"),
    claimCheckSummary: Array.isArray(draft.claimCheckSummary)
      ? draft.claimCheckSummary.filter((item): item is string => typeof item === "string")
      : [],
  };
};

const assertEnvironment = () => {
  const missing = [
    ["SUPABASE_URL", SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY],
    ["OPENAI_API_KEY", OPENAI_API_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const loadConfig = async (): Promise<ConfigRow> => {
  const { data, error } = await supabase
    .from("gear_review_blog_generation_config")
    .select("enabled, cron_secret, draft_owner_user_id")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load generation config: ${error.message}`);
  }

  if (!data) {
    throw new Error("Gear review blog generation config is missing");
  }

  return data as ConfigRow;
};

const loadExistingReviewContext = async () => {
  const [postsResult, runsResult] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("title, slug, tags")
      .eq("category", "gear reviews")
      .in("status", ["draft", "published"])
      .limit(1000),
    supabase
      .from("gear_review_blog_generation_runs")
      .select("equipment_id")
      .eq("status", "success")
      .limit(10000),
  ]);

  if (postsResult.error) {
    throw new Error(`Failed to load existing gear review posts: ${postsResult.error.message}`);
  }

  if (runsResult.error) {
    throw new Error(`Failed to load previous generation runs: ${runsResult.error.message}`);
  }

  return {
    existingPosts: (postsResult.data ?? []) as ExistingGearReviewPost[],
    successfulRunEquipmentIds: new Set(
      (runsResult.data ?? [])
        .map((row: { equipment_id?: string | null }) => row.equipment_id)
        .filter((id): id is string => Boolean(id)),
    ),
  };
};

const toCandidate = (row: CandidateRow): GearReviewCandidate => {
  const sortedImages = [...(row.equipment_images ?? [])].sort((left, right) => {
    if (left.is_primary && !right.is_primary) return -1;
    if (!left.is_primary && right.is_primary) return 1;
    return (left.display_order ?? 0) - (right.display_order ?? 0);
  });

  return {
    ...row,
    images: sortedImages.map((image) => image.image_url).filter(Boolean),
  };
};

const loadEquipmentReviewIds = async (equipmentIds: string[]): Promise<Set<string>> => {
  if (equipmentIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("equipment_reviews")
    .select("equipment_id")
    .in("equipment_id", equipmentIds)
    .limit(1000);

  if (error) {
    throw new Error(`Failed to load existing equipment reviews: ${error.message}`);
  }

  return new Set(
    (data ?? [])
      .map((row: { equipment_id?: string | null }) => row.equipment_id)
      .filter((id): id is string => Boolean(id)),
  );
};

const loadCandidateBatch = async (
  category: string,
  excludedEquipmentIds: Set<string>,
): Promise<GearReviewCandidate[]> => {
  const countResult = await supabase
    .from("equipment")
    .select("id", { count: "exact", head: true })
    .eq("category", category)
    .eq("status", "available");

  if (countResult.error) {
    throw new Error(`Failed to count ${category} equipment: ${countResult.error.message}`);
  }

  const count = countResult.count ?? 0;
  if (count === 0) {
    return [];
  }

  const batchSize = Math.min(40, count);
  const maxOffset = Math.max(count - batchSize, 0);
  const offset = Math.floor(Math.random() * (maxOffset + 1));

  const { data, error } = await supabase
    .from("equipment")
    .select(
      [
        "id",
        "name",
        "category",
        "description",
        "size",
        "weight",
        "material",
        "suitable_skill_level",
        "subcategory",
        "price_per_day",
        "price_per_hour",
        "price_per_week",
        "location_address",
        "review_count",
        "equipment_images(image_url, display_order, is_primary)",
      ].join(", "),
    )
    .eq("category", category)
    .eq("status", "available")
    .order("created_at", { ascending: true })
    .range(offset, offset + batchSize - 1);

  if (error) {
    throw new Error(`Failed to load ${category} candidates: ${error.message}`);
  }

  return ((data ?? []) as unknown as CandidateRow[])
    .map(toCandidate)
    .filter((candidate) => !excludedEquipmentIds.has(candidate.id));
};

const selectCandidate = async (
  excludedEquipmentIds: Set<string>,
): Promise<{ candidate: GearReviewCandidate | null; category: string; skipReason?: string }> => {
  const baseContext = await loadExistingReviewContext();
  const preferredCategory = chooseRandomCategory();
  const categories = shuffleCategories(preferredCategory);
  let lastCategory = preferredCategory;

  for (const category of categories) {
    lastCategory = category;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const batch = await loadCandidateBatch(category, excludedEquipmentIds);
      const reviewIds = await loadEquipmentReviewIds(batch.map((candidate) => candidate.id));

      const eligible = batch.filter((candidate) => {
        if (!hasEnoughGearDetail(candidate)) {
          return false;
        }

        const reviewed = getAlreadyReviewedReason(candidate, {
          ...baseContext,
          equipmentReviewIds: reviewIds,
        });
        return !reviewed.alreadyReviewed;
      });

      if (eligible.length > 0) {
        return {
          candidate: eligible[Math.floor(Math.random() * eligible.length)],
          category,
        };
      }
    }
  }

  return {
    candidate: null,
    category: lastCategory,
    skipReason: "no_unreviewed_eligible_gear",
  };
};

const googleWebSearch = async (gear: GearReviewCandidate): Promise<SourceSnippet[]> => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    return [];
  }

  const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
  searchUrl.searchParams.set("key", GOOGLE_API_KEY);
  searchUrl.searchParams.set("cx", GOOGLE_SEARCH_ENGINE_ID);
  searchUrl.searchParams.set("q", `${gear.name} ${gear.category} specs review`);
  searchUrl.searchParams.set("num", "5");
  searchUrl.searchParams.set("safe", "active");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    console.warn("Google web search failed", response.status, await response.text());
    return [];
  }

  const data = await response.json();
  return (data.items ?? []).map((item: Record<string, string>) => ({
    title: item.title ?? "",
    link: item.link ?? "",
    snippet: item.snippet ?? "",
    displayLink: item.displayLink ?? "",
  }));
};

const googleImageSearch = async (
  gear: GearReviewCandidate,
): Promise<ValidGoogleImageSearchResult[]> => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error("Google Search API configuration missing");
  }

  const results: ValidGoogleImageSearchResult[] = [];
  const query = buildGearImageSearchQuery(gear.name, gear.category);

  for (let page = 0; page < 3; page += 1) {
    const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
    searchUrl.searchParams.set("key", GOOGLE_API_KEY);
    searchUrl.searchParams.set("cx", GOOGLE_SEARCH_ENGINE_ID);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("searchType", "image");
    searchUrl.searchParams.set("num", "10");
    searchUrl.searchParams.set("start", String(page * 10 + 1));
    searchUrl.searchParams.set("imageSize", "large");
    searchUrl.searchParams.set("imageType", "photo");
    searchUrl.searchParams.set("safe", "active");

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      throw new Error(`Google Image Search failed: ${response.status}`);
    }

    const data = await response.json();
    const pageResults = (data.items ?? []).map((item: Record<string, any>) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink ?? item.link,
      title: item.title,
      source: item.displayLink ?? "Unknown",
      width: item.image?.width,
      height: item.image?.height,
    }));

    results.push(...filterHighResolutionGearImageResults(pageResults, 10));

    if (results.length >= 10) {
      break;
    }
  }

  return filterHighResolutionGearImageResults(results, 10);
};

const generateDraft = async (
  gear: GearReviewCandidate,
  sources: SourceSnippet[],
): Promise<GeneratedReviewDraft> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: buildGeneratedReviewSystemPrompt() },
        { role: "user", content: buildGeneratedReviewUserPrompt(gear, sources) },
      ],
      max_completion_tokens: 6500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI generation failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned empty generated content");
  }

  return normalizeGeneratedDraft(gear, asGeneratedReviewDraft(extractJsonObject(content)));
};

const recordRun = async (values: {
  equipmentId?: string | null;
  blogPostId?: string | null;
  gearCategory?: string | null;
  source: GenerationSource;
  status: "success" | "skipped" | "error";
  reason?: string | null;
  errorMessage?: string | null;
  hiddenEvidence?: Record<string, unknown>;
}) => {
  const { error } = await supabase.from("gear_review_blog_generation_runs").insert({
    equipment_id: values.equipmentId ?? null,
    blog_post_id: values.blogPostId ?? null,
    gear_category: values.gearCategory ?? null,
    source: values.source,
    status: values.status,
    reason: values.reason ?? null,
    error_message: values.errorMessage ?? null,
    hidden_evidence: values.hiddenEvidence ?? {},
  });

  if (error) {
    console.error("Failed to record gear review generation run", error);
  }
};

const buildHiddenEvidence = (values: {
  gear: GearReviewCandidate;
  sources: SourceSnippet[];
  imageCandidates: ValidGoogleImageSearchResult[];
  selectedImages: ReturnType<typeof selectBlogImages>;
  draft: GeneratedReviewDraft;
}) => ({
  prompt_version: "gear-review-blog-draft-v2",
  model: OPENAI_MODEL,
  generated_at: new Date().toISOString(),
  equipment_snapshot: values.gear,
  source_snippets: values.sources,
  image_candidates: values.imageCandidates.slice(0, 10),
  selected_images: values.selectedImages?.evidence ?? null,
  claim_check_summary: values.draft.claimCheckSummary ?? [],
});

const createDraftPost = async (values: {
  gear: GearReviewCandidate;
  draft: GeneratedReviewDraft;
  ownerUserId: string;
  slug: string;
  heroImage: string;
  thumbnail: string;
}) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: values.draft.title,
      slug: values.slug,
      excerpt: values.draft.excerpt,
      content: values.draft.content,
      category: "gear reviews",
      author: "Chad G.",
      author_id: "chad-g",
      user_id: values.ownerUserId,
      status: "draft",
      tags: values.draft.tags,
      thumbnail: values.thumbnail,
      hero_image: values.heroImage,
      published_at: new Date().toISOString(),
      read_time: calculateReadTime(values.draft.content),
      is_featured: false,
    })
    .select("id, slug")
    .single();

  if (error) {
    throw new Error(`Failed to create blog draft: ${error.message}`);
  }

  return data as { id: string; slug: string };
};

const loadExistingSlugs = async (): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .not("slug", "is", null)
    .limit(10000);

  if (error) {
    throw new Error(`Failed to load existing blog slugs: ${error.message}`);
  }

  return new Set(
    (data ?? [])
      .map((row: { slug?: string | null }) => row.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let payload: GenerateRequest = {};
  let source: GenerationSource = "manual";
  let lastCandidate: GearReviewCandidate | null = null;

  try {
    assertEnvironment();
    payload = await req.json().catch(() => ({}));
    source = payload.source === "cron" ? "cron" : "manual";

    const config = await loadConfig();
    const cronSecret = req.headers.get("x-cron-secret")?.trim();
    if (!cronSecret || cronSecret !== config.cron_secret) {
      return jsonResponse({ status: "error", reason: "invalid_cron_secret" }, 401);
    }

    if (!config.enabled) {
      if (!payload.dryRun) {
        await recordRun({ source, status: "skipped", reason: "disabled" });
      }
      return jsonResponse({ status: "skipped", reason: "disabled" });
    }

    if (!config.draft_owner_user_id) {
      if (!payload.dryRun) {
        await recordRun({ source, status: "error", reason: "missing_draft_owner_user_id" });
      }
      return jsonResponse({ status: "error", reason: "missing_draft_owner_user_id" }, 500);
    }

    const excludedEquipmentIds = new Set<string>();
    let lastFailure: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const selection = await selectCandidate(excludedEquipmentIds);
      if (!selection.candidate) {
        if (!payload.dryRun) {
          await recordRun({
            source,
            status: "skipped",
            gearCategory: selection.category,
            reason: selection.skipReason ?? "no_candidate",
          });
        }
        return jsonResponse({
          status: "skipped",
          category: selection.category,
          reason: selection.skipReason ?? "no_candidate",
        });
      }

      const gear = selection.candidate;
      lastCandidate = gear;
      excludedEquipmentIds.add(gear.id);

      const sources = await googleWebSearch(gear);
      const imageCandidates = await googleImageSearch(gear);
      const selectedImages = selectBlogImages(imageCandidates);

      if (!selectedImages) {
        lastFailure = "no_suitable_google_images";
        continue;
      }

      const draft = await generateDraft(gear, sources);
      const publicCopyViolation = getPublicCopyViolation(draft);

      if (publicCopyViolation) {
        lastFailure = publicCopyViolation;
        continue;
      }

      const existingSlugs = await loadExistingSlugs();
      const slug = buildUniqueSlug(slugifyReviewTitle(draft.title), existingSlugs);
      const hiddenEvidence = buildHiddenEvidence({
        gear,
        sources,
        imageCandidates,
        selectedImages,
        draft,
      });

      if (payload.dryRun) {
        return jsonResponse({
          status: "created",
          category: gear.category,
          equipmentId: gear.id,
          slug,
          draft: {
            title: draft.title,
            excerpt: draft.excerpt,
            tags: draft.tags,
            heroImage: selectedImages.heroImage,
            thumbnail: selectedImages.thumbnail,
          },
        });
      }

      const blogPost = await createDraftPost({
        gear,
        draft,
        ownerUserId: config.draft_owner_user_id,
        slug,
        heroImage: selectedImages.heroImage,
        thumbnail: selectedImages.thumbnail,
      });

      await recordRun({
        equipmentId: gear.id,
        blogPostId: blogPost.id,
        gearCategory: gear.category,
        source,
        status: "success",
        hiddenEvidence,
      });

      await supabase
        .from("gear_review_blog_generation_config")
        .update({ last_success_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", true);

      return jsonResponse({
        status: "created",
        category: gear.category,
        equipmentId: gear.id,
        blogPostId: blogPost.id,
        slug: blogPost.slug,
      });
    }

    if (!payload.dryRun) {
      await recordRun({
        equipmentId: lastCandidate?.id ?? null,
        gearCategory: lastCandidate?.category ?? null,
        source,
        status: "error",
        reason: lastFailure ?? "candidate_generation_exhausted",
        errorMessage: lastFailure ?? "Candidate retry limit exhausted",
      });
    }

    return jsonResponse({
      status: "error",
      equipmentId: lastCandidate?.id,
      category: lastCandidate?.category,
      reason: lastFailure ?? "candidate_generation_exhausted",
    }, 500);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-gear-review-blog-draft failed", error);

    if (!payload.dryRun) {
      await recordRun({
        equipmentId: lastCandidate?.id ?? null,
        gearCategory: lastCandidate?.category ?? null,
        source,
        status: "error",
        reason: "unexpected_error",
        errorMessage: message,
      }).catch((recordError) => console.error("Failed to record unexpected error", recordError));
    }

    return jsonResponse({ status: "error", reason: "unexpected_error", error: message }, 500);
  }
});
