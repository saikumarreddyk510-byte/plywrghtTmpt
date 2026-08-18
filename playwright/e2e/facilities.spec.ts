import { test } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { comFunc } from "../support/commonFunctions/commonFunctions";
import { facilitiesPage } from "../support/pageObjects/facilities-po";
import facilityData from "../testdata/facilities.json";

const HOMEPAGE = "https://www.aacargo.com";
const FACILITIES_URL = `${HOMEPAGE}/AACargo/facilityForm`;
const DFW_URL = `${HOMEPAGE}/AACargo/ua/facilities/DFW`;
const { dfw } = facilityData;

test.describe("AACargo Facilities - DFW Search & Validation", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);
    page.on("pageerror", () => {});
  });

  // ─── SMOKE TESTS (P0) ──────────────────────────────────────────────────────

  test("TC-001 - Navigate to Facilities via Ship menu", async ({ page }) => {
    comFunc.reportMessageInfo("TC-001 - Step 1: Navigate to aacargo.com homepage");
    await facilitiesPage.navigateToHomepage();

    comFunc.reportMessageInfo("TC-001 - Step 2: Dismiss cookie banner if present");
    await facilitiesPage.dismissCookieBanner();

    comFunc.reportMessageInfo("TC-001 - Step 3: Click Ship menu");
    await facilitiesPage.clickShipMenu();

    comFunc.reportMessageInfo("TC-001 - Step 4: Click Facilities in dropdown");
    await facilitiesPage.clickFacilities();

    comFunc.reportMessageInfo("TC-001 - Step 5: Verify search box visible on facilities page");
    await facilitiesPage.verifySearchBoxPlaceholder();
  });

  test("TC-002 - Search for DFW by airport code returns results", async ({ page }) => {
    comFunc.reportMessageInfo("TC-002 - Step 1: Go to facilities search page");
    await page.goto(FACILITIES_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-002 - Step 2: Search for DFW");
    await facilitiesPage.search(dfw.searchCode);

    comFunc.reportMessageInfo("TC-002 - Step 3: Verify URL contains DFW");
    await facilitiesPage.verifyOnFacilityResultPage("DFW");
  });

  test("TC-101 - Multiple facilities message shown for DFW", async ({ page }) => {
    comFunc.reportMessageInfo("TC-101 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-101 - Verify multiple facilities message");
    await facilitiesPage.verifyMultipleFacilitiesMessage();
  });

  test("TC-003 - Cargo Terminal address is correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-003 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-003 - Verify Cargo Terminal address");
    await facilitiesPage.verifyCargoTerminalAddress(
      dfw.cargoTerminal.address,
      dfw.cargoTerminal.city
    );
  });

  test("TC-004 - Cargo Terminal service hours are correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-004 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-004 - Verify Cargo Terminal hours");
    await facilitiesPage.verifyCargoTerminalHours();
  });

  test("TC-005 - Priority Parcel Service address is correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-005 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-005 - Verify PPS address");
    await facilitiesPage.verifyPPSAddress();
  });

  test("TC-006 - Priority Parcel Service hours are correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-006 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-006 - Verify PPS hours");
    await facilitiesPage.verifyPPSHours();
  });

  // ─── REGRESSION TESTS (P1) ────────────────────────────────────────────────

  test("TC-007 - Customs information details are correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-007 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-007 - Verify Customs section");
    await facilitiesPage.verifyCustomsInfo();
  });

  test("TC-008 - Airport Information section shows correct capabilities", async ({ page }) => {
    comFunc.reportMessageInfo("TC-008 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-008 - Verify Airport Information");
    await facilitiesPage.verifyAirportInfo();
  });

  test("TC-102 - Customs phone number is a callable tel: link", async ({ page }) => {
    comFunc.reportMessageInfo("TC-102 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-102 - Verify phone is tel: link");
    await facilitiesPage.verifyCustomsPhoneIsCallable();
  });

  test("TC-103 - Minimum Drop-off Times section present", async ({ page }) => {
    comFunc.reportMessageInfo("TC-103 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-103 - Verify Drop-off Times section");
    await facilitiesPage.verifyDropOffTimesSection();
  });

  test("TC-201 - Facility page accessible without login", async ({ page }) => {
    comFunc.reportMessageInfo("TC-201 - Access DFW facility page directly (no login)");
    await facilitiesPage.verifyAccessibleWithoutLogin(DFW_URL);
  });

  test("TC-501 - Search box placeholder text is correct", async ({ page }) => {
    comFunc.reportMessageInfo("TC-501 - Navigate to facilities search page");
    await page.goto(FACILITIES_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-501 - Verify placeholder text");
    await facilitiesPage.verifySearchBoxPlaceholder();
  });

  test("TC-503 - Facility sections displayed in correct order", async ({ page }) => {
    comFunc.reportMessageInfo("TC-503 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-503 - Verify section order");
    await facilitiesPage.verifySectionOrder();
  });

  // ─── EXTENDED TESTS (P2) ──────────────────────────────────────────────────

  test("TC-009 - Get Directions link uses correct GPS coordinates", async ({ page }) => {
    comFunc.reportMessageInfo("TC-009 - Navigate to DFW facility page");
    await page.goto(DFW_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-009 - Verify Cargo Terminal directions link GPS coordinates");
    await facilitiesPage.verifyCargoTerminalDirectionsLink();
  });

  test("TC-401 - Search with uppercase DFW returns same results", async ({ page }) => {
    comFunc.reportMessageInfo("TC-401 - Navigate to facilities search page");
    await page.goto(FACILITIES_URL, { waitUntil: "domcontentloaded" });

    comFunc.reportMessageInfo("TC-401 - Search with uppercase DFW");
    await facilitiesPage.search("DFW");

    comFunc.reportMessageInfo("TC-401 - Verify URL contains DFW (case-insensitive)");
    await facilitiesPage.verifyOnFacilityResultPage("DFW");

    comFunc.reportMessageInfo("TC-401 - Verify multiple facilities message shown");
    await facilitiesPage.verifyMultipleFacilitiesMessage();
  });
});
