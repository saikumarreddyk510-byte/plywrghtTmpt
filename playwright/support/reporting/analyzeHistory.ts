/**
 * analyzeHistory — turns `.test-history/runs.jsonl` into per-test statistics.
 *
 * Deterministic on purpose. The `/detect-flaky` and `/run-report` skills call
 * this instead of reading raw JSONL themselves: the arithmetic (flip rate, pass
 * rate, duration spread) is not a judgement call, and doing it in code keeps
 * those skills cheap and their conclusions reproducible. The AI's job starts
 * where this output ends — hypothesising *why* a test flips, and what to do.
 *
 * Run it directly:
 *   npm run history:analyze            # table for the last 20 runs
 *   npm run history:analyze -- --json  # machine-readable, for a skill to read
 *   npm run history:analyze -- --runs 50 --min-runs 3
 */
import * as fs from "fs";
import type { TestHistoryRecord, FailureClass } from "./runHistoryReporter";
import { historyFile } from "./runHistoryReporter";

export interface TestStats {
  key: string;
  file: string;
  project: string;
  title: string;
  tcIds: string[];
  runs: number;
  passed: number;
  failed: number;
  skipped: number;
  /** Playwright marked it flaky within a single run (passed on retry). */
  flakyRuns: number;
  /** Share of runs that passed, 0–1. */
  passRate: number;
  /**
   * How often the outcome changed between consecutive runs, 0–1.
   * This is the real flakiness signal: a test that fails every time is broken,
   * not flaky, and needs a different fix.
   */
  flipRate: number;
  avgDurationMs: number;
  maxDurationMs: number;
  /** Most common failure class across failing runs. */
  dominantFailureClass?: FailureClass;
  lastStatus: string;
  lastErrorExcerpt?: string;
  verdict: "stable" | "flaky" | "consistently-failing" | "insufficient-data";
}

export interface HistorySummary {
  historyFile: string;
  totalRecords: number;
  runsAnalyzed: number;
  generatedAt: string;
  tests: TestStats[];
  flaky: TestStats[];
  consistentlyFailing: TestStats[];
}

export function readHistory(file: string = historyFile): TestHistoryRecord[] {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line) as TestHistoryRecord;
      } catch {
        return null;
      }
    })
    .filter((r): r is TestHistoryRecord => r !== null);
}

export interface AnalyzeOptions {
  /** Only consider the N most recent runs. */
  runs?: number;
  /** Ignore tests seen fewer than this many times — too little data to judge. */
  minRuns?: number;
  file?: string;
}

export function analyzeHistory(options: AnalyzeOptions = {}): HistorySummary {
  const { runs = 20, minRuns = 2, file = historyFile } = options;
  const all = readHistory(file);

  // Keep only the most recent `runs` runIds, in the order they first appear.
  const runIds = [...new Set(all.map((r) => r.runId))];
  const keep = new Set(runIds.slice(-runs));
  const records = all.filter((r) => keep.has(r.runId) && r.retry === 0);

  const byTest = new Map<string, TestHistoryRecord[]>();
  for (const r of records) {
    const key = `${r.project} :: ${r.file} :: ${r.title}`;
    const list = byTest.get(key);
    if (list) list.push(r);
    else byTest.set(key, [r]);
  }

  const tests: TestStats[] = [];
  byTest.forEach((list, key) => {
    const passed = list.filter((r) => r.status === "passed").length;
    const skipped = list.filter((r) => r.status === "skipped").length;
    const failed = list.length - passed - skipped;
    const flakyRuns = list.filter((r) => r.outcome === "flaky").length;

    let flips = 0;
    for (let i = 1; i < list.length; i += 1) {
      if (list[i].status !== list[i - 1].status) flips += 1;
    }

    const failureClasses = new Map<FailureClass, number>();
    list.forEach((r) => {
      if (r.failureClass) {
        failureClasses.set(r.failureClass, (failureClasses.get(r.failureClass) ?? 0) + 1);
      }
    });
    const dominantFailureClass = [...failureClasses.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    const durations = list.map((r) => r.durationMs);
    const last = list[list.length - 1];
    const graded = list.length - skipped;
    const passRate = graded > 0 ? passed / graded : 0;
    const flipRate = list.length > 1 ? flips / (list.length - 1) : 0;

    let verdict: TestStats["verdict"];
    if (list.length < minRuns) verdict = "insufficient-data";
    else if (flakyRuns > 0 || (flips > 0 && passed > 0 && failed > 0)) verdict = "flaky";
    else if (graded > 0 && passed === 0) verdict = "consistently-failing";
    else verdict = "stable";

    tests.push({
      key,
      file: last.file,
      project: last.project,
      title: last.title,
      tcIds: last.tcIds,
      runs: list.length,
      passed,
      failed,
      skipped,
      flakyRuns,
      passRate: Number(passRate.toFixed(3)),
      flipRate: Number(flipRate.toFixed(3)),
      avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / (durations.length || 1)),
      maxDurationMs: Math.max(...durations, 0),
      ...(dominantFailureClass ? { dominantFailureClass } : {}),
      lastStatus: last.status,
      ...(last.errorExcerpt ? { lastErrorExcerpt: last.errorExcerpt } : {}),
      verdict,
    });
  });

  tests.sort((a, b) => b.flipRate - a.flipRate || a.passRate - b.passRate);

  return {
    historyFile: file,
    totalRecords: all.length,
    runsAnalyzed: Math.min(runs, runIds.length),
    generatedAt: new Date().toISOString(),
    tests,
    flaky: tests.filter((t) => t.verdict === "flaky"),
    consistentlyFailing: tests.filter((t) => t.verdict === "consistently-failing"),
  };
}

function formatTable(summary: HistorySummary): string {
  if (summary.tests.length === 0) {
    return (
      `No run history yet (${summary.historyFile}).\n` +
      "Run the suite at least twice — RunHistoryReporter appends a record per test per run."
    );
  }
  const rows = summary.tests.map((t) => [
    t.verdict.padEnd(21),
    `${t.passed}/${t.runs}`.padEnd(7),
    `flip ${(t.flipRate * 100).toFixed(0)}%`.padEnd(10),
    `${(t.avgDurationMs / 1000).toFixed(1)}s`.padEnd(7),
    (t.dominantFailureClass ?? "-").padEnd(10),
    `${t.project} > ${t.title}`,
  ]);
  return [
    `Run history: ${summary.totalRecords} records, last ${summary.runsAnalyzed} run(s)`,
    "",
    [
      "verdict".padEnd(21),
      "pass".padEnd(7),
      "flips".padEnd(10),
      "avg".padEnd(7),
      "class".padEnd(10),
      "test",
    ].join(" "),
    "-".repeat(100),
    ...rows.map((r) => r.join(" ")),
    "",
    `Flaky: ${summary.flaky.length} | Consistently failing: ${summary.consistentlyFailing.length}`,
  ].join("\n");
}

// ─── CLI ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = (name: string) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const summary = analyzeHistory({
    runs: Number(flag("runs") ?? 20),
    minRuns: Number(flag("min-runs") ?? 2),
    ...(flag("file") ? { file: flag("file") as string } : {}),
  });
  console.log(argv.includes("--json") ? JSON.stringify(summary, null, 2) : formatTable(summary));
}
