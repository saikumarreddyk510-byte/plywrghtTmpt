import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import { logFolder } from "./allureRunContext";

/**
 * Terminal-log-to-file reporter.
 *
 * Captures all stdout/stderr during the run and writes it to
 * <logFolder>/out.txt after the run completes.
 */
class LogFileReporter implements Reporter {
  private readonly chunks: string[] = [];

  onStdOut(chunk: string | Buffer, _test?: TestCase, _result?: TestResult) {
    this.chunks.push(chunk.toString());
  }

  onStdErr(chunk: string | Buffer, _test?: TestCase, _result?: TestResult) {
    this.chunks.push(chunk.toString());
  }

  async onEnd() {
    try {
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
      }
      fs.writeFileSync(path.join(logFolder, "out.txt"), this.chunks.join(""), "utf8");
      console.log(`Terminal log written to: ${path.join(logFolder, "out.txt")}`);
    } catch (error) {
      console.error("LogFileReporter: error writing out.txt:", error);
    }
  }
}

export default LogFileReporter;
