import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import type {
  DemoEventCandidate,
  DemoEventCandidateFilter,
  DemoEventDiscoveryRunResult,
  DemoEventJsonIngestResult,
} from "@/types/demo-event-candidate";

const DISCOVER_DEMO_EVENTS_FUNCTION_URL =
  "https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/discover-demo-events";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    const parts = [maybeError.message, maybeError.details, maybeError.hint]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim());

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  return fallback;
};

export const useDemoEventCandidates = (statusFilter: DemoEventCandidateFilter = "all") => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const candidatesQuery = useQuery({
    queryKey: ["demo-event-candidates", statusFilter],
    queryFn: async (): Promise<DemoEventCandidate[]> => {
      let query = supabase
        .from("demo_event_candidates")
        .select("*")
        .order("last_seen_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return (data || []) as DemoEventCandidate[];
    },
  });

  const refreshRelevantQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] }),
      queryClient.invalidateQueries({ queryKey: ["demo-events"] }),
    ]);
  };

  const runDiscoveryMutation = useMutation({
    mutationFn: async (): Promise<DemoEventDiscoveryRunResult> => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error("You must be signed in as an admin to run discovery.");
      }

      const response = await fetch(DISCOVER_DEMO_EVENTS_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ source: "manual" }),
      });

      const payload = await response.json().catch(() => null) as
        | DemoEventDiscoveryRunResult
        | { error?: string }
        | null;

      if (!response.ok) {
        const errorMessage =
          (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : null) || `Discovery failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = payload as DemoEventDiscoveryRunResult | null;
      if (!result?.success) {
        throw new Error(result?.error || "Discovery run did not complete successfully");
      }

      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] });
      toast({
        title: "Discovery complete",
        description: `Processed ${result.stats.total_processed}. New ${result.stats.new_candidates}, updated ${result.stats.updated_pending}, missing required ${result.stats.skipped_missing_required}, out of window ${result.stats.skipped_out_of_window}.${result.runtime_limited ? " Runtime limit reached; run again to continue discovery." : ""}`,
      });
    },
    onError: (error) => {
      console.error("Error running demo event discovery:", error);
      toast({
        title: "Discovery failed",
        description: error instanceof Error ? error.message : "Failed to run demo event discovery.",
        variant: "destructive",
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
      markEdited = true,
    }: {
      id: string;
      updates: Partial<DemoEventCandidate>;
      markEdited?: boolean;
    }) => {
      const payload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (markEdited) {
        payload.admin_edited = true;
        payload.admin_edited_at = new Date().toISOString();
        payload.admin_edited_by = user?.id || null;
      }

      const { data, error } = await supabase
        .from("demo_event_candidates")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as DemoEventCandidate;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] });
    },
    onError: (error) => {
      console.error("Error updating demo event candidate:", error);
      toast({
        title: "Update failed",
        description: "Unable to update candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const ingestCandidatesFromJsonMutation = useMutation({
    mutationFn: async (payload: unknown): Promise<DemoEventJsonIngestResult> => {
      const { data, error } = await supabase.rpc("ingest_demo_event_candidates_json", {
        p_payload: payload as Json,
      });

      if (error) {
        throw new Error(getErrorMessage(error, "Unable to ingest JSON payload."));
      }

      const result = data as DemoEventJsonIngestResult | null;
      if (!result?.success) {
        throw new Error("JSON ingest did not complete successfully.");
      }

      return {
        ...result,
        errors: Array.isArray(result.errors) ? result.errors : [],
      };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] });
      toast({
        title: "JSON ingest complete",
        description: `Submitted ${result.stats.submitted}. Inserted ${result.stats.inserted}, updated pending ${result.stats.updated_pending}, skipped approved ${result.stats.skipped_approved}, skipped rejected ${result.stats.skipped_rejected}, skipped published ${result.stats.skipped_published}, invalid ${result.stats.invalid_rows}.`,
      });
    },
    onError: (error) => {
      console.error("Error ingesting demo event candidates from JSON:", error);
      toast({
        title: "JSON ingest failed",
        description: getErrorMessage(error, "Unable to ingest JSON payload."),
        variant: "destructive",
      });
    },
  });

  const approveCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const { data, error } = await supabase.rpc("approve_demo_event_candidate", {
        p_candidate_id: candidateId,
      });

      if (error) {
        throw error;
      }

      return data as string;
    },
    onSuccess: async () => {
      await refreshRelevantQueries();
      toast({
        title: "Candidate approved",
        description: "Event has been published to the demo calendar.",
      });
    },
    onError: (error) => {
      console.error("Error approving demo event candidate:", error);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Unable to approve candidate.",
        variant: "destructive",
      });
    },
  });

  const rejectCandidateMutation = useMutation({
    mutationFn: async ({ candidateId, reason }: { candidateId: string; reason?: string | null }) => {
      const { error } = await supabase.rpc("reject_demo_event_candidate", {
        p_candidate_id: candidateId,
        p_reason: reason || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] });
      toast({
        title: "Candidate rejected",
        description: "Candidate was marked rejected and kept for history.",
      });
    },
    onError: (error) => {
      console.error("Error rejecting demo event candidate:", error);
      toast({
        title: "Reject failed",
        description: error instanceof Error ? error.message : "Unable to reject candidate.",
        variant: "destructive",
      });
    },
  });

  return {
    candidates: candidatesQuery.data || [],
    isLoading: candidatesQuery.isLoading,
    error: candidatesQuery.error,
    refetch: candidatesQuery.refetch,
    runDiscovery: runDiscoveryMutation.mutateAsync,
    isRunningDiscovery: runDiscoveryMutation.isPending,
    lastRunResult: runDiscoveryMutation.data,
    updateCandidate: updateCandidateMutation.mutateAsync,
    isUpdatingCandidate: updateCandidateMutation.isPending,
    ingestCandidatesFromJson: ingestCandidatesFromJsonMutation.mutateAsync,
    isIngestingCandidates: ingestCandidatesFromJsonMutation.isPending,
    lastIngestResult: ingestCandidatesFromJsonMutation.data,
    approveCandidate: approveCandidateMutation.mutateAsync,
    isApprovingCandidate: approveCandidateMutation.isPending,
    rejectCandidate: rejectCandidateMutation.mutateAsync,
    isRejectingCandidate: rejectCandidateMutation.isPending,
  };
};
