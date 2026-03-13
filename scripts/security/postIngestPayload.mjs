import fs from "node:fs";

function readArg(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return fallback;
  }
  return process.argv[index + 1];
}

function maybeNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const phase = readArg("--phase");
if (!phase) {
  throw new Error("--phase is required");
}

const ingestUrl =
  readArg("--ingest-url", process.env.SECURITY_INGEST_URL) ||
  `${(process.env.PROMPTFOO_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "")}/functions/v1/ingest-security-report`;
const ingestSecret = readArg("--ingest-secret", process.env.SECURITY_RESULTS_INGEST_SECRET);
const payloadFile = readArg("--payload-file");

if (!ingestUrl) {
  throw new Error("SECURITY_INGEST_URL or PROMPTFOO_SUPABASE_URL is required");
}

if (!ingestSecret) {
  throw new Error("SECURITY_RESULTS_INGEST_SECRET is required");
}

let payload = {};
if (payloadFile) {
  if (!fs.existsSync(payloadFile)) {
    throw new Error(`Payload file not found: ${payloadFile}`);
  }
  payload = JSON.parse(fs.readFileSync(payloadFile, "utf8"));
}

const githubRunId = maybeNumber(readArg("--github-run-id", process.env.GITHUB_RUN_ID));
const githubRunAttempt = maybeNumber(readArg("--github-run-attempt", process.env.GITHUB_RUN_ATTEMPT));
const githubRunNumber = maybeNumber(readArg("--github-run-number", process.env.GITHUB_RUN_NUMBER));
const githubRepository = readArg("--github-repository", process.env.GITHUB_REPOSITORY || null);
const githubWorkflow = readArg("--github-workflow", process.env.GITHUB_WORKFLOW || null);
const githubRunUrl =
  readArg(
    "--github-run-url",
    githubRunId && process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${githubRunId}`
      : null,
  ) || null;

const requestPayload = {
  ...payload,
  phase,
  runId: readArg("--run-id", payload.runId || null) || null,
  requestedBy: readArg("--requested-by", payload.requestedBy || null) || null,
  triggerSource: readArg("--trigger-source", payload.triggerSource || "push"),
  suite: readArg("--suite", payload.suite || process.env.PROMPTFOO_SUITE || "smoke"),
  branch: readArg("--branch", payload.branch || process.env.GITHUB_REF_NAME || null) || null,
  environment: readArg("--environment", payload.environment || process.env.GITHUB_REF_NAME || null) || null,
  commitSha: readArg("--commit-sha", payload.commitSha || process.env.GITHUB_SHA || null) || null,
  status:
    readArg("--status", payload.status || (phase === "started" ? "running" : "passed")) ||
    (phase === "started" ? "running" : "passed"),
  errorMessage: readArg("--error-message", payload.errorMessage || null) || null,
  github: {
    runId: githubRunId,
    runAttempt: githubRunAttempt,
    runNumber: githubRunNumber,
    repository: githubRepository,
    workflow: githubWorkflow,
    runUrl: githubRunUrl,
  },
  promptfoo: {
    version: readArg("--promptfoo-version", payload.promptfoo?.version || null) || null,
    resultsPath: readArg("--results-path", payload.promptfoo?.resultsPath || null) || null,
    reportPath: readArg("--report-path", payload.promptfoo?.reportPath || null) || null,
  },
};

const response = await fetch(ingestUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-security-ingest-secret": ingestSecret,
  },
  body: JSON.stringify(requestPayload),
});

const body = await response.text();
if (!response.ok) {
  throw new Error(`Ingest failed (${response.status}): ${body}`);
}

console.log(body);
