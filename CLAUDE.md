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
  e2e/              ← UI specs (*.spec.ts, *.a11y.spec.ts)
  api/              ← API-layer specs (*.api.spec.ts)
  testdata/         ← JSON fixtures the specs read (users.json, …)
  support/          ← framework code, one folder per capability
    auth/               storageState setup + paths (git-ignored output)
    commonFunctions/    globalVariables · commonFunctions (comFunc) · loginLogout
    pageObjects/        one class per page (*-po.ts)
    api/apiClient.ts    HTTP calls with Page-Object-style logging
    a11y/a11yAudit.ts   dependency-free accessibility scan
    data/dataFactory.ts seeded realistic / boundary / adversarial values
    reporting/          allureRunContext · logFileReporter · runHistoryReporter
                        · analyzeHistory · globalTeardown
docs/
  README.md         ← index: what each document is, who writes it
  architecture.md · quickstart.md · roadmap.md
  pipeline/         ← working files skills read as input (scenarios, strategy)
  reports/          ← generated output for humans (run-report, flaky-log, a11y/)
  learning/         ← personal notes, not part of the framework
playwright.config.ts ← projects: one per spec group, plus `api` and `a11y`
.test-history/       ← append-only run history (flaky detection, trends)
.env                 ← runtime secrets (BASE_URL, APP_USER, APP_PASSWORD)
```

Two naming rules keep this from drifting back into a pile:

- `support/` holds **capabilities, one folder per concern** — a new capability is
  a new folder, never a loose file at the top of `support/`.
- `support/data/` **generates** values; `playwright/testdata/` **stores** them.

## Key Commands

```
npm run pw:test             # Run all tests (headless)
npm run pw:test:headed      # Run with visible browser
npm run pw:test:smoke       # Smoke tests only
npm run pw:test:api         # API-layer specs only
npm run pw:test:a11y        # Accessibility audit specs only
npm run history:analyze     # Flaky/stability stats across recent runs
npm run typecheck           # tsc --noEmit
npm run pw:test:ui          # Interactive Playwright UI
npm run pw:list             # List all tests
npm run report:open         # Open last Allure HTML report
npm run lint                # ESLint
npm run format              # Prettier
npm run skills:validate     # Lint .claude/skills (frontmatter, dead refs)
```

## Conventions

- Every spec imports `setPage` and calls it in `beforeEach`
- All logging via `comFunc.reportMessageInfo/Pass/Fail/Error`
- Test data always read from `playwright/testdata/*.json`
- Page Object classes use `globalVariables.page` (no page param threading)
- New spec → add matching project block in `playwright.config.ts`
- Credentials in `.env` only — never hardcode in source
- `fullyParallel: false` — one worker at a time (shared page handle)
- `reportMessageFail` only _logs_; call `comFunc.assertNoSoftFailures()` (e.g.
  in `afterEach`) to turn accumulated soft failures into a real test failure

## Adding a New Test

1. Add credentials/data to `playwright/testdata/users.json`
2. Create Page Object in `playwright/support/pageObjects/*-po.ts`
3. Create spec in `playwright/e2e/*.spec.ts`
4. Add project block in `playwright.config.ts` with `testMatch`
5. Run: `npx playwright test <spec>.spec.ts --headed --project=<name>`

## AI Authoring Pipeline (Claude Code)

`.claude/skills/README.md` is the catalog and the invariants every skill
inherits; `.claude/skills/TEMPLATE.md` is the scaffold and standard for
writing a new one. `npm run skills:validate` enforces both, and runs in CI as
the `lint-skills` job.

One scenario in, one passing spec out — see `docs/quickstart.md` for the exact
steps to follow, or `docs/architecture.md` for the full design (open
`docs/architecture.html` in a browser for the diagram-first version). Driving
this from VS Code + GitHub Copilot instead of Claude Code? Same pipeline, same
files — see `.github/copilot-instructions.md` and `docs/architecture.md` §12.

- **One-shot (authoring)**: `/ship-test <scenario>` (or just paste a scenario) —
  orchestrates everything below through isolated subagents, end to end.
- **One-shot (maintenance)**: `/autopilot [smoke|regression|spec]` — runs the
  suite, classifies what went red, heals selector rot, fixes test bugs, re-runs to
  prove it, and writes `docs/reports/run-report.md`. Hard limits keep it honest: one
  fix-and-re-run cycle, never reaches green by weakening a test, files app bugs
  to `docs/reports/app-bugs.md` instead of absorbing them, never commits. See
  `docs/architecture.md` §13.
- **Manual/batch stages**: `/create-scenarios` → `/test-strategy` →
  `/generate-tests` → `/review-tests`, backed by the `app-domain` and
  `playwright-best-practices` reference skills.
- **Bootstrapping a domain**: `/explore-app [url]` crawls the live app and
  drafts `app-domain` into `docs/pipeline/domain-draft.md` (plus proposed TCs and an
  app-findings list). It proposes; a human merges — see `docs/architecture.md` §16.
- **Beyond E2E**: `/generate-api-tests` writes the API tier `test-strategy` has
  always assigned (`npm run pw:test:api`); `/generate-testdata` produces seeded
  realistic/boundary/adversarial data so the Security and Edge Case lenses have
  something real to exercise; `/audit-a11y` runs the dependency-free
  accessibility scan and prioritises the findings (`npm run pw:test:a11y`).
- **Run history**: every run appends to `.test-history/runs.jsonl`.
  `/detect-flaky` reads it (via `npm run history:json`) to separate genuinely
  flaky tests from consistently-failing ones, and `/run-report` turns the last
  run into a plain-English digest for people who will never open Allure.
  `docs/architecture.md` §14.
- Playwright MCP is registered for Claude Code via `.mcp.json` (project root) —
  approve it once per machine. `generate-tests`/`ship-test` use it to verify
  selectors against the real page before writing a Page Object, not after.
- **Self-healing**: `/heal-test [spec]` semantically re-locates broken
  selectors after an app change instead of just retrying the old one — see the
  `heal-test` skill and `playwright-best-practices` §9. `generate-tests`'
  debug loop calls it automatically for locator-class failures. Applied fixes
  are logged to `docs/reports/healing-log.md`; ambiguous ones are never auto-applied.
- **CI**: `.github/workflows/playwright.yml` — full suite on every push,
  smoke on every PR, smoke daily at 03:00 UTC. `.githooks/` run the same
  format/lint/typecheck locally before a push leaves the machine. Every run
  uploads its HTML reports as artifacts, so a red run is diagnosable from the
  trace alone. `review` is optional AI enrichment, gated on `ANTHROPIC_API_KEY`
  as a repo secret (skipped cleanly if it's not set).
- **CD**: `.github/workflows/e2e-gate.yml` — the CD-facing half. An app's
  release pipeline calls it (`workflow_call`, or `repository_dispatch` from a
  non-Actions deploy system) to use this suite as a **promotion gate**, with
  per-environment secrets from GitHub Environments. `playwright.yml` also has
  an opt-in `publish-report` job that deploys the HTML report to Pages.
  Full write-up: `docs/cicd.md`; design notes: `docs/architecture.md` §11.

## Where This Could Go Next

`docs/roadmap.md` — Tiers 1 and 2 are complete and Tier 3 is all but done. What
is left: visual regression with AI-judged diffs (needs baseline image storage),
unit generation (deliberately out of scope — it belongs in the app repo), and
parallel-safe execution (blocked by the shared `globalVariables.page` handle,
which is a breaking refactor of every Page Object).

## Bootstrapping a New Project

This repo is a template — no step below touches app-specific code until you do:

1. Copy `.env.example` → `.env`, set `BASE_URL` (+ `APP_USER`/`APP_PASSWORD` if
   the app has a login).
2. Fill in every section of `.claude/skills/app-domain/SKILL.md` — app overview,
   user flows, business rules, data models. This is the one file every skill in
   the AI pipeline reads first. Don't start from a blank page: run
   `/explore-app` first and it will draft the whole thing from the live app
   into `docs/pipeline/domain-draft.md` for you to review and merge.
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
