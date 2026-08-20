import { test, expect } from "@playwright/test";
import { ApiClient } from "../support/api/apiClient";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { globalVariables } from "../support/commonFunctions/globalVariables";

/**
 * API-layer template spec — the pattern `/generate-api-tests` mirrors.
 *
 * This is the tier `test-strategy` has always assigned work to and nothing
 * ever implemented. Rules that live here, not at E2E:
 *   - field validation and error codes
 *   - authz (does a role get 403, not "is the button hidden")
 *   - contract shape and response-time budgets
 *
 * Skips itself unless API_BASE_URL (or BASE_URL) is set, so a fresh clone of
 * the template never fails on a placeholder host.
 */
const API_BASE = process.env.API_BASE_URL ?? process.env.BASE_URL;

test.describe("API — example contract checks", () => {
  test.skip(!API_BASE, "Set API_BASE_URL (or BASE_URL) in .env to run API-layer tests");

  let api: ApiClient;

  test.beforeEach(async () => {
    // test.info() gives the title without taking a fixture argument, which
    // Playwright requires to be a destructuring pattern.
    globalVariables.testName = test.info().title;
    api = await ApiClient.create();
  });

  test.afterEach(async () => {
    await api.dispose();
  });

  test("API-TC01 - Health endpoint responds 200 within budget", async () => {
    comFunc.reportMessageInfo("API-TC01 - Step 1: GET the health endpoint");
    const started = Date.now();
    const response = await api.get("/");

    comFunc.reportMessageInfo("API-TC01 - Step 2: Assert status and latency budget");
    await api.expectStatus(response, 200);
    api.assertUnder("Health endpoint", Date.now() - started, 3_000);
  });

  // ─── Regression-only (skipped when SMOKE=true) ────────────────────────────
  if (!process.env.SMOKE) {
    test("API-TC02 - Unknown resource returns 404, not 500", async () => {
      comFunc.reportMessageInfo("API-TC02 - Request a resource that cannot exist");
      const response = await api.get("/this-path-does-not-exist-9f3a");

      comFunc.reportMessageInfo("API-TC02 - Assert a clean 4xx, never a server error");
      expect(response.status(), "Unknown resource must not 5xx").toBeLessThan(500);
      comFunc.reportMessagePass(`Unknown resource returned ${response.status()}`);
    });
  }
});
