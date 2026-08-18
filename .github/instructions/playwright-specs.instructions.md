---
applyTo: "playwright/e2e/**/*.spec.ts"
---

# Spec file conventions

Full standard: `.claude/skills/playwright-best-practices/SKILL.md` §3 — this
is the auto-applied summary for files matching this path.

Every spec follows this shape:

```typescript
import { test } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { myPage } from "../support/pageObjects/myPage-po";
import testData from "../testdata/users.json";

test.describe("<Feature> Tests", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page); // REQUIRED — always first
    page.on("pageerror", () => {}); // REQUIRED — suppress page errors
    await page.goto("<URL>", { waitUntil: "domcontentloaded" });
  });

  test("TC01 - <action> - <expected result>", async () => {
    comFunc.reportMessageInfo("TC01 - Step 1: <description>");
    await myPage.doAction();
    comFunc.reportMessagePass("TC01 - <action> confirmed ✅");
  });
});
```

- No `page.locator()` calls directly in a spec — that belongs in a Page
  Object (see `page-objects.instructions.md`).
- No `page.waitForTimeout()` — use `waitForURL`, `.waitFor()`, or
  `await expect(...)`.
- All test data from `playwright/testdata/*.json` — never hardcode
  credentials or inputs.
- Every meaningful action gets a before (`reportMessageInfo`) and after
  (`reportMessagePass`/`Fail`) log line.
- New spec → add a matching project block in `playwright.config.ts`
  (`testMatch` pointing at the file).
- Test name format: `TC01 - <action> - <expected result>`.
