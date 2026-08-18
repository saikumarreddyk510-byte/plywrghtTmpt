import "dotenv/config"; // loads .env into process.env — must run before anything below reads it
import { defineConfig, devices } from "@playwright/test";
import { allureResultsDir } from "./playwright/support/allureRunContext";

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
  globalTeardown: "./playwright/support/globalTeardown.ts",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [
    ["list"],
    ["allure-playwright", { resultsDir: allureResultsDir }],
    ["./playwright/support/logFileReporter.ts"],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "https://your-app.example.com",
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
