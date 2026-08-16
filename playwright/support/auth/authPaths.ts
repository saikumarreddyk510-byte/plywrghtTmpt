import * as path from "path";

/**
 * Auth storageState file paths.
 *
 * Add one constant per authenticated slice. All files live under
 * playwright/.auth/ which is git-ignored (no session tokens in source control).
 *
 * Usage in playwright.config.ts:
 *   import { mySliceAuthFile } from "./playwright/support/auth/authPaths";
 *   use: { storageState: mySliceAuthFile }
 */

const authDir = path.join(process.cwd(), "playwright", ".auth");

/**
 * Example storageState written by example.setup.ts and consumed by
 * the "example" project in playwright.config.ts.
 */
export const exampleAuthFile = path.join(authDir, "example-user.json");

// Add additional auth file constants here as new slices are added:
// export const adminAuthFile = path.join(authDir, "admin-user.json");
