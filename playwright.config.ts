import "dotenv/config"; // loads .env into process.env — must run before anything below reads it
import { defineConfig, devices } from "@playwright/test";
import { allureResultsDir } from "./playwright/support/reporting/allureRunContext";

/**
 * Playwright configuration template.
 *
 * Key settings carried over from the source project:
 *   - viewport 1920x1080
 *   - actionTimeout / expect timeout 10 000 ms
 *   - navigationTimeout 120 000 ms
 *   - bypassCSP + --disable-web-security
 *   - Allure isolated per-run results dir
 *   - LogFileReporter → C:\LogFolder\<specName>_<ts>_<runId>\out.txt
 *   - RunHistoryReporter appends per-test outcomes to .test-history/runs.jsonl,
 *     which is what /detect-flaky and /run-report reason over across runs
 *   - globalTeardown generates the Allure HTML report
 *   - trace: retain-on-failure — gives the `heal-test` skill (and CI failure
 *     triage later) the exact DOM at the moment of failure without having to
 *     re-navigate the live app to reproduce it
 *
 * Add a project block per authenticated slice following the
 * <slice>-setup / <slice> pattern. Auth storageState files live in
 * playwright/.auth/ (git-ignored).
 */
export default defineConfig({
  testDir: "playwright/e2e",
  globalTeardown: "./playwright/support/reporting/globalTeardown.ts",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [
    ["list"],
    // Self-contained HTML report at playwright-report/ — no Java, no external
    // tooling, traces embedded. This is the artifact CI uploads and the one to
    // open first; Allure below stays the richer project-standard report.
    // open: "never" so a local failing run never hijacks a browser window.
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["allure-playwright", { resultsDir: allureResultsDir }],
    ["./playwright/support/reporting/logFileReporter.ts"],
    ["./playwright/support/reporting/runHistoryReporter.ts"],
  ],
  use: {
    // NOTE: `||`, not `??`. An unset GitHub Actions secret arrives as an empty
    // string, which `??` would happily pass through as baseURL: "" — making
    // every relative goto("/") fail with "Invalid URL" in CI.
    baseURL: process.env.BASE_URL || "https://your-app.example.com",
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 10_000,
    navigationTimeout: 120_000,
    bypassCSP: true,
    screenshot: "only-on-failure",
    video: "off",
    trace: "retain-on-failure",
  },
  projects: [
    // ─── Unauthenticated project ───────────────────────────────────────────
    {
      // Runs specs that do not require a login (public pages, API smoke checks).
      name: "chromium",
      testMatch: /example\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--disable-web-security"] },
      },
    },

    // ─── Client App login tests ─────────────────────────────────────────────
    {
      name: "client-login",
      testMatch: /clientLogin\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--disable-web-security"] },
      },
    },

    // ─── AACargo Facilities tests ────────────────────────────────────────────
    {
      name: "facilities",
      testMatch: /facilities\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--disable-web-security"] },
      },
    },

    // ─── API layer (test-strategy's API/Integration assignments) ────────────
    {
      // Skips itself unless API_BASE_URL / BASE_URL is set — see the spec.
      name: "api",
      testDir: "playwright/api",
      testMatch: /.*\.api\.spec\.ts/,
      use: {}, // no browser needed: ApiClient uses Playwright's request context
    },

    // ─── Accessibility audits ───────────────────────────────────────────────
    {
      name: "a11y",
      testMatch: /.*\.a11y\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--disable-web-security"] },
      },
    },

    // Duplicate the block above for each new unauthenticated spec group, and
    // the commented pair below for each slice that needs its own login session.
    //
    // {
    //   name: "my-slice-setup",
    //   testDir: "playwright/support/auth",
    //   testMatch: /my-slice\.setup\.ts/,
    //   timeout: 180_000,
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
    // {
    //   name: "my-slice",
    //   testMatch: /my-slice\.spec\.ts/,
    //   dependencies: ["my-slice-setup"],
    //   timeout: 180_000,
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     channel: "chrome",
    //     storageState: mySliceAuthFile,   // from playwright/support/auth/authPaths.ts
    //     launchOptions: { args: ["--disable-web-security"] },
    //   },
    // },
  ],
});
