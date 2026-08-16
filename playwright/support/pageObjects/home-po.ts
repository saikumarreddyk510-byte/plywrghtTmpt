import { comFunc } from "../commonFunctions/commonFunctions";
import { globalVariables } from "../commonFunctions/globalVariables";

/**
 * HomePage — locators and navigation actions for the application home page.
 *
 * Replace selector strings with your application's actual element IDs/roles.
 * Page objects read globalVariables.page so no page parameter is needed at call sites.
 */
export class HomePage {
  private page() {
    return globalVariables.page;
  }

  getTitle() {
    return this.page().title();
  }

  getLoginBtn() {
    return this.page().locator("#login-btn");
  }

  getLogoutBtn() {
    return this.page().locator("#logout-btn");
  }

  async navigateToHome(): Promise<void> {
    await this.page().goto(globalVariables.homeURL, { waitUntil: "domcontentloaded" });
    comFunc.reportMessagePass("HomePage.navigateToHome() - Navigated to home page.");
  }

  async isLoggedIn(): Promise<boolean> {
    return this.getLogoutBtn()
      .isVisible()
      .catch(() => false);
  }
}

export const homePage = new HomePage();
