import { expect } from "@playwright/test";
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class ProductsPage {
  private page() {
    return globalVariables.page;
  }

  getProductCards() {
    return this.page().locator(".card");
  }

  getCheckoutLink() {
    return this.page().locator("a:has-text('Checkout')");
  }

  async addProductToCart(productName: string): Promise<void> {
    const cards = this.getProductCards();
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const title = await card.locator("h4").textContent();

      if (title?.trim() === productName) {
        await card.locator("button:has-text('Add')").click();
        comFunc.reportMessagePass(`ProductsPage.addProductToCart() - Added "${productName}" to cart`);
        return;
      }
    }

    comFunc.reportMessageFail(`ProductsPage.addProductToCart() - Product "${productName}" not found`);
  }

  async navigateToCart(): Promise<void> {
    await this.getCheckoutLink().click();
    comFunc.reportMessagePass("ProductsPage.navigateToCart() - Navigated to cart");
  }

  async confirmProductInCart(productName: string): Promise<void> {
    const cartItem = this.page().locator("td:has-text('" + productName + "')");
    await expect(cartItem).toBeVisible({ timeout: 10_000 });
    comFunc.reportMessagePass(`ProductsPage.confirmProductInCart() - "${productName}" confirmed in cart ✅`);
  }
}

export const productsPage = new ProductsPage();
