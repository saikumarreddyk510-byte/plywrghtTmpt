# PlayWrightAI — Playwright Test Automation

## Project Overview
E2E test automation framework using Playwright + TypeScript.
Target app: rahulshettyacademy.com practice sites.
Pattern: Page Object Model (POM) with Allure reporting.

## Tech Stack
- Node.js v22 / TypeScript 5 (strict mode)
- @playwright/test — test runner
- allure-playwright — HTML reporting (requires Java)
- cross-env — environment variable management

## Project Structure
```
playwright/
  e2e/              ← Test specs (*.spec.ts)
  support/
    pageObjects/    ← Page Object classes (*-po.ts)
    commonFunctions/
      globalVariables.ts  ← Shared state + BASE_URL + credentials
      commonFunctions.ts  ← Logging helpers (reportMessage*)
      loginLogout.ts      ← beforeEach setup helper
    auth/           ← Auth storageState files (git-ignored)
  testdata/         ← JSON input data (users.json, etc.)
playwright.config.ts ← Projects config (one project per spec group)
.env                ← Runtime secrets (BASE_URL, APP_USER, APP_PASSWORD)
```

## Key Commands
```
npm run pw:test             # Run all tests (headless)
npm run pw:test:headed      # Run with visible browser
npm run pw:test:smoke       # Smoke tests only
npm run pw:test:ui          # Interactive Playwright UI
npm run pw:list             # List all tests
npm run report:open         # Open last Allure HTML report
npm run lint                # ESLint
npm run format              # Prettier
```

## Conventions
- Every spec imports `setPage` and calls it in `beforeEach`
- All logging via `comFunc.reportMessageInfo/Pass/Fail/Error`
- Test data always read from `playwright/testdata/*.json`
- Page Object classes use `globalVariables.page` (no page param threading)
- New spec → add matching project block in `playwright.config.ts`
- Credentials in `.env` only — never hardcode in source
- `fullyParallel: false` — one worker at a time (shared page handle)

## Adding a New Test
1. Add credentials/data to `playwright/testdata/users.json`
2. Create Page Object in `playwright/support/pageObjects/*-po.ts`
3. Create spec in `playwright/e2e/*.spec.ts`
4. Add project block in `playwright.config.ts` with `testMatch`
5. Run: `npx playwright test <spec>.spec.ts --headed --project=<name>`
