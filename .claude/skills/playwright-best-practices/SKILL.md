---
name: playwright-best-practices
description: Playwright TypeScript test automation standards for PlayWrightAI project — locator strategy, assertion patterns, POM conventions, wait strategies, logging, and anti-patterns. Referenced by generate-tests and review-tests agents.
user-invocable: false
---

# Playwright Best Practices — PlayWrightAI Project

## 1. Project Test Setup

### Config Reference
- **Test directory**: `playwright/e2e/`
- **Base URL**: set via `BASE_URL` env var or `.env`
- **Timeout**: 120s per test, 10s per assertion/action
- **Browser**: Chromium + Chrome channel
- **Parallel**: Disabled (`fullyParallel: false`, 1 worker)
- **Reporter**: Allure + List + LogFileReporter
- **Screenshots**: Only on failure

### File Naming
- Spec files: `playwright/e2e/<feature-name>.spec.ts`
- Page Objects: `playwright/support/pageObjects/<page>-po.ts`
- Test data: `playwright/testdata/<name>.json`

---

## 2. Locator Strategy (Priority Order)

### Priority 1: Element IDs (Most stable for this app)
```typescript
page.locator("#username")
page.locator("#signInBtn")
page.locator("#terms")
```

### Priority 2: Accessibility Roles
```typescript
page.getByRole("button", { name: "Sign In" })
page.getByRole("link", { name: "Checkout" })
```

### Priority 3: Labels and Placeholders
```typescript
page.getByLabel("First Name")
page.getByPlaceholder("email@example.com")
```

### Priority 4: Semantic Text / Has-Text
```typescript
page.locator("button:has-text('Add')")
page.locator("a:has-text('Checkout')")
page.locator("td:has-text('iphone X')")
```

### Priority 5: CSS Classes (Last Resort)
```typescript
page.locator(".card h4")
page.locator(".card-footer button")
```

### NEVER Use
- XPath selectors
- Index-based nth-child without filtering
- `page.waitForTimeout()` — use proper waits

---

## 3. Test Structure — Required Pattern

Every spec MUST follow this structure:

```typescript
import { test } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { myPage } from "../support/pageObjects/myPage-po";
import testData from "../testdata/users.json";

test.describe("<Feature> Tests", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);                              // REQUIRED — always first
    page.on("pageerror", () => {});             // REQUIRED — suppress page errors
    await page.goto("<URL>", { waitUntil: "domcontentloaded" });
  });

  test("TC01 - <action> - <expected result>", async () => {
    comFunc.reportMessageInfo("TC01 - Step 1: <description>");
    await myPage.doAction();
    comFunc.reportMessagePass("TC01 - <action> confirmed ✅");
  });
});
```

---

## 4. Page Object Pattern — Required Structure

```typescript
import { expect } from "@playwright/test";
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class MyPage {
  private page() {
    return globalVariables.page;        // always use globalVariables.page
  }

  // Locators as getter methods
  getSubmitBtn() {
    return this.page().locator("#submit-btn");
  }

  // Actions log with comFunc
  async clickSubmit(): Promise<void> {
    await this.getSubmitBtn().click();
    comFunc.reportMessagePass("MyPage.clickSubmit() - clicked");
  }

  // Assertions with expect
  async verifyVisible(text: string): Promise<void> {
    await expect(this.page().locator(`text=${text}`)).toBeVisible({ timeout: 10_000 });
    comFunc.reportMessagePass(`MyPage.verifyVisible() - "${text}" confirmed ✅`);
  }
}
export const myPage = new MyPage();
```

**POM Rules:**
- One class per page/major section
- Locators as getter methods (not constructor properties)
- Actions always log via `comFunc.reportMessage*`
- Assertions use `expect()` from `@playwright/test`
- No page parameter threading — use `globalVariables.page`

---

## 5. Logging — Required for Every Step

```typescript
comFunc.reportMessageInfo("TC01 - Starting login step");   // neutral info
comFunc.reportMessagePass("TC01 - Login successful ✅");   // step passed
comFunc.reportMessageFail("TC01 - Login failed ❌");       // step failed
comFunc.reportMessageError("TC01 - Unexpected error");     // error
```

**Rule:** Every meaningful action must have a before (INFO) and after (PASS/FAIL) log.

---

## 6. Assertion Patterns

```typescript
// Visibility
await expect(locator).toBeVisible({ timeout: 10_000 });
await expect(locator).not.toBeVisible();

// Text content
await expect(locator).toContainText("expected text");
await expect(locator).toHaveText("exact text");

// URL
await expect(page).toHaveURL(/dashboard/);
await page.waitForURL("**/angularpractice/**", { timeout: 15_000 });

// Count
expect(await locator.count()).toBe(4);
```

---

## 7. Wait Strategy

```typescript
// Wait for navigation
await page.waitForURL("**/dashboard/**", { timeout: 15_000 });
await page.waitForLoadState("domcontentloaded");

// Wait for element
await locator.waitFor({ state: "visible", timeout: 10_000 });

// NEVER use
await page.waitForTimeout(2000); // ❌ arbitrary sleep
```

---

## 8. Adding a New Test — Checklist

- [ ] Test data in `playwright/testdata/*.json`
- [ ] Page Object in `playwright/support/pageObjects/*-po.ts`
- [ ] Spec in `playwright/e2e/*.spec.ts`
- [ ] Project block added to `playwright.config.ts`
- [ ] `setPage(page)` called in `beforeEach`
- [ ] All steps logged with `comFunc`
- [ ] No hardcoded credentials in spec or PO files
- [ ] Test name format: `TC01 - <action> - <expected result>`

---

## 9. Anti-Patterns to Avoid

| Anti-Pattern | Fix |
|-------------|-----|
| `page.waitForTimeout()` | Use `waitForURL`, `waitFor`, or `expect` |
| Hardcoded credentials | Read from `testdata/*.json` |
| Locators in spec files | Move to Page Object |
| No step logging | Add `comFunc.reportMessage*` |
| Missing `setPage(page)` | Always first line in `beforeEach` |
| `page.locator` in Page Object directly | Use `this.page().locator()` |
| Tests dependent on each other | Every test self-contained |
