import { comFunc } from "./commonFunctions";
import { globalVariables, resetGlobalVariables, BASE_URL } from "./globalVariables";

export class LoginLogout {
  /**
   * Common beforeEach setup: sets cookie banner, resets runtime state, clears localStorage.
   */
  async setupBeforeEach(suiteName: string): Promise<void> {
    try {
      globalVariables.page.once("pageerror", () => {});
      await this.setCookieBanner();
      resetGlobalVariables();
      await globalVariables.page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await globalVariables.page.evaluate(() => localStorage.clear());
    } catch (error) {
      comFunc.reportMessageInfo(`${suiteName}: beforeEach setup error — ${error}`);
    }
  }

  /** Dismisses the cookie-consent banner if present. */
  async setCookieBanner(): Promise<void> {
    globalVariables.page.on("dialog", async (dialog) => dialog.accept());
    await globalVariables.page
      .context()
      .addCookies([{ name: "cookie_banner", value: "closed", url: BASE_URL }]);
  }

  /**
   * Performs SSO/form login. Adapt to your application's login mechanism.
   * If the page is already authenticated (storageState reused), skips login.
   */
  async login(username: string, password: string): Promise<void> {
    const page = globalVariables.page;
    const userHomeUrl = `${BASE_URL}/home`;

    await page.goto(userHomeUrl, { waitUntil: "domcontentloaded" });
    const logoutVisible = await page
      .locator("#logout-btn")
      .isVisible()
      .catch(() => false);

    if (logoutVisible) {
      comFunc.reportMessageInfo("LoginLogout.login() - Already authenticated, skipping login.");
      return;
    }

    // ── Adapt the selectors below to match your application ──────────────────
    await page.locator("#login-btn").waitFor({ state: "attached", timeout: 30_000 });
    await page.locator("#login-btn").click();
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await page.locator("#submit-btn").click();
    await page.locator("#logout-btn").waitFor({ state: "visible", timeout: 20_000 });
    // ─────────────────────────────────────────────────────────────────────────

    comFunc.reportMessagePass("LoginLogout.login() - Login successful.");
  }

  async logout(): Promise<void> {
    const page = globalVariables.page;
    await page.locator("#logout-btn").waitFor({ state: "visible" });
    await page.locator("#logout-btn").click();
    await page.locator("#login-btn").waitFor({ state: "visible" });
    comFunc.reportMessagePass("LoginLogout.logout() - Logged out successfully.");
  }
}

export const loginLogout = new LoginLogout();
