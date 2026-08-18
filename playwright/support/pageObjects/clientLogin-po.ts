import { expect } from "@playwright/test";
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class ClientLoginPage {
  private page() {
    return globalVariables.page;
  }

  getEmailInput() {
    return this.page().locator("#userEmail");
  }

  getPasswordInput() {
    return this.page().locator("#userPassword");
  }

  getLoginButton() {
    return this.page().locator("#login");
  }

  getToastMessage() {
    return this.page().locator(".toast-message");
  }

  async login(email: string, password: string): Promise<void> {
    await this.getEmailInput().fill(email);
    await this.getPasswordInput().fill(password);
    await this.getLoginButton().click();
    comFunc.reportMessagePass(`ClientLoginPage.login() - Submitted login for "${email}"`);
  }

  async verifyOnDashboard(): Promise<void> {
    await this.page().waitForURL("**/dashboard/dash", { timeout: 15_000 });
    await expect(this.page()).toHaveURL(/dashboard\/dash/, { timeout: 5_000 });
    comFunc.reportMessagePass("ClientLoginPage.verifyOnDashboard() - Redirected to dashboard ✅");
  }

  async verifyLoginError(expectedText: string): Promise<void> {
    await expect(this.getToastMessage()).toBeVisible({ timeout: 10_000 });
    await expect(this.getToastMessage()).toContainText(expectedText);
    comFunc.reportMessagePass(`ClientLoginPage.verifyLoginError() - Toast "${expectedText}" confirmed ✅`);
  }

  async verifyStillOnLoginPage(): Promise<void> {
    await expect(this.page()).toHaveURL(/auth\/login/, { timeout: 10_000 });
    comFunc.reportMessagePass("ClientLoginPage.verifyStillOnLoginPage() - No navigation away confirmed ✅");
  }
}

export const clientLoginPage = new ClientLoginPage();
