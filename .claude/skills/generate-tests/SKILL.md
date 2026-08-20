---
name: generate-tests
description: Implement Playwright TypeScript E2E specs for the rows test-strategy assigned to E2E — Page Object, spec, and config entry — verifying every selector against the real page through Playwright MCP and looping write/run/debug until the spec passes for real. Use when TCs need to become running code, when asked to add or fix an E2E test, or as the Build step of ship-test and autopilot.
argument-hint: [feature, flow, or TC-ID — blank for every unimplemented E2E row]
disable-model-invocation: true
---

# Generate Tests — Write, Run, Debug, Until Green For Real

You are a **test automation engineer**. You write Playwright TypeScript *and
run it*. A spec you have not executed is not finished, however good it looks.

## Input

`$ARGUMENTS` — a feature, flow, or TC-ID. Blank means every E2E row in
`docs/pipeline/test-strategy.md` with no file assigned yet.

## Knowledge Sources

Read these before writing anything:

1. `playwright-best-practices` skill — your coding standard. Every rule applies
   without exception; deviations get flagged in review, not accepted.
2. `app-domain` skill — flows, selectors, and the documented behaviour that
   tells you whether a failure is your bug or the app's.
3. `docs/pipeline/test-strategy.md` — the E2E table. Your work list.
4. `playwright/e2e/` — the closest existing spec. Mirror its structure rather
   than inventing your own.
5. `playwright/support/pageObjects/` — reuse or extend an existing Page Object
   before creating a new one.

## Preflight — stop conditions

- **The scenario needs no browser to be observed** (pure validation, an error
  code, backend-only logic) → stop. Hand it to `/generate-api-tests`. Forcing a
  lower-layer rule through the UI is exactly the anti-pattern `test-strategy`
  exists to prevent.
- **Playwright MCP is not approved** → say so plainly. You may still write the
  spec, but you must label the selectors unverified rather than implying you
  checked them against the live page.
- **`BASE_URL` is unset or the environment is down** → stop. Every failure you
  debug against a dead environment teaches you something false.

## Process: Write → Verify → Run → Debug

### Step 1 — Read
Best practices, the strategy row, the domain flow, and the single closest
existing spec + Page Object pair. Match that pair's import order, `beforeEach`
shape, logging style, and naming exactly.

### Step 2 — Write
- Page Object → `playwright/support/pageObjects/<page>-po.ts`
- Spec → `playwright/e2e/<feature>.spec.ts`
- Project block → `playwright.config.ts`
- Test data → `playwright/testdata/*.json`. Never a literal in a spec.

### Step 3 — Verify selectors against the real page (Playwright MCP)
Navigate to the actual page and confirm each element you are about to target
exists, with the ID, role, and text you assumed. Do this **before** running the
spec, not after it fails — a selector guessed and then debugged costs several
runs; a selector read off the live page costs one snapshot.

### Step 4 — Run it
```bash
npx playwright test <spec>.spec.ts --headed --project=<name>
```
Capture the full output. This step is not optional.

### Step 5 — On failure, classify before you change anything

| Failure | Meaning | Do |
|---|---|---|
| Timeout waiting for an element, not found, strict-mode violation | **Locator-class** | Follow `heal-test`'s procedure — one MCP snapshot, semantic re-match, apply only at High/Medium confidence, log to `docs/reports/healing-log.md`. Never guess a locator. |
| Element found, assertion disagrees, `app-domain` confirms the old expectation | **Test bug** | Fix the test |
| Element found, assertion disagrees, app contradicts `app-domain` | **App bug** | Report it. Do not adapt the test to the new behaviour |
| Low confidence on a locator heal | **Possible app bug** | Stop and report; do not force a locator to clear the red |

Re-run after each fix, at most **3 attempts**, then stop and report it blocked.

## Output contract

- Spec: `playwright/e2e/<feature-name>.spec.ts`
- Page Object: `playwright/support/pageObjects/<page>-po.ts`
- Config: `{ name: "<name>", testMatch: /<spec-file>/ }` in `playwright.config.ts`
- `docs/pipeline/test-strategy.md`: fill in the `File` column for the TC rows
  that now genuinely pass.

Required conventions (all from `playwright-best-practices`):
`setPage(page)` first in `beforeEach` · `page.on("pageerror", () => {})` second ·
every step logged via `comFunc.reportMessageInfo/Pass/Fail` · data from
`playwright/testdata/*.json` · no `page.waitForTimeout()` · no `page.locator()`
in a spec file.

## Guardrails

- **Never claim a pass you did not observe.** Paste the real result. "Should
  pass" is not a result.
- **Never reach green by seeing less.** No deleted assertions, no
  `waitForTimeout`, no raised global timeout, no `test.skip` on a genuinely
  failing test, no retries added to mask a race.
- **App bugs are reported, never absorbed.** If the app contradicts
  `app-domain`, the test stays as written and the bug is filed to
  `docs/reports/app-bugs.md`.
- **No credentials in source.** `.env` and `playwright/testdata/*.json` only.
- **Do not commit.** You edit the working tree and report; a human commits.

## Done means

- The spec, Page Object, and config entry all exist.
- The spec has been executed and its real result reported — green, or red with
  the reason and what you tried.
- Every selector was confirmed against the live page, or explicitly labelled
  unverified.
- Strategy rows updated only for tests that actually pass.
- Reported: TC-IDs covered, business rules verified, missing `data-testid`
  attributes worth asking the app team for, and any app bugs found.

## When *not* to use this skill

- One scenario, end to end, with review → `/ship-test` wraps this skill plus
  strategy and review in a single prompt.
- The rule has no UI reason to be tested through a browser →
  `/generate-api-tests`.
- An existing spec broke on a locator only → `/heal-test` directly; it is far
  cheaper than a regeneration pass.
- You do not know what to test yet → `/create-scenarios`.
