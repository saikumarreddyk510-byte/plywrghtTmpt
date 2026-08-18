---
name: triage-failure
description: Diagnose why a Playwright run went red — classifies each failure as selector rot, a test bug, an app bug/regression, or environment flake using the run's trace, screenshots, and logs, then routes the fix instead of leaving a red run for a human to puzzle over. Use after a test run fails, when CI reports red, or when asked "why did this fail?".
argument-hint: [spec file or evidence directory, or blank for the most recent failed run]
disable-model-invocation: true
---

# Triage Failure — Root-Cause a Red Run

You are diagnosing a **failed run**, not writing new tests. Your job is to say
*why* it failed, with evidence, and either fix it safely or hand it to a human
with enough context that they don't have to re-investigate from scratch.

## Knowledge Sources
1. `app-domain` skill — the documented behavior to check the app against.
2. `heal-test` skill — the procedure to delegate locator-class failures to.
3. `generate-tests` skill — the procedure to delegate test-logic fixes to.
4. The run's evidence (see "Finding the evidence" below).

## Finding the evidence

- **Local run**: the most recently modified `C:\LogFolder\<specName>_<ts>_<runId>\`
  folder — `out.txt` (terminal log with the failure text), `allure-results/`,
  and (if Java was available) `allure-report/`. Raw traces and screenshots are
  in `test-results/` at the repo root (`trace: "retain-on-failure"` /
  `screenshot: "only-on-failure"` in `playwright.config.ts`) — these get
  overwritten by the *next* run, so triage stale evidence before running
  anything else.
- **CI run**: `$ARGUMENTS` (or the working directory, if invoked from the
  `triage` job in `.github/workflows/playwright.yml`) points at the downloaded
  `ci-artifacts/allure-results` and `ci-artifacts/test-results` — the CI job
  fetches these from the same run's `test` job before invoking this skill.

## Process

### Step 1 — Read the failure
From `out.txt` / the Allure result: which test(s) failed, the exact error
message, and the stack trace's first Playwright-code frame (not the internal
frames).

### Step 2 — Classify

| Signal | Classification | Route to |
|---|---|---|
| `TimeoutError` waiting for an element, "element not found", strict-mode violation | **Selector rot** | `heal-test` — follow its procedure in full, report its outcome here |
| Element found, but assertion/content/value disagrees, **and** `app-domain` confirms the old expected behavior is still correct | **Test bug** | `generate-tests`' debug/fix flow — the test has a stale expectation or bad data, fix it |
| Element found, assertion disagrees, **and** the app now contradicts `app-domain`'s documented rule for that flow | **App bug / regression** | Do not touch the test. File it (see Output) |
| Passed on a prior run, fails now, with no relevant code or app change, and/or the failure looks timing-sensitive (race, animation, network jitter) | **Environment / flake candidate** | Flag it — don't rewrite assertions or add sleeps to force green. Note it as a candidate for `docs/roadmap.md`'s (not yet built) flaky-detection tier |
| Page never loaded / wrong URL / setup failed before the flow even started | **Environment or app bug** | Check `BASE_URL`/credentials first (env misconfiguration), then `app-domain` for whether the flow itself changed |

Never guess past this table. If a failure doesn't clearly fit one row, say so
explicitly rather than forcing a classification — an honest "unclear, here's
what I checked" is more useful than a confident wrong answer.

### Step 3 — Act, per classification
- **Selector rot** → run through `heal-test`'s confidence tiers exactly as
  that skill defines them. Its outcome (healed / flagged / left alone) is
  this triage's outcome for that test.
- **Test bug** → fix via the normal `generate-tests` debug loop, re-run to
  confirm, note what changed and why.
- **App bug / regression** → do not modify the test. Produce a structured bug
  report: flow, expected (per `app-domain`), actual, evidence (screenshot/trace
  reference), and the exact business rule contradicted.
- **Flake candidate** → do not modify the test unless a concrete, specific
  wait-strategy problem is identifiable (e.g. a missing `waitForURL` before an
  assertion that clearly races the navigation) — then fix *that*, not the
  assertion. Otherwise, report it as a candidate and stop.

## Output

One report, whether posted to a PR, a CI job summary, or printed locally:

```markdown
### Triage: <spec file>

| Test | Classification | Confidence | Action | Evidence |
|------|----------------|------------|--------|----------|
| TC01 - ... | Selector rot | High | Healed (see docs/healing-log.md) | trace.zip |
| TC02 - ... | App bug | — | Filed below, test untouched | screenshot-2.png |

**App bug detail (TC02):** <flow> — app-domain says <expected>, app currently
does <actual>. Contradicts the documented rule: "<rule text>".
```

Guardrail: never auto-close anything as "flake" without the evidence line next
to it. A flake label with no evidence is exactly the failure mode that erodes
trust in a test suite — see `docs/roadmap.md`'s "What stays human-gated"
section.
