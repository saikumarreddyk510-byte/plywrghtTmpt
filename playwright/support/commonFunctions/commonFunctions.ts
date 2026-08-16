import { type Page, expect } from "@playwright/test";
import { globalVariables } from "./globalVariables";

/**
 * CommonFunctions — structured logging helpers and reusable assertion utilities.
 *
 * reportMessage* methods prefix every log line with the current testName tag
 * so log output is easily grep-able per scenario.
 */
export class CommonFunctions {
  private log(value: string) {
    console.log(value);
  }

  reportMessageInfo(messageTxt: string) {
    this.log(`${globalVariables.testName}-[INFO] - ${messageTxt}`);
  }

  reportMessagePass(messageTxt: string) {
    this.log(`${globalVariables.testName}-[PASS] - ${messageTxt}`);
  }

  reportMessageWarning(messageTxt: string) {
    this.log(`${globalVariables.testName}-[WARN] - ${messageTxt}`);
  }

  /**
   * Marks the current test as failed and accumulates error messages.
   * A screenshot should be captured at the call site before calling this.
   */
  reportMessageFail(messageTxt: string) {
    this.log(`${globalVariables.testName}-[FAIL] - ${messageTxt}`);
    globalVariables.scriptFailed = true;
    globalVariables.errorMessage = globalVariables.errorMessage
      ? `${globalVariables.errorMessage} | ${messageTxt}`
      : messageTxt;
  }

  reportMessageError(messageTxt: string, shouldFailScript = true) {
    this.log(`${globalVariables.testName}-[ERROR] - ${messageTxt}`);
    if (shouldFailScript) {
      globalVariables.scriptFailed = true;
      globalVariables.errorMessage = globalVariables.errorMessage
        ? `${globalVariables.errorMessage} | ${messageTxt}`
        : messageTxt;
    }
  }

  /**
   * Asserts that the text content of a CSS-selector element equals expected.
   */
  async assertTextEquals(
    page: Page,
    selector: string,
    expected: string,
    passMsg: string,
    failMsg: string,
  ): Promise<void> {
    try {
      await expect(page.locator(selector)).toHaveText(expected, { timeout: 10_000 });
      this.reportMessagePass(passMsg);
    } catch {
      this.reportMessageFail(failMsg);
    }
  }

  /**
   * Asserts that a locator contains the expected text.
   */
  async assertTextContains(
    page: Page,
    selector: string,
    expected: string,
    passMsg: string,
    failMsg: string,
  ): Promise<void> {
    try {
      await expect(page.locator(selector)).toContainText(expected, { timeout: 10_000 });
      this.reportMessagePass(passMsg);
    } catch {
      this.reportMessageFail(failMsg);
    }
  }
}

export const comFunc = new CommonFunctions();
