import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type GenerationConfig = {
  cron_secret: string;
  enabled: boolean;
};

type GearReviewDraftResponse = {
  status?: "created" | "skipped" | "error";
  reason?: string;
  error?: string;
  category?: string;
  equipmentId?: string;
  blogPostId?: string;
  postId?: string;
  title?: string;
  slug?: string;
  draft?: {
    title?: string;
    slug?: string;
  };
};

type ResultState =
  | { status: "created"; title?: string; slug?: string; postId?: string; category?: string }
  | { status: "skipped"; reason: string; category?: string }
  | { status: "error"; message: string };

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred.";
};

const readFunctionErrorResponse = async (error: unknown): Promise<GearReviewDraftResponse | null> => {
  const context = error && typeof error === "object" && "context" in error
    ? (error as { context?: unknown }).context
    : null;

  if (!context || typeof context !== "object" || !("json" in context)) {
    return null;
  }

  const json = (context as { json?: unknown }).json;
  if (typeof json !== "function") {
    return null;
  }

  try {
    return (await json.call(context)) as GearReviewDraftResponse;
  } catch {
    return null;
  }
};

const formatReason = (reason?: string) => {
  if (!reason) {
    return "No reason was provided.";
  }

  return reason.replace(/_/g, " ");
};

const getDraftPostId = (data: GearReviewDraftResponse) => data.blogPostId ?? data.postId;
const getDraftTitle = (data: GearReviewDraftResponse) => data.title ?? data.draft?.title;
const getDraftSlug = (data: GearReviewDraftResponse) => data.slug ?? data.draft?.slug;

const GearReviewBlogCronSection = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<GenerationConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  const loadConfig = useCallback(async () => {
    setIsConfigLoading(true);
    setConfigError(null);

    try {
      const { data, error } = await supabase
        .from("gear_review_blog_generation_config")
        .select("cron_secret, enabled")
        .eq("id", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data?.cron_secret) {
        throw new Error("Gear review blog generation config is missing a cron secret.");
      }

      setConfig({
        cron_secret: data.cron_secret,
        enabled: data.enabled,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setConfigError(message);
      setConfig(null);
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const handleCreateDraft = async () => {
    if (!config?.cron_secret) {
      setResult({ status: "error", message: "The gear review generation cron secret is unavailable." });
      return;
    }

    setIsCreating(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke<GearReviewDraftResponse>(
        "generate-gear-review-blog-draft",
        {
          body: { source: "manual" },
          headers: { "x-cron-secret": config.cron_secret },
        },
      );

      let data = response.data;
      if (response.error) {
        data = (await readFunctionErrorResponse(response.error)) ?? data;
      }

      if (data?.status === "created") {
        const createdResult: ResultState = {
          status: "created",
          title: getDraftTitle(data),
          slug: getDraftSlug(data),
          postId: getDraftPostId(data),
          category: data.category,
        };
        setResult(createdResult);
        toast({
          title: "Gear review draft created",
          description: createdResult.title ?? createdResult.slug ?? "A new draft is ready to review.",
        });
        return;
      }

      if (data?.status === "skipped") {
        const skippedResult: ResultState = {
          status: "skipped",
          reason: formatReason(data.reason),
          category: data.category,
        };
        setResult(skippedResult);
        toast({
          title: "Gear review generation skipped",
          description: skippedResult.reason,
        });
        return;
      }

      const message = formatReason(data?.reason ?? data?.error ?? response.error?.message);
      setResult({ status: "error", message });
      toast({
        title: "Gear review generation failed",
        description: message,
        variant: "destructive",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setResult({ status: "error", message });
      toast({
        title: "Gear review generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gear Review Blog Drafts
            </CardTitle>
            <CardDescription>
              Manually trigger the gear-review draft generator using the admin-protected cron configuration.
            </CardDescription>
          </div>
          {config && (
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {configError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration unavailable</AlertTitle>
            <AlertDescription>{configError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleCreateDraft} disabled={isConfigLoading || isCreating || !config?.cron_secret}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating draft...
              </>
            ) : (
              "Create Gear Review Draft"
            )}
          </Button>
          {isConfigLoading && (
            <span className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading generation config...
            </span>
          )}
        </div>

        {result?.status === "created" && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Draft created</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {result.title ? <span className="font-medium">{result.title}</span> : "A new gear review draft was created."}
                {result.slug ? <span className="text-muted-foreground"> ({result.slug})</span> : null}
              </p>
              {result.postId ? (
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/blog/preview/${result.postId}`}>
                      Preview draft
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/blog/edit/${result.postId}`}>
                      Edit draft
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">The function did not return a draft ID to link.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result?.status === "skipped" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation skipped</AlertTitle>
            <AlertDescription>
              {result.reason}
              {result.category ? <span className="text-muted-foreground"> Category: {result.category}.</span> : null}
            </AlertDescription>
          </Alert>
        )}

        {result?.status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation failed</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GearReviewBlogCronSection;
