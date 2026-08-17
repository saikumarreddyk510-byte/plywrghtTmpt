import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class LoginPractisePage {
  private page() {
    return globalVariables.page;
  }

  getUsernameInput() {
    return this.page().locator("#username");
  }

  getPasswordInput() {
    return this.page().locator("#password");
  }

  getTermsCheckbox() {
    return this.page().locator("#terms");
  }

  getSignInBtn() {
    return this.page().locator("#signInBtn");
  }

  async login(username: string, password: string): Promise<void> {
    await this.getUsernameInput().fill(username);
    await this.getPasswordInput().fill(password);
    await this.getTermsCheckbox().click();
    await this.getSignInBtn().click();
    await this.page().waitForURL("**/angularpractice/**", { timeout: 15_000 });
    comFunc.reportMessagePass(`LoginPractisePage.login() - Logged in as ${username}`);
  }
}

export const loginPractisePage = new LoginPractisePage();
