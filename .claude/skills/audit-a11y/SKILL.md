---
name: audit-a11y
description: Run the dependency-free accessibility sweep over the app's real pages, then turn raw violations into a prioritised, actionable fix list mapped to WCAG criteria — plus the keyboard and focus checks a DOM snapshot cannot make. Use when asked about accessibility, before an a11y sign-off, or when adding a11y coverage to an existing suite.
argument-hint: [page name or URL — blank for every flow documented in app-domain]
disable-model-invocation: true
---

# Accessibility Audit

The scan is the easy half and it is already written
(`playwright/support/a11y/a11yAudit.ts` — no npm dependency, runs in the page).
Your job is the half that needs judgement: which violations actually block a
user, which are noise, and what the fix is.

## Input

`$ARGUMENTS` — a page name or URL. Blank means every page on a user flow
documented in `app-domain`.

## Knowledge Sources
1. `playwright/support/a11y/a11yAudit.ts` — the rules that exist and the
   documented **Known gaps** (contrast, keyboard traps). Do not claim coverage
   the scan does not have.
2. `playwright/e2e/example.a11y.spec.ts` — the spec pattern to mirror.
3. `app-domain` skill — User Flows. Audit the pages real users traverse, not
   every URL you can reach.
4. `docs/reports/a11y/*.json` — previous results, for trend.

## Process

### Step 1 — Choose the pages
From `app-domain`'s User Flows, take the pages on the critical journeys, plus
any page with a form. Add them to `PAGES_TO_AUDIT` in the a11y spec (or create
`<feature>.a11y.spec.ts` for a feature-scoped audit).

### Step 2 — Run the scan
```bash
npm run pw:test:a11y
```
Results land in `docs/reports/a11y/<page>.json`. The suite fails only on `critical` by
default — that threshold is deliberate, so do not raise it as your first move.

### Step 3 — Cover what the DOM scan cannot (via Playwright MCP)
These need interaction, so drive them live:
- **Keyboard traversal**: Tab through the primary flow. Can every interactive
  element be reached and activated by keyboard? Does focus ever get trapped?
- **Focus visibility**: is the focused element visibly indicated at each stop?
- **Focus management**: after opening a modal, does focus move into it — and
  back to the trigger on close?
- **Skip link**: is there a way past repeated nav to the main content?

Record what you tested and what you observed. "Not tested" is an acceptable
answer; "assumed fine" is not.

### Step 4 — Prioritise (this is the part that matters)
Rank every finding by **user impact**, not by rule severity:

| Priority | Test |
|---|---|
| P0 | Blocks a user from completing a critical flow (unlabelled submit button, keyboard trap, unreachable control) |
| P1 | Makes a flow significantly harder (missing form label, no focus indicator, meaningless link text) |
| P2 | Degrades experience or violates a criterion without blocking anything (heading order, missing landmark) |
| Noise | Technically a violation, no real user impact — say so plainly and explain why, do not pad the list |

Ten instances of the same missing-alt pattern in one component is **one**
finding with a count, not ten findings. Padding an a11y report is how it gets
ignored.

### Step 5 — Write the report
To `docs/reports/a11y-report.md`:

```markdown
# Accessibility Audit — <date>

## Summary
<n> critical · <n> serious · <n> moderate across <n> pages.
Trend vs. <previous date>: <better/worse, with the number>.

## Findings
| Pri | Rule | WCAG | Where | Impact on a real user | Fix |
|-----|------|------|-------|----------------------|-----|

## Not covered by this audit
- Colour contrast — needs pixel analysis; not in the dependency-free scan.
- Screen-reader announcement quality — needs a real AT pass with a human.

## Recommended next step
<One action.>
```

Map each finding to its WCAG 2.1 success criterion (e.g. `1.1.1 Non-text
Content`, `4.1.2 Name, Role, Value`) — that is the language the people who have
to fix it will be held to. If you are unsure of the exact criterion, say so
rather than inventing a number.

## Guardrails
- **State the gaps.** Contrast and screen-reader quality are not covered here.
  A report that implies full WCAG coverage from a structural DOM scan is worse
  than no report — it creates false confidence in a compliance context.
- **Fix the app, not the test.** If a control has no accessible name, the fix
  is in the app. Do not "fix" the finding by making the test look elsewhere;
  the missing name is the bug, and it is also why the test could not find it.
- **A11y findings are app bugs**, so they go to the app team the same way any
  other app bug does — not into the test backlog.

## Done means

- Every page in scope was scanned, and the keyboard/focus checks the scan
  cannot make were driven live — or explicitly listed as not tested.
- Findings are grouped by pattern, ranked by user impact, and mapped to a WCAG
  2.1 criterion.
- `docs/reports/a11y-report.md` states plainly what this audit does *not* cover.
- No finding was closed by changing a test instead of the app.

## When *not* to use this skill

- You need a compliance sign-off. A structural DOM scan is not a WCAG audit;
  contrast and screen-reader quality still need a human with real assistive
  technology. Say so rather than letting this stand in for it.
- A spec is failing because a control has no accessible name → that is an app
  finding this skill reports, not a locator problem for `/heal-test`.
- You want a11y coverage added to an existing feature spec → `/generate-tests`;
  this skill audits, it does not author feature tests.
