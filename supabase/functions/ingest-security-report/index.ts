import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-security-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RunStatus = "queued" | "running" | "passed" | "failed" | "errored" | "cancelled";

type FindingPayload = {
  fingerprint: string;
  pluginId?: string | null;
  pluginLabel?: string | null;
  severity?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  providerId?: string | null;
  providerLabel?: string | null;
  category?: string | null;
  vulnerabilityType?: string | null;
  testId?: string | null;
  testDescription?: string | null;
  promptExcerpt?: string | null;
  responseExcerpt?: string | null;
  score?: number | null;
  passed?: boolean | null;
  labels?: string[] | null;
  triageStatus?: string | null;
  branch?: string | null;
  commitSha?: string | null;
  raw?: Record<string, unknown> | null;
};

type IngestPayload = {
  phase: "started" | "completed";
  runId?: string | null;
  requestedBy?: string | null;
  triggerSource?: "push" | "manual" | "admin";
  suite?: "smoke" | "full";
  branch?: string | null;
  environment?: string | null;
  commitSha?: string | null;
  status?: RunStatus;
  errorMessage?: string | null;
  github?: {
    runId?: number | null;
    runAttempt?: number | null;
    runNumber?: number | null;
    repository?: string | null;
    workflow?: string | null;
    runUrl?: string | null;
  } | null;
  promptfoo?: {
    version?: string | null;
    resultsPath?: string | null;
    reportPath?: string | null;
  } | null;
  summary?: {
    totalFindings?: number;
    criticalCount?: number;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
    informationalCount?: number;
    repoPolicyCount?: number;
    thresholdStatus?: string | null;
    targetCount?: number;
    raw?: Record<string, unknown> | null;
  } | null;
  findings?: FindingPayload[] | null;
  metadata?: Record<string, unknown> | null;
  inputs?: Record<string, unknown> | null;
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanText = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeSeverity = (value?: string | null) => {
  const normalized = (value || "medium").toLowerCase();
  if (["critical", "high", "medium", "low", "informational"].includes(normalized)) {
    return normalized;
  }
  return "medium";
};

const normalizeTriageStatus = (value?: string | null) => {
  const normalized = (value || "open").toLowerCase();
  if (["open", "investigating", "resolved", "accepted", "false_positive"].includes(normalized)) {
    return normalized;
  }
  return "open";
};

async function findRun(
  supabase: ReturnType<typeof createClient>,
  payload: IngestPayload,
) {
  if (payload.runId) {
    const { data } = await supabase
      .from("security_runs")
      .select("id")
      .eq("id", payload.runId)
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  if (payload.github?.runId) {
    const { data } = await supabase
      .from("security_runs")
      .select("id")
      .eq("github_run_id", payload.github.runId)
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const ingestSecret = Deno.env.get("SECURITY_RESULTS_INGEST_SECRET");
  const providedSecret = req.headers.get("x-security-ingest-secret");
  if (!ingestSecret || providedSecret !== ingestSecret) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "Missing required Supabase environment variables" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let payload: IngestPayload;
  try {
    payload = (await req.json()) as IngestPayload;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  if (!payload.phase) {
    return jsonResponse(400, { error: "phase is required" });
  }

  const runStatus: RunStatus =
    payload.phase === "started" ? "running" : payload.status || "passed";

  const counts = payload.summary || {};
  const runValues = {
    requested_by: payload.requestedBy || null,
    trigger_source: payload.triggerSource || "push",
    suite: payload.suite || "smoke",
    branch: cleanText(payload.branch),
    environment: cleanText(payload.environment),
    commit_sha: cleanText(payload.commitSha),
    status: runStatus,
    github_run_id: payload.github?.runId ?? null,
    github_run_attempt: payload.github?.runAttempt ?? null,
    github_run_number: payload.github?.runNumber ?? null,
    github_repository: cleanText(payload.github?.repository || null),
    github_workflow: cleanText(payload.github?.workflow || null),
    github_run_url: cleanText(payload.github?.runUrl || null),
    promptfoo_version: cleanText(payload.promptfoo?.version || null),
    promptfoo_results_path: cleanText(payload.promptfoo?.resultsPath || null),
    promptfoo_report_path: cleanText(payload.promptfoo?.reportPath || null),
    total_findings: counts.totalFindings ?? 0,
    critical_count: counts.criticalCount ?? 0,
    high_count: counts.highCount ?? 0,
    medium_count: counts.mediumCount ?? 0,
    low_count: counts.lowCount ?? 0,
    informational_count: counts.informationalCount ?? 0,
    summary: counts.raw || {},
    inputs: payload.inputs || {},
    metadata: payload.metadata || {},
    error_message: cleanText(payload.errorMessage),
    started_at: payload.phase === "started" ? new Date().toISOString() : undefined,
    completed_at: payload.phase === "completed" ? new Date().toISOString() : undefined,
  };

  const existingRunId = await findRun(supabase, payload);

  let runId = existingRunId;
  if (runId) {
    const { error } = await supabase
      .from("security_runs")
      .update(runValues)
      .eq("id", runId);

    if (error) {
      return jsonResponse(500, { error: error.message });
    }
  } else {
    const insertValues = {
      ...runValues,
      started_at:
        payload.phase === "started"
          ? new Date().toISOString()
          : runValues.started_at || new Date().toISOString(),
      completed_at: payload.phase === "completed" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("security_runs")
      .insert(insertValues)
      .select("id")
      .single();

    if (error || !data?.id) {
      return jsonResponse(500, { error: error?.message || "Failed to create security run" });
    }

    runId = data.id;
  }

  if (payload.phase === "completed" && runId) {
    const { error: deleteError } = await supabase
      .from("security_findings")
      .delete()
      .eq("run_id", runId);

    if (deleteError) {
      return jsonResponse(500, { error: deleteError.message });
    }

    const findings = (payload.findings || []).filter((finding) => finding.fingerprint);
    if (findings.length > 0) {
      const rows = findings.map((finding) => ({
        run_id: runId,
        fingerprint: finding.fingerprint,
        plugin_id: cleanText(finding.pluginId || null),
        plugin_label: cleanText(finding.pluginLabel || null),
        severity: normalizeSeverity(finding.severity),
        target_id: cleanText(finding.targetId || null),
        target_label: cleanText(finding.targetLabel || null),
        provider_id: cleanText(finding.providerId || null),
        provider_label: cleanText(finding.providerLabel || null),
        category: cleanText(finding.category || null),
        vulnerability_type: cleanText(finding.vulnerabilityType || null),
        test_id: cleanText(finding.testId || null),
        test_description: cleanText(finding.testDescription || null),
        prompt_excerpt: cleanText(finding.promptExcerpt || null),
        response_excerpt: cleanText(finding.responseExcerpt || null),
        score: typeof finding.score === "number" ? finding.score : null,
        passed: typeof finding.passed === "boolean" ? finding.passed : null,
        labels: Array.isArray(finding.labels) ? finding.labels.filter(Boolean) : [],
        triage_status: normalizeTriageStatus(finding.triageStatus),
        branch: cleanText(finding.branch || payload.branch || null),
        commit_sha: cleanText(finding.commitSha || payload.commitSha || null),
        raw: finding.raw || {},
      }));

      const { error: insertError } = await supabase
        .from("security_findings")
        .insert(rows);

      if (insertError) {
        return jsonResponse(500, { error: insertError.message });
      }
    }
  }

  return jsonResponse(200, {
    success: true,
    runId,
    status: runStatus,
    findingsStored: payload.phase === "completed" ? payload.findings?.length || 0 : 0,
  });
});
