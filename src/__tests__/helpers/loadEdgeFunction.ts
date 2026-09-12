import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";

// Run unchanged Edge Function entrypoints with network/SDK boundaries replaced.
// No server starts, credentials are read, or remote imports execute in these tests.
export function loadEdgeFunction(name: string, mocks: {
  fetch: typeof fetch;
  createClient?: (...args: unknown[]) => unknown;
  resolveDns?: (hostname: string, type: "A" | "AAAA") => Promise<string[]>;
  sendEmail?: (...args: unknown[]) => unknown;
}) {
  let handler: (req: Request) => Promise<Response>;
  const modules = new Map<string, { exports: Record<string, unknown> }>();
  const context = vm.createContext({
    Request,
    Response,
    Headers,
    URL,
    URLSearchParams,
    TextDecoder,
    TextEncoder,
    AbortSignal,
    AbortController,
    Uint8Array,
    setTimeout,
    clearTimeout,
    fetch: mocks.fetch,
    console: { log() {}, warn() {}, error() {} },
    Deno: {
      resolveDns: mocks.resolveDns,
      env: {
        get: (key: string) =>
          key === "SUPABASE_URL"
            ? "https://project.supabase.co"
            : `test-${key}`,
      },
      serve: (fn: typeof handler) => {
        handler = fn;
      },
    },
  });
  const load = (filename: string): Record<string, unknown> => {
    if (modules.has(filename)) return modules.get(filename)!.exports;
    const module = { exports: {} };
    modules.set(filename, module);
    const require = (specifier: string) => {
      if (specifier.startsWith(".")) {
        return load(path.resolve(path.dirname(filename), specifier));
      }
      if (specifier.includes("@supabase/supabase-js")) {
        return { createClient: mocks.createClient };
      }
      if (specifier.includes("/http/server.ts")) {
        return {
          serve: (fn: typeof handler) => {
            handler = fn;
          },
        };
      }
      if (specifier.includes("/zod@")) return { z };
      if (specifier.includes("/resend@")) {
        return {
          Resend: class {
            emails = { send: mocks.sendEmail };
          },
        };
      }
      if (specifier.includes("/xhr@")) return {};
      throw new Error(`Unexpected test import: ${specifier}`);
    };
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    vm.runInContext(
      `(function(require, module, exports) { ${code}\n})`,
      context,
    )(require, module, module.exports);
    return module.exports;
  };
  load(path.resolve("supabase/functions", name, "index.ts"));
  return (req: Request) => handler(req);
}
