import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { allureResultsDir, logFolder, specName } from "./allureRunContext";

/**
 * Playwright global teardown.
 *
 * After the run completes it:
 *   1. Creates the per-run folder under C:\LogFolder.
 *   2. Moves the isolated allure-results-<runId> dir into <logFolder>/allure-results.
 *   3. Generates the Allure HTML report at <logFolder>/allure-report.
 *   4. Optionally opens the report when OPEN_ALLURE_REPORT=true.
 */
async function globalTeardown(): Promise<void> {
  let sourceFolder = path.join(process.cwd(), allureResultsDir);

  // Fallback to most-recently modified allure-results-* dir if exact match missing.
  if (!fs.existsSync(sourceFolder)) {
    const candidate = fs
      .readdirSync(process.cwd(), { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("allure-results-"))
      .map((d) => {
        const full = path.join(process.cwd(), d.name);
        return { full, mtime: fs.statSync(full).mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime)[0];
    if (candidate) sourceFolder = candidate.full;
  }

  if (!fs.existsSync(sourceFolder)) {
    console.log(`No allure-results folder found for spec: ${specName}`);
    return;
  }

  try {
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, { recursive: true });
    }

    const destinationFolder = path.join(logFolder, "allure-results");
    fs.rmSync(destinationFolder, { recursive: true, force: true });
    fs.cpSync(sourceFolder, destinationFolder, { recursive: true });
    fs.rmSync(sourceFolder, { recursive: true, force: true });
    console.log(`Allure results moved to: ${destinationFolder}`);

    // Invoke allure-commandline directly (avoids Windows path-with-spaces issue
    // in the node_modules/.bin shim).
    const allureBin = path.join(
      process.cwd(),
      "node_modules",
      "allure-commandline",
      "dist",
      "bin",
      process.platform === "win32" ? "allure.bat" : "allure",
    );

    const allureReportPath = path.join(logFolder, "allure-report");

    // Skip report generation if Java is not installed (allure-commandline requires Java).
    let javaAvailable = false;
    try {
      execSync("java -version", { stdio: "ignore" });
      javaAvailable = true;
    } catch {
      console.log("Java not found — skipping Allure HTML report generation. Test results saved to: " + destinationFolder);
    }

    if (javaAvailable) {
      execSync(`"${allureBin}" generate "${destinationFolder}" --clean -o "${allureReportPath}"`, {
        stdio: "inherit",
      });
      console.log(`Allure report generated at: ${allureReportPath}`);

      if (process.env.OPEN_ALLURE_REPORT === "true") {
        execSync(`"${allureBin}" open "${allureReportPath}"`, { stdio: "inherit" });
      }
    }
  } catch (error) {
    console.error("globalTeardown error:", error);
  }
}

export default globalTeardown;
