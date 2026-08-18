# PlayWrightAI — repo-wide Copilot instructions

This file is the GitHub Copilot–native counterpart to `CLAUDE.md`. Same repo,
same conventions, same AI pipeline — read this before any chat request in this
repo, the same way Claude Code auto-loads `CLAUDE.md`.

## Project Overview
A reusable E2E test automation framework + AI authoring pipeline (Playwright +
TypeScript). Not bound to any one target app — point `BASE_URL` at your app,
fill in `.claude/skills/app-domain/SKILL.md`, and this repo is ready to
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

## Conventions
- Every spec imports `setPage` and calls it in `beforeEach`
- All logging via `comFunc.reportMessageInfo/Pass/Fail/Error`
- Test data always read from `playwright/testdata/*.json`
- Page Object classes use `globalVariables.page` (no page param threading)
- New spec → add matching project block in `playwright.config.ts`
- Credentials in `.env` only — never hardcode in source
- `fullyParallel: false` — one worker at a time (shared page handle)

Full detail lives in `.claude/skills/playwright-best-practices/SKILL.md` —
read it before writing or reviewing any spec or Page Object. Two path-scoped
instruction files apply parts of it automatically: `.github/instructions/
playwright-specs.instructions.md` when editing `playwright/e2e/**`, and
`.github/instructions/page-objects.instructions.md` when editing
`playwright/support/pageObjects/**`.

## The AI pipeline — same process, driven from Copilot Chat instead of Claude Code

This repo's pipeline (scenario → strategy → implementation → review, plus
self-healing and failure triage) is defined once, in `.claude/skills/*/SKILL.md`
— that's the single source of truth, read by whichever tool is driving. The
files under `.github/prompts/*.prompt.md` are thin pointers at those same
definitions, invoked as `/name` in Copilot Chat (Agent mode) exactly like
Claude Code's slash commands:

| Prompt | Same as Claude Code skill | Use for |
|---|---|---|
| `/create-scenarios` | `create-scenarios` | Turn domain knowledge into TC-### scenarios |
| `/test-strategy` | `test-strategy` | Assign scenarios to the right test layer |
| `/generate-tests` | `generate-tests` | Write + verify + run + debug a spec, for real, in a browser |
| `/review-tests` | `review-tests` | Checklist review against `playwright-best-practices` |
| `/heal-test` | `heal-test` | Repair a locator that stopped matching after an app change |
| `/triage-failure` | `triage-failure` | Diagnose why a run went red before touching anything |
| `/ship-test` | `ship-test` | One scenario in, one passing spec out, end to end |

Real-browser verification (in `generate-tests`/`ship-test`/`heal-test`) uses
the Playwright MCP server already registered in `.vscode/mcp.json` — the same
server Claude Code's own pipeline uses via `.mcp.json` at the repo root. One
app, two MCP registrations (one per tool's config format), same server.

`app-domain` (`.claude/skills/app-domain/SKILL.md`) ships as an empty
template — every prompt above expects it filled in first. See "Bootstrapping"
below.

Full architecture and rationale: `docs/architecture.md` (or
`docs/architecture.html` for the diagram-first version) — §12 covers this
Copilot-parity layer specifically. Proposed-but-not-yet-built enhancements:
`docs/roadmap.md`.

## Bootstrapping a New Project
This repo is a template — no step below touches app-specific code until you do:
1. Copy `.env.example` → `.env`, set `BASE_URL` (+ `APP_USER`/`APP_PASSWORD` if
   the app has a login).
2. Fill in every section of `.claude/skills/app-domain/SKILL.md` — app overview,
   user flows, business rules, data models. This is the one file every prompt
   above reads first.
3. If the app has a login, adapt the selectors in
   `playwright/support/commonFunctions/loginLogout.ts` and
   `playwright/support/auth/example.setup.ts` (both are already marked with the
   block to edit). No login → delete the `auth/` setup pair and its project
   entry in `playwright.config.ts`.
4. Replace `playwright/support/pageObjects/home-po.ts` and
   `playwright/e2e/example.spec.ts` with your first real page/spec, or keep them
   as the smoke-test baseline.
5. Run `/ship-test <a scenario describing your app's first flow>` in Copilot
   Chat (Agent mode) and let the pipeline take it from there.

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
