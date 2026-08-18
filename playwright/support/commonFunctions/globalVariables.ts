import type { Page } from "@playwright/test";

/**
 * Single canonical base URL for the test environment.
 * Override at runtime via the BASE_URL environment variable.
 */
export const BASE_URL = process.env.BASE_URL ?? "https://your-app.example.com";

/**
 * Shared Playwright Page handle.
 *
 * Page objects use globalVariables.page rather than accepting a page
 * parameter so they can be called without threading page through every call
 * site — matching how Cypress test code is written.
 *
 * IMPORTANT: safe only when fullyParallel = false (one worker at a time).
 * Set via setPage(page) in each test's beforeEach.
 */
export function setPage(page: Page): void {
  globalVariables.page = page;
}

export const globalVariables = {
  // ─── Run state ────────────────────────────────────────────────────────────
  testName: "",
  scriptFailed: false,
  errorMessage: "",
  scenario: "",
  scenarioDescription: "",

  // ─── Feature flags ────────────────────────────────────────────────────────
  isValidationOn: true,
  isTestDataGeneration: false,

  // ─── Playwright page handle (set in beforeEach via setPage()) ─────────────
  page: undefined as unknown as Page,

  // ─── Application URLs (all derived from BASE_URL) ─────────────────────────
  homeURL: `${BASE_URL}`,

  // ─── Credentials (sourced from env vars — never hardcode secrets) ─────────
  credentials: {
    userId: process.env.APP_USER ?? "",
    password: process.env.APP_PASSWORD ?? "",
  },

  // ─── Runtime data (per-test transient state) ──────────────────────────────
  runtimeData: {} as any,
};

/**
 * Resets per-test run state to initial values.
 * Call this in beforeEach (or via loginLogout.setupBeforeEach).
 */
export function resetGlobalVariables(): void {
  globalVariables.testName = "";
  globalVariables.scriptFailed = false;
  globalVariables.errorMessage = "";
  globalVariables.scenario = "";
  globalVariables.scenarioDescription = "";
  globalVariables.isValidationOn = true;
  globalVariables.isTestDataGeneration = false;
  globalVariables.runtimeData = {};
}
