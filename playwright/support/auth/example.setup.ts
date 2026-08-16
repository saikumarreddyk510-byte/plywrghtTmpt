import { test as setup, expect, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { globalVariables, BASE_URL } from "../commonFunctions/globalVariables";
import { exampleAuthFile } from "./authPaths";

setup.setTimeout(180_000);

/**
 * example.setup.ts — captures and persists a storageState for authenticated tests.
 *
 * Pattern used across all slices in this project:
 *   1. Navigate to the app.
 *   2. Perform SSO / form login.
 *   3. Verify the post-login indicator is visible.
 *   4. Write context.storageState() to playwright/.auth/<name>.json.
 *
 * The storageState is then referenced via use.storageState in playwright.config.ts
 * so each test starts already authenticated without re-running the login flow.
 */

async function authenticate(page: Page, context: BrowserContext): Promise<void> {
  const username = globalVariables.credentials.userId;
  const password = globalVariables.credentials.password;

  await page.goto(BASE_URL);

  // ── Replace the selectors below with your application's login flow ────────
  await page.locator("#login-btn").waitFor({ state: "attached", timeout: 60_000 });
  await page.locator("#login-btn").click();
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.locator("#submit-btn").click();
  await expect(page.locator("#logout-btn")).toBeVisible({ timeout: 20_000 });
  // ──────────────────────────────────────────────────────────────────────────

  fs.mkdirSync(path.dirname(exampleAuthFile), { recursive: true });
  await context.storageState({ path: exampleAuthFile });
  console.log(`storageState saved to: ${exampleAuthFile}`);
}

setup("authenticate example user", async ({ page, context }) => {
  await authenticate(page, context);
});
