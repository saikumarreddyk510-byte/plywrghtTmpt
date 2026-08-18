import "dotenv/config"; // loads .env into process.env — must run before anything below reads it
import { defineConfig, devices } from "@playwright/test";
import { allureResultsDir } from "./playwright/support/allureRunContext";

/**
 * Playwright config for SauceLabs execution.
 *
 * Differences from playwright.config.ts:
 *   - video: "on"  (Sauce collects recordings)
 *   - screenshot: "on"
 *   - workers / shard settings controlled by saucectl
 *   - baseURL sourced from SAUCE_BASE_URL env var injected by Sauce
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
    baseURL: process.env.SAUCE_BASE_URL ?? process.env.BASE_URL ?? "https://your-app.example.com",
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 10_000,
    navigationTimeout: 120_000,
    bypassCSP: true,
    screenshot: "on",
    video: "on",
    trace: "on",
  },
  projects: [
    {
      name: "chromium",
      testMatch: /example\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--disable-web-security"] },
      },
    },
  ],
});
