---
name: detect-flaky
description: Find tests that pass and fail without the code changing, using the run history in .test-history/runs.jsonl — hypothesises a cause (timing, ordering, shared state, data), proposes a targeted fix, and quarantines out of smoke only what it can justify. Use when the suite is "randomly" red, after a red run turns up a flake candidate, or on a periodic health check.
argument-hint: [spec file or test title to focus on — blank for the whole suite]
disable-model-invocation: true
---

# Detect Flaky — Make "Flaky" Measurable

Without history, "flaky" is a feeling. This skill starts from data: every run
appends one record per test to `.test-history/runs.jsonl` (RunHistoryReporter),
and `playwright/support/reporting/analyzeHistory.ts` turns that into pass rate, flip rate, duration spread,
and a dominant failure class per test.

## Input

`$ARGUMENTS` — a spec file or test title to focus on. Blank means the
whole suite.

## Step 1 — Get the numbers (do not compute them yourself)

```bash
npm run history:json -- --runs 30 --min-runs 3
```

Read the JSON. Do not re-derive the arithmetic in your head or by reading the
raw JSONL — the script is deterministic and its verdicts are reproducible;
your judgement is needed for *why*, not *how often*.

Verdicts it assigns:
| Verdict | Meaning | Your job |
|---|---|---|
| `flaky` | Same code, outcome flips between runs | Diagnose and fix — this skill |
| `consistently-failing` | Never passes | **Not flaky.** Treat it as a regression — read its trace in the Playwright HTML report |
| `stable` | No flips | Leave it alone |
| `insufficient-data` | Seen fewer than `--min-runs` times | Say so; do not guess |

If there is no history yet, say exactly that and stop. Do not label a test
flaky from a single red run — that is how real regressions get dismissed.

## Step 2 — Hypothesise the cause

For each flaky test, use the evidence you have (`dominantFailureClass`,
`lastErrorExcerpt`, duration spread, whether it flips in CI only) to pick the
most likely cause, then confirm it by reading the spec:

| Signal | Likely cause | Targeted fix |
|---|---|---|
| `locator` class, high duration variance | Racing the render — asserting before the element settles | Replace the implicit wait with `expect(locator).toBeVisible()` / `waitFor` on the real post-condition |
| `timeout`, worse in CI than locally | Slower environment, fixed sleep, or an animation | Remove `waitForTimeout`, wait for state; raise only the specific timeout, never the global one |
| `assertion` on data that changes | Test depends on live/shared data (today's date, top row of a list, another test's record) | Make the test create and own its data, or assert a shape rather than a value |
| Fails only after another spec | Shared state — `globalVariables` is process-wide and `fullyParallel: false` means everyone shares one page | Reset in `beforeEach`; never depend on a previous test's leftovers |
| `network` class | Third-party/analytics call or a genuinely flaky backend | Route-block the third party; a flaky backend is an **app** finding, not a test fix |
| Passes on retry every time | Real timing bug, hidden by retries | Fix it. Retries hide flakiness; they do not remove it |

State the hypothesis **and the evidence for it**. "Probably timing" with no
evidence is a guess dressed as a diagnosis.

## Step 3 — Fix, do not paper over

Allowed fixes, in order of preference:
1. Wait on the real post-condition instead of a proxy for it.
2. Make the test own its data.
3. Isolate shared state.
4. Block a third-party request that has nothing to do with the assertion.

**Not** allowed as a "fix":
- Adding `waitForTimeout`. Ever. (`playwright-best-practices` §7.)
- Raising the global timeout to hide a race.
- Adding retries to a specific test to make it pass.
- Weakening an assertion so it can no longer detect the bug it was written for.

If the honest answer is "the app itself is non-deterministic here", that is an
**app finding**. File it as such; do not absorb an application bug into the
test suite.

## Step 4 — Quarantine, with a receipt

Quarantine only a test you could not fix in this pass **and** whose flakiness
you can characterise. Mechanically: move it out of the smoke tier by wrapping
it in `if (!process.env.SMOKE)`, or `test.fixme()` with a one-line reason.

Every quarantine gets a row in `docs/reports/flaky-log.md`:

| Date | Test | Pass rate | Flip rate | Hypothesis | Action | Owner | Re-check by |
|---|---|---|---|---|---|---|---|

A quarantine with no re-check date is a deletion with extra steps. Anything
quarantined for more than two weeks with no progress should be raised for a
decision: fix it, or delete it and admit the coverage is gone.

## Step 5 — Report
Flaky count and trend vs. the previous check, the top 3 by flip rate with their
hypothesis, what you fixed, what you quarantined (and why), and any app-level
non-determinism you found. Keep it under 15 lines.

## Guardrails

- **No history, no verdict.** A single red run is not evidence of flakiness,
  and calling a real regression "flaky" is how a suite loses trust it took
  months to earn.
- **Never reach green by seeing less.** No `waitForTimeout`, no raised global
  timeout, no per-test retries, no weakened assertion. Every one of those makes
  the flake invisible rather than absent.
- **`consistently-failing` is not flaky.** It is a regression; report it
  unchanged rather than quarantining it.
- **App non-determinism is an app finding.** File it; do not absorb it into the
  suite as a "more tolerant" assertion.
- **Every quarantine has a re-check date and an owner.** A quarantine without
  one is a deletion with extra steps.

## Done means

- Verdicts came from `npm run history:json`, not from your own arithmetic.
- Every flaky test has a hypothesis *and* the evidence for it.
- Fixes target the real post-condition, and you re-ran to show they hold.
- Everything quarantined has a `docs/reports/flaky-log.md` row with a re-check
  date.
- Lost coverage from quarantines is stated explicitly, not netted out of the
  pass rate.

## When *not* to use this skill

- One run went red and you want to know why → read its trace and screenshot in
  the Playwright HTML report; flakiness is a claim about many runs, and this
  skill has nothing to read yet.
- The history shows the test never passes → that is a regression, not a flake.
- You want the whole suite run, diagnosed, and fixed in one pass → `/autopilot`,
  which calls this skill when it has the history to justify it.
