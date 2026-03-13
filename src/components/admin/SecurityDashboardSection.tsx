import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Play,
  Radar,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/helpers";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type SecurityRun = Database["public"]["Tables"]["security_runs"]["Row"];
type SecurityFinding = Database["public"]["Tables"]["security_findings"]["Row"];

const severityPalette = {
  critical: "#7f1d1d",
  high: "#dc2626",
  medium: "#f59e0b",
  low: "#3b82f6",
  informational: "#94a3b8",
} as const;

const triageStatuses = ["open", "investigating", "resolved", "accepted", "false_positive"] as const;

const badgeVariantForStatus = (status: string) => {
  if (status === "passed" || status === "resolved") return "default";
  if (status === "failed" || status === "errored" || status === "critical" || status === "high") {
    return "destructive";
  }
  if (status === "running" || status === "queued" || status === "investigating" || status === "medium") {
    return "secondary";
  }
  return "outline";
};

const formatDuration = (run: SecurityRun) => {
  if (!run.started_at) return "Waiting";
  const end = run.completed_at ? new Date(run.completed_at).getTime() : Date.now();
  const start = new Date(run.started_at).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "Unknown";
  }
  const durationSeconds = Math.round((end - start) / 1000);
  if (durationSeconds < 60) {
    return `${durationSeconds}s`;
  }
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const fetchRuns = async (): Promise<SecurityRun[]> => {
  const { data, error } = await supabase
    .from("security_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};

const fetchFindingsForRun = async (runId: string): Promise<SecurityFinding[]> => {
  const { data, error } = await supabase
    .from("security_findings")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return data || [];
};

const SecurityDashboardSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const [requestedSuite, setRequestedSuite] = useState<"smoke" | "full">("full");
  const [requestedBranch, setRequestedBranch] = useState<"dev" | "main">("dev");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runsQuery = useQuery({
    queryKey: ["security-runs"],
    queryFn: fetchRuns,
    refetchInterval: 10_000,
  });

  const runs = useMemo(() => runsQuery.data || [], [runsQuery.data]);
  const activeRun = runs.find((run) => run.status === "queued" || run.status === "running") || null;
  const latestCompletedRun =
    runs.find((run) => ["passed", "failed", "errored", "cancelled"].includes(run.status)) || null;

  useEffect(() => {
    if (!selectedRunId) {
      setSelectedRunId(activeRun?.id || latestCompletedRun?.id || runs[0]?.id || null);
    }
  }, [activeRun?.id, latestCompletedRun?.id, runs, selectedRunId]);

  const selectedRun =
    runs.find((run) => run.id === selectedRunId) || activeRun || latestCompletedRun || runs[0] || null;

  const findingsQuery = useQuery({
    queryKey: ["security-findings", selectedRun?.id],
    queryFn: () => fetchFindingsForRun(selectedRun!.id),
    enabled: Boolean(selectedRun?.id),
    refetchInterval: activeRun?.id === selectedRun?.id ? 10_000 : false,
  });

  const findings = useMemo(() => findingsQuery.data || [], [findingsQuery.data]);

  const triggerRunMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Please sign in again before starting a red team run.");
      }

      const response = await supabase.functions.invoke("trigger-security-redteam", {
        body: {
          suite: requestedSuite,
          ref: requestedBranch,
        },
      });

      if (response.error) {
        const message = response.error.message || "Failed to trigger red team workflow";
        if (message.toLowerCase().includes("failed to send request to edge function")) {
          throw new Error(
            "Could not reach trigger-security-redteam. Redeploy the Supabase edge functions after this change and verify the function env vars are set.",
          );
        }
        throw new Error(message);
      }

      return response.data as { runId: string; branch: string; suite: string };
    },
    onSuccess: (data) => {
      setSelectedRunId(data.runId);
      queryClient.invalidateQueries({ queryKey: ["security-runs"] });
      toast({
        title: "Red team workflow queued",
        description: `Started a ${data.suite} security run on ${data.branch}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start red team workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const updateFindingMutation = useMutation({
    mutationFn: async ({
      findingId,
      triageStatus,
    }: {
      findingId: string;
      triageStatus: SecurityFinding["triage_status"];
    }) => {
      const { error } = await supabase
        .from("security_findings")
        .update({
          triage_status: triageStatus,
          triaged_at: new Date().toISOString(),
          triaged_by: user?.id || null,
        })
        .eq("id", findingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-findings", selectedRun?.id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update finding status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const severityChartData = useMemo(() => {
    if (!selectedRun) return [];
    return [
      { severity: "critical", value: selectedRun.critical_count },
      { severity: "high", value: selectedRun.high_count },
      { severity: "medium", value: selectedRun.medium_count },
      { severity: "low", value: selectedRun.low_count },
      { severity: "informational", value: selectedRun.informational_count },
    ];
  }, [selectedRun]);

  const trendData = useMemo(() => {
    return runs
      .slice(0, 8)
      .reverse()
      .map((run) => ({
        label: `${run.branch || "unknown"}-${run.created_at.slice(5, 10)}`,
        critical: run.critical_count,
        high: run.high_count,
        medium: run.medium_count,
      }));
  }, [runs]);

  const findingsByTarget = useMemo(() => {
    const counts = new Map<string, number>();
    for (const finding of findings) {
      const key = finding.target_label || finding.target_id || "Unknown";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([target, value]) => ({ target, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [findings]);

  const openFindingsCount = findings.filter((finding) =>
    ["open", "investigating"].includes(finding.triage_status),
  ).length;

  const chartConfig = {
    critical: { label: "Critical", color: severityPalette.critical },
    high: { label: "High", color: severityPalette.high },
    medium: { label: "Medium", color: severityPalette.medium },
    low: { label: "Low", color: severityPalette.low },
    informational: { label: "Informational", color: severityPalette.informational },
    value: { label: "Findings", color: severityPalette.high },
  };

  if (isAdminLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          You must be an admin to access the security dashboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Promptfoo Security Console
            </CardTitle>
            <CardDescription>
              Launch Promptfoo OSS red team runs, monitor CI findings, and triage results from a single admin surface.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={requestedSuite} onValueChange={(value) => setRequestedSuite(value as "smoke" | "full")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Suite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smoke">Smoke</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>

            <Select value={requestedBranch} onValueChange={(value) => setRequestedBranch(value as "dev" | "main")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">dev</SelectItem>
                <SelectItem value="main">main</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => triggerRunMutation.mutate()}
              disabled={triggerRunMutation.isPending || Boolean(activeRun)}
              className="gap-2"
            >
              {triggerRunMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Queueing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Red Team
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                runsQuery.refetch();
                findingsQuery.refetch();
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariantForStatus(activeRun?.status || "outline")}>
              {activeRun ? activeRun.status : "idle"}
            </Badge>
            {activeRun ? (
              <span>
                Active run on <strong className="text-foreground">{activeRun.branch}</strong> with the{" "}
                <strong className="text-foreground">{activeRun.suite}</strong> suite.
              </span>
            ) : (
              <span>No red team run is currently in progress.</span>
            )}
          </div>

          {selectedRun?.github_run_url ? (
            <a
              href={selectedRun.github_run_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open GitHub run
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Run Status</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {selectedRun?.status === "passed" ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
              {selectedRun?.status || "No data"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {selectedRun
              ? `Created ${formatDistanceToNowStrict(new Date(selectedRun.created_at), { addSuffix: true })}`
              : "Run a security scan to populate this dashboard."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Findings</CardDescription>
            <CardTitle className="text-2xl">{openFindingsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across {findingsByTarget.length || 0} affected targets in the selected run.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Risk Count</CardDescription>
            <CardTitle className="text-2xl">
              {(selectedRun?.critical_count || 0) + (selectedRun?.high_count || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Critical: {selectedRun?.critical_count || 0} | High: {selectedRun?.high_count || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Run Duration</CardDescription>
            <CardTitle className="text-2xl">{selectedRun ? formatDuration(selectedRun) : "N/A"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {selectedRun ? `${selectedRun.suite} suite on ${selectedRun.branch}` : "No completed run yet."}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Severity Breakdown</CardTitle>
            <CardDescription>Counts for the currently selected run.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72 w-full" config={chartConfig}>
              <BarChart data={severityChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="severity" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent labelKey="severity" />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.severity} fill={severityPalette[entry.severity as keyof typeof severityPalette]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Risk Trend</CardTitle>
            <CardDescription>Recent red team runs across the selected environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72 w-full" config={chartConfig}>
              <AreaChart data={trendData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="critical" stroke={severityPalette.critical} fill={severityPalette.critical} fillOpacity={0.2} />
                <Area type="monotone" dataKey="high" stroke={severityPalette.high} fill={severityPalette.high} fillOpacity={0.2} />
                <Area type="monotone" dataKey="medium" stroke={severityPalette.medium} fill={severityPalette.medium} fillOpacity={0.15} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Runs</CardTitle>
            <CardDescription>Use this list to inspect historical scans or compare dev and main.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No Promptfoo runs have been ingested yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.map((run) => (
                    <TableRow
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={cn(
                        "cursor-pointer",
                        selectedRun?.id === run.id && "bg-muted/60",
                      )}
                    >
                      <TableCell>
                        <div className="font-medium">{run.branch || "unknown"}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(run.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariantForStatus(run.status)}>{run.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{run.suite}</div>
                        <div className="text-xs text-muted-foreground">{run.trigger_source}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{run.total_findings}</div>
                        <div className="text-xs text-muted-foreground">
                          {run.critical_count} critical / {run.high_count} high
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{formatDuration(run)}</span>
                          {run.github_run_url ? (
                            <a href={run.github_run_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4" />
              Findings by Target
            </CardTitle>
            <CardDescription>Concentrates the selected run by impacted endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            {findingsByTarget.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                No findings for the selected run.
              </div>
            ) : (
              <ChartContainer className="h-72 w-full" config={chartConfig}>
                <BarChart data={findingsByTarget} layout="vertical">
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="target" width={120} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent labelKey="target" />} />
                  <Bar dataKey="value" fill={severityPalette.high} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Run Findings</CardTitle>
          <CardDescription>
            Triaging is stored per finding row so the dashboard can behave more like a security operations console.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Plugin</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findingsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : findings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No findings stored for this run.
                  </TableCell>
                </TableRow>
              ) : (
                findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>
                      <div className="font-medium">{finding.target_label || finding.target_id || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{finding.category || finding.vulnerability_type || "General"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{finding.plugin_label || finding.plugin_id || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{finding.test_id || finding.provider_label || "Promptfoo"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariantForStatus(finding.severity)}>
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={finding.triage_status}
                        onValueChange={(value) =>
                          updateFindingMutation.mutate({
                            findingId: finding.id,
                            triageStatus: value as SecurityFinding["triage_status"],
                          })
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Triage status" />
                        </SelectTrigger>
                        <SelectContent>
                          {triageStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="max-w-[240px] align-top text-sm text-muted-foreground">
                      {finding.prompt_excerpt || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[320px] align-top text-sm text-muted-foreground">
                      {finding.response_excerpt || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboardSection;
