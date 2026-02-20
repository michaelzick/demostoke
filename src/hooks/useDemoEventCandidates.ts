import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import type {
  DemoEventCandidate,
  DemoEventCandidateFilter,
  DemoEventDiscoveryRunResult,
} from "@/types/demo-event-candidate";

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
      const { data, error } = await supabase.functions.invoke("discover-demo-events", {
        body: { source: "manual" },
      });

      if (error) {
        throw new Error(error.message || "Failed to run demo event discovery");
      }

      const result = data as DemoEventDiscoveryRunResult;
      if (!result?.success) {
        throw new Error(result?.error || "Discovery run did not complete successfully");
      }

      return result;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["demo-event-candidates"] });
      toast({
        title: "Discovery complete",
        description: `Processed ${result.stats.total_processed} events. New: ${result.stats.new_candidates}, Updated: ${result.stats.updated_pending}.`,
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
    approveCandidate: approveCandidateMutation.mutateAsync,
    isApprovingCandidate: approveCandidateMutation.isPending,
    rejectCandidate: rejectCandidateMutation.mutateAsync,
    isRejectingCandidate: rejectCandidateMutation.isPending,
  };
};
