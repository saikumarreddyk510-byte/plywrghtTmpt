import { test, expect } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { loginLogout } from "../support/commonFunctions/loginLogout";
import { homePage } from "../support/pageObjects/home-po";
import { comFunc } from "../support/commonFunctions/commonFunctions";

/**
 * Example test suite — smoke + regression structure.
 *
 * Smoke tests (always run):  listed directly in the describe block.
 * Regression-only tests:     wrapped in `if (!process.env.SMOKE)`.
 *
 * Run smoke only:    SMOKE=true npx playwright test
 * Run all:           npx playwright test
 */
test.describe("Example test suite", () => {
  // Without BASE_URL there is nothing to point at but the placeholder host,
  // which does not resolve - the suite would go red for a configuration gap
  // rather than a defect, and a suite that is red for that reason teaches
  // people to ignore red. Same guard example.api.spec.ts and
  // example.a11y.spec.ts already use.
  test.skip(
    !process.env.BASE_URL,
    "Set BASE_URL in .env (or as a CI secret) to run the example suite",
  );

  test.beforeEach(async ({ page }) => {
    setPage(page);
    page.on("pageerror", () => {});
    await loginLogout.setupBeforeEach("Example");
  });

  // ─── Smoke tests (always run) ─────────────────────────────────────────────
  test("EXAMPLE-TC01 - Home page loads successfully", async ({ page }) => {
    comFunc.reportMessageInfo("Starting TC01 - home page load check");

    await page.goto(page.context().browser()?.contexts()[0]?.pages()[0]?.url() ?? "/");
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();

    comFunc.reportMessagePass(`TC01 - Page title: "${title}"`);
  });

  // ─── Regression tests (skipped when SMOKE=true) ───────────────────────────
  if (!process.env.SMOKE) {
    test("EXAMPLE-TC02 - Regression scenario placeholder", async () => {
      comFunc.reportMessageInfo("Starting TC02 - regression placeholder");
      // Add your regression test steps here.
      expect(true).toBe(true);
      comFunc.reportMessagePass("TC02 - Passed placeholder assertion");
    });
  }
});
