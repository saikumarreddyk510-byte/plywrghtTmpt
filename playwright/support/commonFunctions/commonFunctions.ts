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
   * Fails the test if any soft failure was recorded during it.
   *
   * `reportMessageFail`/`reportMessageError` only *log* and set
   * `globalVariables.scriptFailed` — on their own they leave the test green,
   * so a spec that logs [FAIL] and nothing else still passes. Call this at the
   * end of a test (or in `afterEach`) to convert accumulated soft failures into
   * a real failure:
   *
   *   test.afterEach(() => comFunc.assertNoSoftFailures());
   */
  assertNoSoftFailures(): void {
    if (!globalVariables.scriptFailed) return;
    const message = globalVariables.errorMessage || "A step reported a failure";
    // Reset first so one test's failure can't leak into the next (state is shared).
    globalVariables.scriptFailed = false;
    globalVariables.errorMessage = "";
    expect(false, `Soft failures recorded during this test: ${message}`).toBe(true);
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
