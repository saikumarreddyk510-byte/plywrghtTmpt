# Playwright Test Automation Template — Complete Beginner's Guide

> **New to Playwright? Start here.** This single file teaches you Playwright from
> zero **and** explains every part of this template. Read it top-to-bottom once.
> You do not need any prior knowledge.

---

## Table of Contents

1. [What is Playwright?](#1-what-is-playwright)
2. [Core concepts (the 8 things to understand)](#2-core-concepts)
3. [Install & first run](#3-install--first-run)
4. [What this template gives you](#4-what-this-template-gives-you)
5. [Project structure](#5-project-structure)
6. [Every file explained](#6-every-file-explained)
7. [Writing your first test](#7-writing-your-first-test)
8. [Locators — how to find elements](#8-locators--how-to-find-elements)
9. [Actions & assertions cheat sheet](#9-actions--assertions-cheat-sheet)
10. [Page Object Model (POM)](#10-page-object-model-pom)
11. [Login once & reuse (authentication)](#11-login-once--reuse-authentication)
12. [Smoke vs Regression](#12-smoke-vs-regression)
13. [Reporting, logging & Allure](#13-reporting-logging--allure)
14. [Running on SauceLabs](#14-running-on-saucelabs)
15. [Environment variables](#15-environment-variables)
16. [Command reference](#16-command-reference)
17. [Step-by-step: add a new test](#17-step-by-step-add-a-new-test)
18. [Step-by-step: add an authenticated slice](#18-step-by-step-add-an-authenticated-slice)
19. [Coming from Cypress?](#19-coming-from-cypress)
20. [Troubleshooting / FAQ](#20-troubleshooting--faq)
21. [Glossary](#21-glossary)

---

## 1. What is Playwright?

**Playwright** is a tool that controls a real web browser (Chrome, Edge, Firefox,
Safari) with code, so you can automatically test a website the way a human would:
open a page, click buttons, type text, and check that the right things appear.

- It runs in **Node.js** (JavaScript/TypeScript) and drives the browser from the
  outside.
- Tests are written in **TypeScript** in this template (`.ts` files).
- It **auto-waits** for elements to be ready, so tests are less flaky than older
  tools.

Think of it as a robot that opens your website and verifies it works — every time,
in seconds.

---

## 2. Core concepts

These 8 ideas are everything you need to start:

### 2.1 `test` — one test case
```ts
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example/);
});
```
- `test("name", fn)` defines one test.
- The function is `async` and receives **fixtures** — here `{ page }`.

### 2.2 `page` — the browser tab
`page` is your handle to the open browser tab. You call methods on it:
`page.goto(...)`, `page.locator(...)`, `page.click(...)`.

### 2.3 `async` / `await` — wait for each step
Every browser action returns a **promise**. You must put `await` in front of it,
or the next line runs before the action finishes.
```ts
await page.goto("/login");      // ✅ waits
page.goto("/login");            // ❌ does not wait — causes race conditions
```

### 2.4 Locator — a pointer to an element
A **locator** describes how to find an element. It is lazy (nothing happens until
you act on it) and it auto-retries until the element is ready.
```ts
const loginButton = page.locator("#login-btn");
await loginButton.click();
```

### 2.5 Actions — do something
`.click()`, `.fill("text")`, `.check()`, `.selectOption(...)`, `.hover()`, etc.

### 2.6 Assertions — check something
`expect(...)` verifies the app is in the expected state and **auto-waits**:
```ts
await expect(page.locator("#welcome")).toBeVisible();
await expect(page.locator("#total")).toHaveText("$42.00");
```

### 2.7 Hooks — setup/cleanup
```ts
test.beforeEach(async ({ page }) => { /* runs before each test */ });
test.afterEach(async ({ page })  => { /* runs after each test  */ });
```

### 2.8 Config & Projects
`playwright.config.ts` controls timeouts, browser, base URL, reporters, and
**projects**. A *project* is a named group of tests with its own settings (which
files to run, which browser, whether to start logged-in). More in §6.

---

## 3. Install & first run

```powershell
# 1. Install dependencies (once)
npm install

# 2. Install browser binaries (once)
npx playwright install

# 3. Copy the env template and fill it in
Copy-Item .env.example .env
#   then edit .env → set BASE_URL, APP_USER, APP_PASSWORD

# 4. Run everything
npm run pw:test

# 5. Or run just the fast smoke tests
npm run pw:test:smoke

# 6. Watch it in a real browser window
npm run pw:test:headed
```

If `npm run pw:test` runs the example test, you're set up correctly.

---

## 4. What this template gives you

You don't have to build any of this — it's already wired:

| Feature | What it does |
|---|---|
| **Allure reporting** | Rich HTML report generated automatically after each run |
| **File logging** | All console output saved to `out.txt` per run |
| **Global teardown** | Collects results into `C:\LogFolder\<run>\` and builds the report |
| **Auth pattern** | Log in once, reuse the session across tests (`storageState`) |
| **Page Object Model** | Clean structure for locators + actions |
| **Smoke/Regression gate** | One `SMOKE` env var controls test scope |
| **SauceLabs** | Config to run tests in the cloud |
| **ESLint + Prettier + TS** | Linting, formatting, and type-checking preconfigured |

---

## 5. Project structure

Three groups, and nothing else at the top level: **config** (how tests run),
**`playwright/`** (what runs), **`docs/`** (what it all means).

```
playwrightTemplate/
├── package.json                 Dependencies + npm scripts
├── tsconfig.json                TypeScript settings (strict)
├── eslint.config.mjs            Lint rules (+ Prettier)
├── .prettierrc                  Formatting rules
├── .env.example                 Template for your local .env (secrets)
├── .gitignore / .gitattributes  Ignore rules; union-merge for run history
├── playwright.config.ts         MAIN config (local runs)
├── playwright.sauce.config.ts   Cloud config (video/screenshots on)
├── run-sauce.ts                 Prepares Sauce artifact folder
├── CLAUDE.md                    How the AI pipeline is wired (read by Claude Code)
├── README.md                    <- YOU ARE HERE
├── .claude/skills/              The AI pipeline: one folder per skill
├── .github/                     Copilot mirrors of those skills + CI workflow
├── .sauce/config.yml            SauceLabs runner config + suites
├── .test-history/runs.jsonl     Append-only run history (flaky detection)
├── docs/                        See 5.3
└── playwright/                  See 5.2
```

**Rule of thumb:** your tests go in `playwright/e2e/`, reusable code goes in
`playwright/support/`, and anything a human reads goes in `docs/`.

### 5.1 Configuration & tooling (repo root)

These control execution, not the tests themselves:

- `package.json` - the scripts you run + the dependency list.
- `tsconfig.json` - strict TypeScript, type-check only (`noEmit`).
- `eslint.config.mjs` / `.prettierrc` - code quality + consistent formatting.
- `.env.example` - documents env vars; copy to `.env` and fill in real values.
- `.gitignore` - keeps `node_modules`, sessions, reports, logs, `.env` out of git.
- `playwright.config.ts` - the control center: timeouts, baseURL, reporters,
  `globalTeardown`, and the **`projects[]`** array (one entry per test group).
- `playwright.sauce.config.ts` + `run-sauce.ts` + `.sauce/config.yml` - the
  SauceLabs cloud-execution trio.

### 5.2 The framework + tests (`playwright/`)

```
playwright/
├── .auth/                   Saved storageState JSON (login sessions) - git-ignored
├── e2e/                     UI test specs (what you run)
│   ├── example.spec.ts      Reference smoke/regression test - copy its shape
│   └── example.a11y.spec.ts Reference accessibility audit spec
├── api/                     API-layer specs (*.api.spec.ts) - no browser needed
├── testdata/                JSON fixtures the specs read (users.json, ...)
└── support/                 Framework helper code (never tests)
    ├── auth/                Log in once, save the session
    │   ├── authPaths.ts     Where each slice's session file is saved
    │   └── example.setup.ts Logs in once, saves the session
    ├── commonFunctions/     The framework core
    │   ├── globalVariables.ts  Shared state, BASE_URL, setPage()
    │   ├── commonFunctions.ts  Logging + assertion helpers (comFunc)
    │   └── loginLogout.ts      login / logout / beforeEach setup
    ├── pageObjects/         Locators + actions, one class per page
    ├── api/apiClient.ts     HTTP calls with the same logging as a Page Object
    ├── a11y/a11yAudit.ts    Dependency-free accessibility scan
    ├── data/dataFactory.ts  Seeded realistic / boundary / adversarial values
    └── reporting/           Everything about run output - nothing test-specific
        ├── allureRunContext.ts     One shared run id + folder names
        ├── logFileReporter.ts      Captures console output -> out.txt
        ├── runHistoryReporter.ts   Appends each run to .test-history/runs.jsonl
        ├── analyzeHistory.ts       Pass rate / flip rate / verdict per test
        └── globalTeardown.ts       After the run: collect results + build report
```

Two naming rules keep this navigable as it grows:

- **`support/` holds capabilities, one folder per concern.** A new capability is
  a new folder, never a loose file at the top of `support/`.
- **`support/data/` generates values, `playwright/testdata/` stores them.** Same
  word, different jobs - which is exactly why they no longer share a name.

### 5.3 Documentation (`docs/`)

```
docs/
├── README.md                Index - what each document is, and who writes it
├── architecture.md/.html    How the AI pipeline is designed, and why
├── quickstart.md            Scenario -> passing test, step by step
├── roadmap.md               What is built, what is left, what is out of scope
├── pipeline/                Working files the AI skills read and write
│   ├── test-scenarios.md    TC-### scenarios (/create-scenarios)
│   └── test-strategy.md     Layer assignments (/test-strategy)
├── reports/                 Generated output - written for humans to read
│   ├── review-report.md - run-report.md - healing-log.md
│   ├── flaky-log.md - app-bugs.md
│   └── a11y/                Raw per-page accessibility results (JSON)
└── learning/                Personal notes - not part of the framework
```

The `pipeline/` vs `reports/` split is the useful one: **`pipeline/` files are
inputs to the next AI step**, `reports/` files are outputs for a person. If you
are wondering whether a skill will read a file, that is the answer.

### How the folders work together (run-time flow)

A single test run flows top-to-bottom through these pieces:

1. **`playwright.config.ts`** picks a **project**, which points at a spec in
   `e2e/` and (optionally) an auth setup.
2. If the project needs a login, **`auth/example.setup.ts`** runs first, logs in,
   and writes a session file to **`.auth/`** at a path defined in
   **`auth/authPaths.ts`**. Dependent tests then start already authenticated.
3. The spec's `beforeEach` calls `setPage(page)` from
   **`commonFunctions/globalVariables.ts`** so every **`pageObjects/`** class can
   reach the browser tab without passing `page` around.
4. Tests use **`pageObjects/`** for locators/actions and
   **`commonFunctions/commonFunctions.ts`** (`comFunc`) for uniform logging.
5. During the run, **`reporting/logFileReporter.ts`** captures all console
   output, **`reporting/runHistoryReporter.ts`** appends one record per test
   to `.test-history/runs.jsonl`, and
   `allure-playwright` writes raw results into an isolated `allure-results-<runId>`
   folder (named by **`reporting/allureRunContext.ts`**).
6. When the run ends, **`reporting/globalTeardown.ts`** moves everything into
   `C:\LogFolder\<name>_<timestamp>_<runId>\`, generates the Allure HTML report,
   and writes `out.txt`.

### The support sub-folders at a glance

| Folder | Responsibility | Edit it when... |
|---|---|---|
| `support/auth/` | Log in once, persist the session | Adding a new user role / authenticated area |
| `support/commonFunctions/` | Shared state, logging, login/logout | Rarely - it's the framework core |
| `support/pageObjects/` | Locators + actions for one page each | Building coverage for new pages |
| `support/api/` | HTTP calls with framework logging | Writing API-layer tests |
| `support/a11y/` | Accessibility scanning | Extending the rule set |
| `support/data/` | Generating test values | Adding a field type or payload class |
| `support/reporting/` | Run output, logs, history | Almost never - it's wired already |

### Where you'll actually work day-to-day

- **Add a test** → new file in `playwright/e2e/` + a project entry in
  `playwright.config.ts`.
- **Add a page's locators/actions** → new file in `playwright/support/pageObjects/`.
- **Add a login for a new role** → a path in `authPaths.ts` + a `*.setup.ts` in
  `support/auth/` + a project pair in the config.
- **Add an API test** -> new file in `playwright/api/`; the `api` project already
  matches `*.api.spec.ts`, so no config change is needed.

Everything else (reporting, logging, folder naming, teardown) is already wired and
runs automatically.

---

## 6. Every file explained

### Root config

- **`package.json`** — lists dependencies and npm scripts. The scripts you'll use
  most: `pw:test`, `pw:test:smoke`, `pw:test:headed`, `lint`, `format`,
  `sauce:run`.

- **`tsconfig.json`** — TypeScript rules. `strict: true` catches mistakes early;
  `noEmit: true` means we only type-check (Playwright runs the `.ts` directly).

- **`eslint.config.mjs` / `.prettierrc`** — code quality + formatting. Run
  `npm run format` before committing so line-endings/spacing are consistent.

- **`.env.example`** — a **template** listing which environment variables exist.
  Copy it to `.env` (git-ignored) and put real values there. Never commit secrets.

- **`.gitignore`** — keeps `node_modules`, saved sessions (`playwright/.auth`),
  reports, logs, and `.env` out of git.

### Playwright config

- **`playwright.config.ts`** — the control center. Key settings:
  - `testDir` — where specs live (`playwright/e2e`).
  - `timeout` / `expect.timeout` — how long a test / an assertion may take.
  - `use.baseURL` — so `page.goto("/cart")` resolves against your app URL.
  - `use.viewport`, `screenshot: "only-on-failure"`.
  - `reporter` — `list` (console) + `allure-playwright` + custom log reporter.
  - `globalTeardown` — runs the report builder after the suite.
  - `fullyParallel: false` — **one worker at a time** (required because page
    objects share one `page`; see §10 and §20).
  - `projects[]` — one entry per test group (add yours here).

- **`playwright.sauce.config.ts`** — same idea, tuned for the cloud (video,
  screenshots, and traces are always on so Sauce captures full evidence).

- **`run-sauce.ts`** — a small script that stamps a fresh timestamped download
  folder into `.sauce/config.yml` before a Sauce run.

- **`.sauce/config.yml`** — tells SauceLabs how to run: which config file, which
  suites (smoke/regression), platform, and which artifacts to download.

### Support code (`playwright/support/`)

- **`allureRunContext.ts`** — computes one unique run id + timestamp for the whole
  run and caches them, so every part of the framework agrees on the same output
  folder name. Exports `allureResultsDir`, `logFolder`, `specName`, etc.

- **`globalTeardown.ts`** — runs **after all tests**. It moves the raw results
  into `C:\LogFolder\<specName>_<timestamp>_<runId>\`, generates the Allure HTML
  report, and (optionally) opens it.

- **`logFileReporter.ts`** — captures all console output during the run and writes
  it to `out.txt` in the run folder — one searchable log per run.

- **`commonFunctions/globalVariables.ts`** — shared state used everywhere:
  - `BASE_URL` — the single source of truth for your app URL.
  - `setPage(page)` — stores the current tab so page objects can use it without a
    `page` argument.
  - `credentials` — username/password read from environment variables.
  - `resetGlobalVariables()` — clears per-test state (called in `beforeEach`).

- **`commonFunctions/commonFunctions.ts`** — the `comFunc` helper for uniform
  logging and assertions:
  ```ts
  comFunc.reportMessageInfo("Opening cart");
  comFunc.reportMessagePass("Cart is visible");
  comFunc.reportMessageFail("Cart did not load");   // marks test failed
  await comFunc.assertTextEquals(page, "#total", "$42", "ok", "wrong total");
  ```
  Every log line is prefixed with the test name, so you can grep for `[FAIL]`.

- **`commonFunctions/loginLogout.ts`** — the `loginLogout` helper:
  - `setupBeforeEach(name)` — cookie banner + reset state + go to `BASE_URL`.
  - `login(user, pass)` / `logout()` — **adapt the selectors** to your app.

- **`auth/authPaths.ts`** — file paths where saved sessions live (under
  `playwright/.auth/`). Add one constant per authenticated area.

- **`auth/example.setup.ts`** — a special "setup" test that logs in **once** and
  saves the session to disk, so real tests start already authenticated.

- **`pageObjects/home-po.ts`** — an example **Page Object**: it groups the
  locators and actions for one page. Copy it to build page objects for your app.

### Tests (`playwright/e2e/`)

- **`example.spec.ts`** — a working example showing `beforeEach`, a smoke test,
  and a regression-only test. **Copy its shape** for your own suites.
- **`README.spec.ts`** — the same guide as this file, embedded next to your tests
  (contains no runnable tests).

---

## 7. Writing your first test

Create `playwright/e2e/login.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { setPage } from "../support/commonFunctions/globalVariables";
import { loginLogout } from "../support/commonFunctions/loginLogout";
import { comFunc } from "../support/commonFunctions/commonFunctions";

test.describe("Login suite", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);                              // share the tab with page objects
    await loginLogout.setupBeforeEach("Login"); // cookie banner + reset + goto
  });

  test("LOGIN-TC01 - user can sign in", async ({ page }) => {
    comFunc.reportMessageInfo("Starting login test");

    await page.locator("#username").fill("myuser");
    await page.locator("#password").fill("mypass");
    await page.locator("#submit-btn").click();

    await expect(page.locator("#logout-btn")).toBeVisible();
    comFunc.reportMessagePass("Login succeeded");
  });
});
```

Then register it as a project in `playwright.config.ts` (inside `projects: [...]`):

```ts
{
  name: "login",
  testMatch: /login\.spec\.ts/,
  use: { ...devices["Desktop Chrome"], channel: "chrome" },
},
```

Run it:
```powershell
npx playwright test --project=login
```

---

## 8. Locators — how to find elements

Locators are how you point at elements. Prefer the ones higher in this list:

```ts
// By role + accessible name (most robust)
page.getByRole("button", { name: "Sign in" });

// By visible text
page.getByText("Welcome back");

// By label (form fields)
page.getByLabel("Email");

// By placeholder
page.getByPlaceholder("Search…");

// By test id (if your app adds data-testid)
page.getByTestId("cart-total");

// By CSS selector (id/class) — used a lot in this template
page.locator("#login-btn");
page.locator(".product-card");

// Narrowing
page.locator(".row").filter({ hasText: "AA123" });
page.locator(".list-item").nth(0);      // first
page.locator(".list-item").first();
page.locator(".list-item").last();
```

**Tip:** run `npx playwright codegen <url>` to open a recorder that writes
locators and actions for you as you click around.

---

## 9. Actions & assertions cheat sheet

### Actions
```ts
await page.goto("/cart");
await page.locator("#btn").click();
await page.locator("#name").fill("Alice");     // clears then types
await page.locator("#name").pressSequentially("Alice", { delay: 50 }); // key by key
await page.locator("#agree").check();          // checkbox/radio
await page.locator("#country").selectOption("US");
await page.locator("#menu").hover();
await page.keyboard.press("Enter");
await page.setInputFiles("#upload", "path/to/file.pdf");
await page.waitForTimeout(1000);               // fixed wait — avoid if possible
```

### Assertions (auto-wait & retry)
```ts
await expect(page.locator("#x")).toBeVisible();
await expect(page.locator("#x")).toBeHidden();
await expect(page.locator("#x")).toHaveText("Hello");
await expect(page.locator("#x")).toContainText("ell");
await expect(page.locator("#x")).toHaveValue("abc");
await expect(page.locator("#x")).toBeEnabled();
await expect(page.locator("#x")).toHaveCount(3);
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle(/Home/);
```

**Golden rule:** to wait for something, use a web-first assertion
(`await expect(...)`) — **not** `waitForTimeout`.

---

## 10. Page Object Model (POM)

A **Page Object** collects the locators and actions for one page in one class, so
tests read cleanly and selectors live in one place.

`playwright/support/pageObjects/cart-po.ts`:
```ts
import { globalVariables } from "../commonFunctions/globalVariables";
import { comFunc } from "../commonFunctions/commonFunctions";

export class CartPage {
  private page() {
    return globalVariables.page;        // shared tab — no page argument needed
  }

  total() {
    return this.page().locator("#cart-total");
  }

  async removeFirstItem() {
    await this.page().locator(".cart-item .remove").first().click();
    comFunc.reportMessagePass("Removed first cart item");
  }
}

export const cartPage = new CartPage();
```

Use it in a test:
```ts
import { cartPage } from "../support/pageObjects/cart-po";

await cartPage.removeFirstItem();
await expect(cartPage.total()).toHaveText("$0.00");
```

> **Why no `page` argument?** This template stores the active tab in
> `globalVariables.page` (set by `setPage(page)` in `beforeEach`). It keeps page
> objects clean and Cypress-like. It works **only** because tests run one-at-a-time
> (`fullyParallel: false`). See §20 to enable parallelism.

---

## 11. Login once & reuse (authentication)

Logging in for every test is slow. Playwright can save your session (cookies +
localStorage) to a file and reuse it. This template wires that up in 3 pieces:

1. **`authPaths.ts`** — the file path:
   ```ts
   export const exampleAuthFile = path.join(authDir, "example-user.json");
   ```
2. **`example.setup.ts`** — logs in and saves the session:
   ```ts
   await context.storageState({ path: exampleAuthFile });
   ```
3. **`playwright.config.ts`** — a **pair** of projects (setup runs first):
   ```ts
   {
     name: "example-setup",
     testDir: "playwright/support/auth",
     testMatch: /example\.setup\.ts/,
   },
   {
     name: "example",
     testMatch: /example\.spec\.ts/,
     dependencies: ["example-setup"],           // run setup first
     use: { storageState: exampleAuthFile },     // start logged-in
   },
   ```

Now `npx playwright test --project=example` logs in once, then every test starts
already authenticated. Session files are git-ignored (they contain live tokens).

---

## 12. Smoke vs Regression

One environment variable, `SMOKE`, controls how many tests run.

```ts
test("TC01 - critical path", async () => { /* ... */ });  // always runs

if (!process.env.SMOKE) {
  test("TC02 - extended check", async () => { /* ... */ }); // regression only
}
```

- **Smoke** = a few critical tests, fast. Run: `npm run pw:test:smoke`
- **Regression** = everything. Run: `npm run pw:test`

---

## 13. Reporting, logging & Allure

After every run you automatically get, under
`C:\LogFolder\<name>_<timestamp>_<runId>\`:

- **`allure-report/`** — a rich HTML report (open `index.html`).
- **`allure-results/`** — the raw data behind the report.
- **`out.txt`** — every console line from the run (searchable log).

You don't run any extra command — `globalTeardown` builds the report for you.

- Auto-open the report: set `OPEN_ALLURE_REPORT=true` before running.
- Name the run folder: set `PW_SPEC_NAME=login` before running.
- Failure screenshots are captured automatically (`screenshot: "only-on-failure"`).

---

## 14. Running on SauceLabs

SauceLabs runs your tests on cloud machines.

1. Set `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` (env vars or in `.sauce/config.yml`).
2. Define suites in `.sauce/config.yml` (one per spec/scenario group).
3. Run:
   ```powershell
   npm run sauce:run          # all suites
   npm run sauce:run:smoke    # smoke only (SMOKE=true)
   ```
   This first runs `run-sauce.ts` (stamps a fresh download folder), then
   `saucectl run`. Sauce uses `playwright.sauce.config.ts` (video/screenshots on)
   and downloads `allure-results.zip` / `allure-report.zip` to your `C:\LogFolder`.

---

## 15. Environment variables

Put these in `.env` (copied from `.env.example`) or your CI secret store:

| Variable | Purpose |
|---|---|
| `BASE_URL` | The app under test (used by config + `globalVariables`) |
| `APP_USER` / `APP_PASSWORD` | Login credentials |
| `SMOKE` | `true` → run only smoke tests |
| `PW_SPEC_NAME` | Names the `C:\LogFolder` subfolder (default `example`) |
| `OPEN_ALLURE_REPORT` | `true` → open the report after the run |
| `SAUCE_USERNAME` / `SAUCE_ACCESS_KEY` | SauceLabs credentials |
| `SAUCE_BASE_URL` | Optional base URL override for Sauce runs |

> **Never** commit real secrets. `.env` is git-ignored; `.env.example` holds only
> empty placeholders.

---

## 16. Command reference

```powershell
npm install                          # install dependencies
npx playwright install               # install browsers (first time)

npm run pw:test                      # run all tests
npm run pw:test:smoke                # run smoke tests only
npm run pw:test:headed               # run with a visible browser
npm run pw:test:smoke:headed         # smoke, visible browser
npm run pw:list                      # list tests without running

npx playwright test --project=NAME   # run one project
npx playwright test path/to.spec.ts  # run one file
npx playwright test -g "TC01"        # run tests whose title matches
npx playwright test --debug          # step through with the inspector
npx playwright codegen <url>         # record actions into code

npm run lint                         # check code style
npm run lint:fix                     # auto-fix lint issues
npm run format                       # Prettier write (fixes formatting)

npm run sauce:run                    # run on SauceLabs
```

---

## 17. Step-by-step: add a new test

1. Create `playwright/e2e/search.spec.ts`:
   ```ts
   import { test, expect } from "@playwright/test";
   import { setPage } from "../support/commonFunctions/globalVariables";
   import { loginLogout } from "../support/commonFunctions/loginLogout";

   test.describe("Search suite", () => {
     test.beforeEach(async ({ page }) => {
       setPage(page);
       await loginLogout.setupBeforeEach("Search");
     });

     test("SRCH-TC01 - results appear", async ({ page }) => {
       await page.getByPlaceholder("Search…").fill("shoes");
       await page.keyboard.press("Enter");
       await expect(page.locator(".result")).toHaveCount(10);
     });
   });
   ```
2. Register the project in `playwright.config.ts`:
   ```ts
   { name: "search", testMatch: /search\.spec\.ts/,
     use: { ...devices["Desktop Chrome"], channel: "chrome" } },
   ```
3. Run it:
   ```powershell
   npx playwright test --project=search
   ```

---

## 18. Step-by-step: add an authenticated slice

1. Add a path in `authPaths.ts`:
   ```ts
   export const adminAuthFile = path.join(authDir, "admin-user.json");
   ```
2. Copy `example.setup.ts` → `admin.setup.ts`, use `adminAuthFile` and admin
   credentials, and adapt the login selectors.
3. Add the project pair in `playwright.config.ts`:
   ```ts
   { name: "admin-setup", testDir: "playwright/support/auth",
     testMatch: /admin\.setup\.ts/, timeout: 180_000,
     use: { ...devices["Desktop Chrome"], channel: "chrome" } },
   { name: "admin", testMatch: /admin\.spec\.ts/,
     dependencies: ["admin-setup"], timeout: 180_000,
     use: { ...devices["Desktop Chrome"], channel: "chrome",
            storageState: adminAuthFile } },
   ```
4. Write `playwright/e2e/admin.spec.ts` and run:
   ```powershell
   npx playwright test --project=admin
   ```

---

## 19. Coming from Cypress?

If you've used Cypress, here's the quick mental switch:

| Cypress | Playwright |
|---|---|
| Runs **inside** the browser | Runs in **Node**, drives the browser |
| Command chain, no `await` | Plain `async/await` on every step |
| `cy.visit(url)` | `await page.goto(url)` |
| `cy.get(sel)` | `page.locator(sel)` |
| `cy.contains(txt)` | `page.getByText(txt)` |
| `cy.get(sel).click()` | `await page.locator(sel).click()` |
| `cy.get(sel).type("hi")` | `await page.locator(sel).fill("hi")` |
| `cy.get(sel).should("be.visible")` | `await expect(loc).toBeVisible()` |
| `cy.intercept()` | `await page.route()` |
| `cy.request()` | `await request.newContext().get()` |
| `cy.session()` | `storageState` JSON via a setup project |
| `Cypress.env("X")` | `process.env.X` |
| `describe` / `it` | `test.describe` / `test` |

The biggest change: **you must `await` everything**.

---

## 20. Troubleshooting / FAQ

**Element not found / flaky tests.**
You forgot `await`, or you used `waitForTimeout` instead of a web-first assertion.
Use `await expect(locator).toBeVisible()`.

**Can I run tests in parallel?**
Not while page objects share `globalVariables.page` (one worker only). To
parallelize: stop using `setPage`/`globalVariables.page`, pass `page` into each
page-object method, then set `fullyParallel: true` and workers > 1 in the config.

**Prettier/line-ending lint errors on Windows.**
Run `npm run format` — it normalizes CRLF/LF and spacing.

**The Allure report is empty.**
The run must produce `allure-results-<runId>` first. If the run crashed before any
test executed, there's nothing to report.

**Where do my `console.log` / `comFunc` messages go?**
To the terminal **and** to `out.txt` in the run's `C:\LogFolder` folder.

**How do I watch the browser?**
`npm run pw:test:headed`, or add `--headed` to any command. Use `--debug` to step.

**How do I run only one test?**
`npx playwright test -g "TC01"` (matches the test title).

**`any` type warnings in lint.**
Expected for dynamic test data — they're warnings, not errors.

---

## 21. Glossary

- **Spec / test file** — a `.spec.ts` file containing tests, in `playwright/e2e/`.
- **Test** — one `test("name", async () => {})` case.
- **Fixture** — something Playwright hands your test, e.g. `page`.
- **Page** — the browser tab you drive.
- **Locator** — a description of how to find an element.
- **Action** — doing something (`click`, `fill`, `check`).
- **Assertion** — a check with `expect(...)` that auto-waits.
- **Hook** — `beforeEach` / `afterEach` setup/cleanup.
- **Project** — a named test group in the config (files + browser + auth).
- **storageState** — saved session (cookies + localStorage) for reuse.
- **Page Object (POM)** — a class holding one page's locators + actions.
- **Allure** — the reporting tool that produces the HTML report.
- **Smoke test** — a small, fast set of critical tests.
- **Regression test** — the full test set.

---

**You're ready.** Copy `playwright/e2e/example.spec.ts`, change the selectors to
match your app, run `npm run pw:test:headed`, and watch it go.
