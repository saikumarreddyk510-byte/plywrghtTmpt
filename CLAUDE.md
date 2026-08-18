# PlayWrightAI — Playwright Test Automation

## Project Overview
A reusable E2E test automation framework + AI authoring pipeline (Playwright +
TypeScript + Claude Code). Not bound to any one target app — point `BASE_URL` at
your app, fill in `.claude/skills/app-domain/SKILL.md`, and this repo is ready to
generate and run tests for it. Pattern: Page Object Model (POM) with Allure
reporting.

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

## AI Authoring Pipeline (Claude Code)
One scenario in, one passing spec out — see `docs/quickstart.md` for the exact
steps to follow, or `docs/architecture.md` for the full design (open
`docs/architecture.html` in a browser for the diagram-first version). Driving
this from VS Code + GitHub Copilot instead of Claude Code? Same pipeline, same
files — see `.github/copilot-instructions.md` and `docs/architecture.md` §12.

- **One-shot**: `/ship-test <scenario>` (or just paste a scenario) — orchestrates
  everything below through isolated subagents, end to end.
- **Manual/batch stages**: `/create-scenarios` → `/test-strategy` →
  `/generate-tests` → `/review-tests`, backed by the `app-domain` and
  `playwright-best-practices` reference skills.
- Playwright MCP is registered for Claude Code via `.mcp.json` (project root) —
  approve it once per machine. `generate-tests`/`ship-test` use it to verify
  selectors against the real page before writing a Page Object, not after.
- **Self-healing**: `/heal-test [spec]` semantically re-locates broken
  selectors after an app change instead of just retrying the old one — see the
  `heal-test` skill and `playwright-best-practices` §9. `generate-tests`'
  debug loop calls it automatically for locator-class failures. Applied fixes
  are logged to `docs/healing-log.md`; ambiguous ones are never auto-applied.
- **Failure triage**: `/triage-failure [spec]` reads a red run's trace,
  screenshots, and logs and classifies it — selector rot (→ `heal-test`), test
  bug (→ `generate-tests`), app bug/regression (filed, test left untouched),
  or environment flake (flagged, not silently "fixed"). Wired into CI (below).
- **CI**: `.github/workflows/playwright.yml` — smoke on every PR, full
  regression nightly. On failure, `triage-baseline` posts the raw evidence
  with **no AI vendor required**; `review`/`triage` are optional AI
  enrichment on top of that, gated on `ANTHROPIC_API_KEY` as a repo secret
  (skipped cleanly if it's not set). Details: `docs/architecture.md` §11.

## Where This Could Go Next
`docs/roadmap.md` — proposed AI enhancements (API/Unit generators, an
app-exploration agent, flaky-test detection, and more), tiered by leverage.

## Bootstrapping a New Project
This repo is a template — no step below touches app-specific code until you do:
1. Copy `.env.example` → `.env`, set `BASE_URL` (+ `APP_USER`/`APP_PASSWORD` if
   the app has a login).
2. Fill in every section of `.claude/skills/app-domain/SKILL.md` — app overview,
   user flows, business rules, data models. This is the one file every skill in
   the AI pipeline reads first.
3. If the app has a login, adapt the selectors in
   `playwright/support/commonFunctions/loginLogout.ts` and
   `playwright/support/auth/example.setup.ts` (both are already marked with the
   block to edit). No login → delete the `auth/` setup pair and its project
   entry in `playwright.config.ts`.
4. Replace `playwright/support/pageObjects/home-po.ts` and
   `playwright/e2e/example.spec.ts` with your first real page/spec, or keep them
   as the smoke-test baseline.
5. Run `/ship-test <a scenario describing your app's first flow>` and let the
   pipeline take it from there.
