import { test } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { clientLoginPage } from "../support/pageObjects/clientLogin-po";
import userData from "../testdata/users.json";

const URL = "https://rahulshettyacademy.com/client/#/auth/login";
const { email, password } = userData.loginUser;
const { email: invalidEmail, password: invalidPassword } = userData.invalidUser;

test.describe("Client App Login", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);
    page.on("pageerror", () => {});
    comFunc.reportMessageInfo("Navigating to login page");
    await page.goto(URL, { waitUntil: "domcontentloaded" });
  });

  test("TC001 - Valid credentials - redirects to dashboard", async () => {
    comFunc.reportMessageInfo("TC001 - Step 1: Logging in with valid credentials");
    await clientLoginPage.login(email, password);

    comFunc.reportMessageInfo("TC001 - Step 2: Confirming redirect to dashboard");
    await clientLoginPage.verifyOnDashboard();
  });

  test("TC301 - Invalid credentials - shows error and stays on login page", async () => {
    comFunc.reportMessageInfo("TC301 - Step 1: Logging in with invalid credentials");
    await clientLoginPage.login(invalidEmail, invalidPassword);

    comFunc.reportMessageInfo("TC301 - Step 2: Confirming error toast");
    await clientLoginPage.verifyLoginError("Incorrect email or password.");

    comFunc.reportMessageInfo("TC301 - Step 3: Confirming no navigation away from login");
    await clientLoginPage.verifyStillOnLoginPage();
  });
});
