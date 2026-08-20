---
name: run-report
description: Turn the last run's results and the run history into a short plain-English digest — what broke, which business flows are affected, what changed since the previous run, and what to do next — written for people who will never open the Allure report. Use after a run, before a release, or when asked "how is the suite doing?".
argument-hint: [run folder or "last" — blank uses the most recent run]
disable-model-invocation: true
---

# Run Report — What Broke, and Why It Matters

Allure is for engineers debugging a test. This is for everyone who just needs
to know whether the release is safe. Different audience, different document.

## Input

`$ARGUMENTS` — a run folder, or `last`. Blank uses the most recent run.

## Knowledge Sources
1. `npm run history:json -- --runs 10` — per-test pass/flip rates and the last
   status of everything. This is your trend data.
2. The most recent `C:\LogFolder\<specName>_<ts>_<runId>\out.txt` — the
   terminal log, with the framework's `[INFO]/[PASS]/[FAIL]` lines.
3. `allure-results-*/` — per-test detail if you need it (do not paste raw JSON
   into the report).
4. `app-domain` skill — to translate "TC-101 failed" into "customers cannot see
   facility hours for DFW". This translation is the entire value of the report.
5. `docs/pipeline/test-scenarios.md` — TC-ID → business flow mapping.

## The report

Write to `docs/reports/run-report.md` (overwrite; it is a snapshot, not a log) and
print the same content back to the user.

```markdown
# Run Report — <date> · <branch> · <smoke|regression>

## Verdict
<One sentence. Ship / do not ship / ship with a known issue. Say which.>

## Numbers
<passed>/<total> passed · <failed> failed · <flaky> flaky · <duration>
Change since last run: <+/- passes, new failures, fixed failures>

## What broke, in business terms
- **<Business flow>** — <what a user would experience>. (TC-xxx, <spec file>)
  Cause: <selector rot | test bug | app bug | flake>, per triage.

## Fixed since last run
- <flow> — was failing on <date>, passing now.

## Watch list
- <test> — flaky, passed <n>/<m> recent runs. See docs/reports/flaky-log.md.

## Recommended next step
<One action, named and assigned to a skill or a human.>
```

## Rules that keep this honest

- **Lead with the verdict.** A reader who stops after one line must still get
  the answer.
- **Business language in the body, TC-IDs in parentheses.** "Facility hours are
  not displayed for DFW (TC-004)" — not "facilities.spec.ts:88 assertion
  failed".
- **Never call a failure a flake without evidence.** If the run history shows a
  consistent failure, it is a regression, and reporting it as flake is how a
  suite loses the trust it takes months to earn. Cite the pass rate.
- **Do not report a pass rate as improved when tests were skipped or
  quarantined** — count quarantined tests explicitly as lost coverage, on their
  own line. Green because you stopped looking is not green.
- **No raw stack traces, no HTML, no attachments.** Link to the Allure report
  and the trace file for anyone who wants them.
- **Under one screen.** If the failure list is long, group by business flow and
  give a count; detail belongs in triage output, not here.

## Optional: post it
If the user asks for it in a PR or a chat channel, keep exactly this structure —
it is short enough to paste as-is. Never post anything containing credentials,
tokens, customer data, or internal URLs that are not already public in the repo.

## Done means

- The verdict is the first line, and it is one of ship / do not ship / ship
  with a known issue.
- Every failure is described in business terms, with its TC-ID in parentheses.
- The trend against the previous run is stated with a number.
- Quarantined and skipped tests are counted as lost coverage on their own line,
  never netted into the pass rate.
- `docs/reports/run-report.md` is written and fits on one screen.

## When *not* to use this skill

- You need to know *why* something failed → `/triage-failure`; this report
  states what broke and who it affects, it does not root-cause.
- You want the failures fixed as well as reported → `/autopilot`, which ends by
  producing this report anyway.
- No run has happened yet. Report on a real run, not an expected one.
