import { expect } from "@playwright/test";
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

const BASE_URL = "https://www.aacargo.com";

export class FacilitiesPage {
  private page() {
    return globalVariables.page;
  }

  // ─── Navigation ────────────────────────────────────────────────────────────
  getShipNavLink() {
    return this.page().locator("nav a[href='#']", { hasText: "Ship" }).first();
  }

  getFacilitiesDropdownLink() {
    return this.page().locator("a[href='/AACargo/facilityForm']");
  }

  getSearchBox() {
    return this.page().getByRole("textbox", { name: "Location, City or Airport" });
  }

  async navigateToHomepage(): Promise<void> {
    await this.page().goto(`${BASE_URL}/index.html`, { waitUntil: "domcontentloaded" });
    comFunc.reportMessagePass("FacilitiesPage.navigateToHomepage() - aacargo.com loaded");
  }

  async dismissCookieBanner(): Promise<void> {
    const dismissBtn = this.page().locator("button", { hasText: "Dismiss" });
    const visible = await dismissBtn.isVisible().catch(() => false);
    if (visible) {
      await dismissBtn.click();
      comFunc.reportMessagePass("FacilitiesPage.dismissCookieBanner() - Cookie banner dismissed");
    }
  }

  async clickShipMenu(): Promise<void> {
    await this.getShipNavLink().click();
    await this.getFacilitiesDropdownLink().waitFor({ state: "visible", timeout: 5_000 });
    comFunc.reportMessagePass("FacilitiesPage.clickShipMenu() - Ship dropdown opened");
  }

  async clickFacilities(): Promise<void> {
    await this.getFacilitiesDropdownLink().click();
    await this.page().waitForURL("**/facilityForm**", { timeout: 10_000 });
    comFunc.reportMessagePass("FacilitiesPage.clickFacilities() - Navigated to Facilities search page");
  }

  async search(code: string): Promise<void> {
    await this.getSearchBox().waitFor({ state: "visible", timeout: 10_000 });
    await this.getSearchBox().fill(code);
    await this.getSearchBox().press("Enter");
    comFunc.reportMessagePass(`FacilitiesPage.search() - Searched for "${code}"`);
  }

  async verifyOnFacilityResultPage(airportCode: string): Promise<void> {
    await this.page().waitForURL(`**/${airportCode.toUpperCase()}**`, { timeout: 25_000 });
    await expect(this.page()).toHaveURL(new RegExp(airportCode.toUpperCase()), { timeout: 5_000 });
    comFunc.reportMessagePass(`FacilitiesPage.verifyOnFacilityResultPage() - URL contains "${airportCode.toUpperCase()}" ✅`);
  }

  // ─── Multiple Facilities ───────────────────────────────────────────────────
  getMultipleFacilitiesMsg() {
    return this.page().locator("p", { hasText: "There are multiple facilities at this airport." }).first();
  }

  async verifyMultipleFacilitiesMessage(): Promise<void> {
    await expect(this.getMultipleFacilitiesMsg()).toBeVisible({ timeout: 10_000 });
    comFunc.reportMessagePass("FacilitiesPage.verifyMultipleFacilitiesMessage() - Multiple facilities msg confirmed ✅");
  }

  // ─── Cargo Terminal ────────────────────────────────────────────────────────
  getCargoTerminalHeading() {
    return this.page().locator("h2", { hasText: "Cargo Terminal" }).first();
  }

  getCargoTerminalAddress() {
    return this.page().locator("text=1816 Airport North Service Road").first();
  }

  getCargoTerminalCity() {
    return this.page().locator("text=DFW Airport, TX 75261").first();
  }

  getCargoTerminalAllShipmentsHours() {
    return this.page().locator("text=03:00 AM to 10:30 PM").first();
  }

  getCargoTerminalSundayHours() {
    return this.page().locator("text=06:00 AM to 10:30 PM").first();
  }

  getCargoTerminalDangerousGoodsHours() {
    return this.page().locator("text=06:00 AM to 08:00 PM").first();
  }

  getCargoTerminalDirectionsLink() {
    return this.page().locator("a[href*='32.91378']").first();
  }

