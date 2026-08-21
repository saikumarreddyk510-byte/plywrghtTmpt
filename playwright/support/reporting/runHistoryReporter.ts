import type { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import { runId, timestamp } from "./allureRunContext";

/**
 * Run-history reporter — the memory the AI pipeline runs on.
 *
 * Appends one JSON line per test attempt to `.test-history/runs.jsonl`, so
 * skills that reason about the suite *over time* have real data instead of a
 * single run's snapshot:
 *   - `/detect-flaky`  — same test, same code, different outcome across runs
 *   - `/run-report`    — what changed since the last run, trend over time
 *
 * Format is JSON Lines (one self-contained object per line) on purpose:
 * append-only, never rewritten, safe to `tail`, and mergeable with
 * `merge=union` (see `.gitattributes`) when two branches both add runs.
 */

export const historyDir = ".test-history";
export const historyFile = path.join(historyDir, "runs.jsonl");

/** Coarse failure class — the buckets failure diagnosis routes on. */
export type FailureClass =
  "locator" | "assertion" | "navigation" | "network" | "timeout" | "setup" | "unknown";

export interface TestHistoryRecord {
  runId: string;
  startedAt: string;
  ci: boolean;
  branch: string;
  project: string;
  file: string;
  title: string;
  /** TC-IDs parsed out of the test title, e.g. ["TC-001"]. */
  tcIds: string[];
  status: TestResult["status"];
  /** Playwright's verdict for the whole test: expected | unexpected | flaky | skipped. */
  outcome: ReturnType<TestCase["outcome"]>;
  retry: number;
  durationMs: number;
  failureClass?: FailureClass;
  errorExcerpt?: string;
}

/**
 * Buckets an error message into the class `/heal-test` and `/detect-flaky`
 * route on. Deterministic and cheap — the AI skills refine it, they don't
 * have to derive it from scratch.
 */
export function classifyFailure(message: string): FailureClass {
  const m = message.toLowerCase();

  // Order matters here. A failed assertion quotes the locator call log in its
  // message, so a naive "waiting for locator" check misfiles every assertion
  // failure as selector rot — and then routes it to heal-test, which is exactly
  // the wrong fix. The distinction heal-test itself draws is whether the element
  // was *found*: resolved-but-wrong-value is an assertion failure, never rot.
  if (m.includes("resolved to") || m.includes("unexpected value")) {
    return "assertion";
  }
  if (
    m.includes("strict mode violation") ||
    m.includes("waiting for locator") ||
    m.includes("element is not attached")
  ) {
    return "locator";
  }
  if (
    m.includes("expect(") ||
    m.includes("tohavetext") ||
    m.includes("tobevisible") ||
    m.includes("expected pattern")
  ) {
    return "assertion";
  }
  if (
    m.includes("err_") ||
    m.includes("net::") ||
    m.includes("econnrefused") ||
    m.includes("socket hang up")
  ) {
    return "network";
  }
  if (m.includes("page.goto") || m.includes("waitforurl") || m.includes("navigation")) {
    return "navigation";
  }
  if (m.includes("timeout") && m.includes("exceeded")) {
    return "timeout";
  }
  if (m.includes("beforeeach") || m.includes("beforeall") || m.includes("storagestate")) {
    return "setup";
  }
  return "unknown";
}

const TC_ID = /TC-\d{3}/g;

class RunHistoryReporter implements Reporter {
  private readonly records: TestHistoryRecord[] = [];
  private readonly startedAt = new Date().toISOString();
  private readonly branch =
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || process.env.PW_BRANCH || "local";

  onTestEnd(test: TestCase, result: TestResult) {
    const message = [result.error?.message, ...result.errors.map((e) => e.message)]
      .filter(Boolean)
      .join(" | ");

    this.records.push({
      runId,
      startedAt: this.startedAt,
      ci: Boolean(process.env.CI),
      branch: this.branch,
      project: test.parent.project()?.name ?? "unknown",
      file: path.relative(process.cwd(), test.location.file).split(path.sep).join("/"),
      title: test.title,
      tcIds: test.title.match(TC_ID) ?? [],
      status: result.status,
      outcome: test.outcome(),
      retry: result.retry,
      durationMs: result.duration,
      ...(message
        ? { failureClass: classifyFailure(message), errorExcerpt: message.slice(0, 400) }
        : {}),
    });
  }

  async onEnd(result: FullResult) {
    if (this.records.length === 0) return;
    try {
      fs.mkdirSync(historyDir, { recursive: true });
      const lines = this.records.map((r) => JSON.stringify(r)).join("\n");
      fs.appendFileSync(historyFile, `${lines}\n`, "utf8");
      console.log(
        `Run history: +${this.records.length} record(s) → ${historyFile} ` +
          `(run ${runId} @ ${timestamp}, status ${result.status})`,
      );
    } catch (error) {
      // Never fail a run because bookkeeping failed.
      console.error("RunHistoryReporter: error writing run history:", error);
    }
  }
}

export default RunHistoryReporter;
