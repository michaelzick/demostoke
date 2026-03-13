import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TriggerRequest = {
  suite?: "smoke" | "full";
  ref?: "dev" | "main";
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const githubToken = Deno.env.get("GITHUB_ACTIONS_TOKEN");
  const githubOwner = Deno.env.get("GITHUB_REPOSITORY_OWNER");
  const githubRepo = Deno.env.get("GITHUB_REPOSITORY_NAME");
  const workflowFilename =
    Deno.env.get("GITHUB_REDTEAM_WORKFLOW_FILENAME") || "security-manual-redteam.yml";

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: "Missing required Supabase environment variables" });
  }

  if (!githubToken || !githubOwner || !githubRepo) {
    return jsonResponse(500, { error: "Missing required GitHub environment variables" });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  let body: TriggerRequest;
  try {
    body = (await req.json()) as TriggerRequest;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const suite = body.suite === "full" ? "full" : "smoke";
  const ref = body.ref === "main" ? "main" : "dev";

  try {
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const { data: isAdmin, error: adminCheckError } = await authClient.rpc("is_admin");
    if (adminCheckError || isAdmin !== true) {
      return jsonResponse(403, { error: "Forbidden" });
    }

    const { data: runRow, error: insertError } = await adminClient
      .from("security_runs")
      .insert({
        requested_by: authData.user.id,
        trigger_source: "admin",
        suite,
        branch: ref,
        environment: ref,
        status: "queued",
        inputs: {
          source: "admin-dashboard",
          requested_ref: ref,
          requested_suite: suite,
        },
        metadata: {
          initiated_from: "admin_dashboard",
        },
      })
      .select("id")
      .single();

    if (insertError || !runRow?.id) {
      return jsonResponse(500, { error: insertError?.message || "Failed to create run record" });
    }

    const dispatchResponse = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${workflowFilename}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          ref,
          inputs: {
            suite,
            security_run_id: runRow.id,
            target_branch: ref,
            source: "admin",
            requested_by: authData.user.id,
          },
        }),
      },
    );

    if (!dispatchResponse.ok) {
      const errorText = await dispatchResponse.text();
      await adminClient
        .from("security_runs")
        .update({
          status: "errored",
          error_message: `Failed to dispatch workflow: ${errorText}`,
        })
        .eq("id", runRow.id);

      return jsonResponse(502, { error: "Failed to dispatch GitHub workflow", details: errorText });
    }

    await adminClient.rpc("log_security_event", {
      action_type: "security_redteam_triggered",
      table_name: "security_runs",
      record_id: runRow.id,
      new_values: {
        suite,
        branch: ref,
        trigger_source: "admin",
      },
    }).catch(() => undefined);

    return jsonResponse(200, {
      success: true,
      runId: runRow.id,
      suite,
      branch: ref,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { error: message });
  }
});
