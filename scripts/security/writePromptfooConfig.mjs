import fs from "node:fs";
import path from "node:path";

import { getPluginsForSuite, getTargetsForSuite, REDTEAM_PURPOSE } from "./targets.mjs";

function readArg(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return fallback;
  }
  return process.argv[index + 1];
}

const suite = readArg("--suite", process.env.PROMPTFOO_SUITE || "smoke");
const outputPath = readArg(
  "--output",
  path.join("promptfoo", "security", "generated", `promptfooconfig.${suite}.json`),
);

const supabaseUrl = process.env.PROMPTFOO_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const sharedSecret = process.env.PROMPTFOO_REDTEAM_SHARED_SECRET;
const includeAuthTargets =
  process.env.PROMPTFOO_INCLUDE_AUTH_TARGETS === "true" ||
  (Boolean(process.env.PROMPTFOO_TEST_USER_EMAIL) && Boolean(process.env.PROMPTFOO_TEST_USER_PASSWORD));

if (!supabaseUrl) {
  throw new Error("PROMPTFOO_SUPABASE_URL or VITE_SUPABASE_URL is required");
}

if (!sharedSecret) {
  throw new Error("PROMPTFOO_REDTEAM_SHARED_SECRET is required");
}

const targetUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/security-redteam-target`;
const selectedTargets = getTargetsForSuite(suite, { includeAuthTargets });

if (selectedTargets.length === 0) {
  throw new Error(`No targets selected for suite "${suite}"`);
}

const config = {
  description: `DemoStoke ${suite} Promptfoo red team suite`,
  targets: selectedTargets.map((target) => ({
    id: `webhook:${targetUrl}`,
    label: target.id,
    config: {
      targetId: target.id,
      sharedSecret,
    },
  })),
  redteam: {
    purpose: REDTEAM_PURPOSE,
    numTests: suite === "full" ? 12 : 4,
    plugins: getPluginsForSuite(suite),
  },
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      suite,
      outputPath,
      targetUrl,
      targets: selectedTargets.map((target) => target.id),
      includeAuthTargets,
    },
    null,
    2,
  ),
);