  async verifyCargoTerminalAddress(address: string, city: string): Promise<void> {
    await expect(this.getCargoTerminalHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.getCargoTerminalAddress()).toBeVisible();
    await expect(this.getCargoTerminalCity()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyCargoTerminalAddress() - Address confirmed ✅");
  }

  async verifyCargoTerminalHours(): Promise<void> {
    await expect(this.getCargoTerminalAllShipmentsHours()).toBeVisible({ timeout: 10_000 });
    await expect(this.getCargoTerminalSundayHours()).toBeVisible();
    await expect(this.getCargoTerminalDangerousGoodsHours()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyCargoTerminalHours() - All hours confirmed ✅");
  }

  // ─── Priority Parcel Service ────────────────────────────────────────────────
  getPPSHeading() {
    return this.page().locator("h2", { hasText: "Priority Parcel Service" }).first();
  }

  getPPSAddress() {
    return this.page().locator("text=2300 Crossunder #3").first();
  }

  getPPSHours() {
    return this.page().locator("text=04:30 AM to 12:00 AM").first();
  }

  getPPSDirectionsLink() {
    return this.page().locator("a[href*='32.900307']").first();
  }

  async verifyPPSAddress(): Promise<void> {
    await expect(this.getPPSHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.getPPSAddress()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyPPSAddress() - PPS address confirmed ✅");
  }

  async verifyPPSHours(): Promise<void> {
    await expect(this.getPPSHours()).toBeVisible({ timeout: 10_000 });
    comFunc.reportMessagePass("FacilitiesPage.verifyPPSHours() - PPS hours confirmed ✅");
  }

  // ─── Customs Information ───────────────────────────────────────────────────
  getCustomsHeading() {
    return this.page().locator("h2", { hasText: "Customs Information" });
  }

  getCustomsPhone() {
    return this.page().locator("a[href='tel:972-870-7460']");
  }

  getCustomsFirmsCode() {
    return this.page().locator("text=T275");
  }

  getCustomsPortCode() {
    return this.page().locator("text=5501");
  }

  async verifyCustomsInfo(): Promise<void> {
    await expect(this.getCustomsHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.getCustomsPhone()).toBeVisible();
    await expect(this.getCustomsFirmsCode()).toBeVisible();
    await expect(this.getCustomsPortCode()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyCustomsInfo() - Customs info confirmed ✅");
  }

  async verifyCustomsPhoneIsCallable(): Promise<void> {
    const href = await this.getCustomsPhone().getAttribute("href");
    expect(href).toBe("tel:972-870-7460");
    comFunc.reportMessagePass("FacilitiesPage.verifyCustomsPhoneIsCallable() - tel: href confirmed ✅");
  }

  // ─── Airport Information ────────────────────────────────────────────────────
  getAirportInfoHeading() {
    return this.page().locator("h2", { hasText: "Airport Information" });
  }

  async verifyAirportInfo(): Promise<void> {
    await expect(this.getAirportInfoHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.page().locator("text=Animal holding area: Yes")).toBeVisible();
    await expect(this.page().locator("text=Security cage: Yes")).toBeVisible();
    await expect(this.page().locator("text=Kenneling facility: Yes")).toBeVisible();
    await expect(this.page().locator("text=Airtrays available for sale: Yes")).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyAirportInfo() - Airport info confirmed ✅");
  }

  // ─── Drop-off Times ─────────────────────────────────────────────────────────
  getDropOffTimesHeading() {
    return this.page().locator("h2", { hasText: "Minimum Drop-off Times" }).first();
  }

  getUSDomesticBtn() {
    return this.page().locator("button", { hasText: "US Domestic" }).first();
  }

  getIntlOutboundBtn() {
    return this.page().locator("button", { hasText: "International Outbound" }).first();
  }

  async verifyDropOffTimesSection(): Promise<void> {
    await expect(this.getDropOffTimesHeading()).toBeVisible({ timeout: 10_000 });
    await expect(this.getUSDomesticBtn()).toBeVisible();
    await expect(this.getIntlOutboundBtn()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifyDropOffTimesSection() - Drop-off times section confirmed ✅");
  }

  // ─── Directions Links ───────────────────────────────────────────────────────
  async verifyCargoTerminalDirectionsLink(): Promise<void> {
    const href = await this.getCargoTerminalDirectionsLink().getAttribute("href");
    expect(href).toContain("32.91378");
    expect(href).toContain("-97.03849");
    comFunc.reportMessagePass("FacilitiesPage.verifyCargoTerminalDirectionsLink() - GPS coordinates confirmed ✅");
  }

  // ─── Search Box Placeholder ─────────────────────────────────────────────────
  async verifySearchBoxPlaceholder(): Promise<void> {
    await this.getSearchBox().waitFor({ state: "visible", timeout: 15_000 });
    await expect(this.getSearchBox()).toBeVisible();
    comFunc.reportMessagePass("FacilitiesPage.verifySearchBoxPlaceholder() - Search box 'Location, City or Airport' visible ✅");
  }

  // ─── Section Order ──────────────────────────────────────────────────────────
  async verifySectionOrder(): Promise<void> {
    const headings = await this.page().locator("h2").allTextContents();
    const cargoIdx = headings.findIndex(h => h.includes("Cargo Terminal"));
    const ppsIdx = headings.findIndex(h => h.includes("Priority Parcel Service"));
    const customsIdx = headings.findIndex(h => h.includes("Customs Information"));
    const airportIdx = headings.findIndex(h => h.includes("Airport Information"));
    expect(cargoIdx).toBeLessThan(ppsIdx);
    expect(customsIdx).toBeGreaterThan(0);
    expect(airportIdx).toBeGreaterThan(0);
    comFunc.reportMessagePass("FacilitiesPage.verifySectionOrder() - Section order confirmed ✅");
  }

  // ─── Accessibility without login ────────────────────────────────────────────
  async verifyAccessibleWithoutLogin(url: string): Promise<void> {
    await this.page().goto(url, { waitUntil: "domcontentloaded" });
    await expect(this.getCargoTerminalHeading()).toBeVisible({ timeout: 10_000 });
    comFunc.reportMessagePass("FacilitiesPage.verifyAccessibleWithoutLogin() - Page accessible without login ✅");
  }
}

export const facilitiesPage = new FacilitiesPage();
