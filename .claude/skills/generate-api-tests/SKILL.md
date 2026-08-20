---
name: generate-api-tests
description: Write Playwright API-layer specs for the rows test-strategy assigned to API/Integration — validation rules, error contracts, authz, and response budgets — using the ApiClient wrapper, verified by actually running them. Use when test-strategy flags the ice-cream-cone anti-pattern, when a rule is being tested through the UI that has no UI reason to be, or when asked for API tests directly.
argument-hint: [endpoint, feature, or TC-ID — blank for every API row in docs/pipeline/test-strategy.md]
disable-model-invocation: true
---

# API Test Generator

You write the tier the strategy has always assigned and nothing ever
implemented. `test-strategy` has flagged "everything at E2E = ice cream cone"
since the day it was written; this is the skill that makes the pyramid real.

## Input

`$ARGUMENTS` — an endpoint, feature, or TC-ID. Blank means every row in the
API/Integration table of `docs/pipeline/test-strategy.md` with no file assigned.

## Knowledge Sources
Read these BEFORE writing anything:
1. `docs/pipeline/test-strategy.md` — the **API/Integration** table. That is your work list.
2. `app-domain` skill — endpoints, data models, roles, and the rules to assert.
3. `playwright/api/example.api.spec.ts` — the pattern to mirror line for line.
4. `playwright/support/api/apiClient.ts` — the wrapper. Do not hand-roll
   `request.newContext()`; the wrapper is what keeps API logs readable in the
   same `out.txt`/Allure output as the UI tests.

## What belongs here (and what does not)

| Test it at API | Not at API |
|---|---|
| Field validation and error codes | Anything about rendering or layout |
| Authorisation: role X gets 403 | "Is the button hidden" (that is E2E/component) |
| Contract shape — required fields, types | Multi-page user journeys |
| Idempotency, pagination, filtering | Anything you cannot reach without a browser |
| Response-time budgets | Visual or accessibility checks |

If a scenario needs a browser to be meaningful, hand it back to
`/generate-tests` instead of forcing it down a layer. Pushing tests down is
right; pushing them somewhere they cannot see the behaviour is not.

## Process: Write → Run → Fix

### Step 1 — Discover the contract
Prefer, in order:
1. An OpenAPI/Swagger doc if the app publishes one — read it, do not guess.
2. Endpoints documented in `app-domain`.
3. Network calls observed by `/explore-app` (`docs/pipeline/exploration-findings.md`).

If none of those exist, capture the real calls once through Playwright MCP by
driving the UI flow and reading the network activity, then write the spec
against what you observed — and note in the spec header that the contract was
observed, not documented.

### Step 2 — Write the spec
- File: `playwright/api/<feature>.api.spec.ts`.
- Config: the `api` project in `playwright.config.ts` already matches
  `*.api.spec.ts` — no new project block needed unless the endpoints need
  different auth.
- One `ApiClient` per test via `beforeEach`, disposed in `afterEach`.
- Set `globalVariables.testName` from `testInfo.title` so log lines are tagged.
- Every step logged with `comFunc.reportMessageInfo` before it runs, exactly as
  a Page Object step would be.
- Test data from `playwright/testdata/*.json` or the `dataFactory` — never
  inline literals, never real customer data.
- Assert **status, then shape, then values** — in that order. A test that only
  asserts 200 passes against an endpoint returning an empty body.

### Step 3 — Authentication
If the endpoints need auth, get the token the same way the app does (a login
call through `ApiClient`, or reuse `playwright/.auth/*.json`). Never hardcode a
token, and never commit one — `.env` only, same rule as every other credential
in this framework.

### Step 4 — Run it for real
```bash
npx playwright test --project=api
```
Not done until green. If a test fails:
- **4xx/5xx you did not expect** → check `app-domain`. Documented behaviour
  says the app is right → your test is wrong, fix the test. App contradicts
  documented behaviour → **report it as a possible app bug**, do not weaken the
  assertion to make the red go away.
- **Contract mismatch** (field missing, type changed) → that is exactly what
  this layer exists to catch. Report it; do not loosen the assertion.

### Step 5 — Close the loop
- Update `docs/pipeline/test-strategy.md`: mark the implemented TC rows with their file.
- If a rule you just covered at API level is *also* covered by an E2E test that
  exists only for that rule, say so and recommend deleting the E2E one. Moving
  a test down the pyramid only pays off if the slow duplicate goes away.

## Report back
TC-IDs covered, file(s) created, real pass/fail, any contract mismatches or app
bugs found, and any E2E tests now redundant.

## Guardrails

- **Assert status, then shape, then values — in that order.** A test that only
  checks `200` passes against an endpoint returning an empty body.
- **Never loosen an assertion to clear a red.** A contract mismatch is the
  exact class of bug this layer exists to catch; reporting it *is* the result.
- **Never hardcode or commit a token.** `.env` and `playwright/.auth/*.json`
  only, same rule as every other credential here.
- **Never point these specs at production**, and never at a system the user
  does not own.
- **No real customer data**, ever — `dataFactory` or `playwright/testdata/*.json`.
- **Do not force a UI-dependent scenario down to this layer.** If it needs a
  browser to be observed, hand it back to `/generate-tests`.

## Done means

- Every spec has actually been run with `npm run pw:test:api` and its real
  result reported.
- Each test asserts status, shape, and values.
- `docs/pipeline/test-strategy.md` rows are marked with their file — only for
  tests that pass.
- Contract mismatches and app bugs are reported, with the request and the
  observed response.
- Any E2E test now made redundant is named, so moving the test down the pyramid
  actually pays off.

## When *not* to use this skill

- The behaviour cannot be observed without a browser → `/generate-tests`.
- No API rows are assigned yet → `/test-strategy` first; this skill implements
  a work list, it does not decide the layer.
- You need the endpoint contract discovered from scratch → `/explore-app` can
  capture the real calls first.
