---
applyTo: "playwright/support/pageObjects/**/*.ts"
---

# Page Object conventions

Full standard: `.claude/skills/playwright-best-practices/SKILL.md` §4 — this
is the auto-applied summary for files matching this path.

```typescript
import { expect } from "@playwright/test";
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class MyPage {
  private page() {
    return globalVariables.page; // always use globalVariables.page, never a page param
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

## Locator priority (highest to lowest)
1. Element IDs — `page.locator("#login-btn")`
2. Accessibility roles — `page.getByRole("button", { name: "Sign In" })`
3. Labels / placeholders — `page.getByLabel("Email")`
4. Semantic text / has-text — `page.locator("button:has-text('Add')")`
5. CSS classes — last resort, e.g. `page.locator(".card h4")`

Never: XPath, index-based `nth-child()` without a filter, or a locator that's
weaker than what the element actually supports (e.g. text-matching an element
that has a stable `id`).

## Rules
- One class per page/major section; locators as getter methods, not
  constructor properties.
- Actions always log via `comFunc.reportMessage*`.
- No page parameter threading — use `globalVariables.page` via `this.page()`.
- If this file was touched by `/heal-test`, the healed locator must still
  respect the priority order above and must have a matching row in
  `docs/reports/healing-log.md` — a heal relocates the element, it never downgrades
  locator quality.
