import { test } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { loginPractisePage } from "../support/pageObjects/loginPractise-po";
import { productsPage } from "../support/pageObjects/products-po";
import userData from "../testdata/users.json";

const URL = "https://rahulshettyacademy.com/loginpagePractise/";
const { username, password, product } = userData.loginPagePractise;

test.describe("Shopping Cart - iphone X", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);
    page.on("pageerror", () => {});
    comFunc.reportMessageInfo("Navigating to login page");
    await page.goto(URL, { waitUntil: "domcontentloaded" });
  });

  test("TC01 - Login, add iphone X to cart and confirm", async () => {
    // Step 1: Login
    comFunc.reportMessageInfo("TC01 - Step 1: Logging in");
    await loginPractisePage.login(username, password);

    // Step 2: Add product to cart
    comFunc.reportMessageInfo(`TC01 - Step 2: Adding "${product}" to cart`);
    await productsPage.addProductToCart(product);

    // Step 3: Navigate to cart
    comFunc.reportMessageInfo("TC01 - Step 3: Navigating to cart");
    await productsPage.navigateToCart();

    // Step 4: Confirm product in cart
    comFunc.reportMessageInfo(`TC01 - Step 4: Confirming "${product}" is in cart`);
    await productsPage.confirmProductInCart(product);
  });
});
