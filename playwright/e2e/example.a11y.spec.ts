import { test } from "@playwright/test";
import { setPage, globalVariables, BASE_URL } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { auditPage, reportA11y, writeA11yReport } from "../support/a11y/a11yAudit";

/**
 * Accessibility template spec — the pattern `/audit-a11y` mirrors per page.
 *
 * Fails only on `critical` findings by default; serious/moderate are logged as
 * warnings and written to `docs/reports/a11y/*.json` for the skill to prioritise. That
 * split is deliberate: a suite that goes red on every moderate finding on day
 * one gets disabled by week two, and then nothing is checked at all.
 */
const PAGES_TO_AUDIT: { name: string; url: string }[] = [
  { name: "Home", url: BASE_URL },
  // Add one row per page worth auditing — `/audit-a11y` fills these in from
  // the User Flows documented in the app-domain skill.
];

test.describe("Accessibility audit", () => {
  test.skip(
    !process.env.BASE_URL,
    "Set BASE_URL in .env to run the accessibility audit against a real app",
  );

  test.beforeEach(async ({ page }) => {
    setPage(page);
    page.on("pageerror", () => {});
  });

  // Soft failures only log unless something converts them — see
  // comFunc.assertNoSoftFailures().
  test.afterEach(() => comFunc.assertNoSoftFailures());

  for (const target of PAGES_TO_AUDIT) {
    test(`A11Y-TC01 - ${target.name} page has no critical accessibility violations`, async ({
      page,
    }) => {
      globalVariables.testName = `A11Y-${target.name}`;

      comFunc.reportMessageInfo(`Step 1: Navigate to ${target.url}`);
      await page.goto(target.url, { waitUntil: "domcontentloaded" });

      comFunc.reportMessageInfo("Step 2: Run the structural accessibility sweep");
      const result = await auditPage(page);

      comFunc.reportMessageInfo("Step 3: Report violations and persist the raw result");
      reportA11y(result, ["critical"]);
      const file = writeA11yReport(result);
      comFunc.reportMessageInfo(`A11y result written to ${file}`);
    });
  }
});
