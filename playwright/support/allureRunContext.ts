import * as path from "path";

/**
 * Shared Allure run context.
 *
 * Computes a unique runId and timestamp once per process and caches them
 * in process.env so config, reporters, globalTeardown, and worker processes
 * all resolve the same folder names within a single run.
 */

function ensureEnv(key: string, factory: () => string): string {
  if (!process.env[key]) {
    process.env[key] = factory();
  }
  return process.env[key] as string;
}

export const runId = ensureEnv("PW_ALLURE_RUN_ID", () => `${process.pid}-${Date.now()}`);

export const timestamp = ensureEnv("PW_ALLURE_TS", () => {
  const now = new Date();
  return (
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}_` +
    `${String(now.getHours()).padStart(2, "0")}-` +
    `${String(now.getMinutes()).padStart(2, "0")}-` +
    `${String(now.getSeconds()).padStart(2, "0")}`
  );
});

// Isolated allure-results dir at the repo root (written by allure-playwright).
export const allureResultsDir = `allure-results-${runId}`;

// Spec / suite name used for the C:\LogFolder subfolder.
// Override by setting PW_SPEC_NAME=<your-suite-name> before running.
export const specName = ensureEnv("PW_SPEC_NAME", () => "example");

// Full log folder path: C:\LogFolder\<specName>_<timestamp>_<runId>
export const logFolder = path.join("C:\\LogFolder", `${specName}_${timestamp}_${runId}`);
