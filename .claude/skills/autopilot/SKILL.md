---
name: autopilot
description: Run the suite, diagnose everything that went red, fix what is safely fixable, re-run to prove it, and produce a plain-English report — the closed maintenance loop the individual skills only cover one step of. Use for a nightly/weekly suite health pass, after an app release, or when asked to "check the suite and fix what you can".
argument-hint: [smoke | regression | a spec file — blank for smoke]
disable-model-invocation: true
---

# Autopilot — Run, Diagnose, Fix, Prove, Report

`/ship-test` closes the authoring loop: scenario in, passing spec out. This
closes the **maintenance** loop: a suite that runs, notices it broke, works out
why, fixes what it legitimately can, and tells a human what it did — in one
prompt instead of five.

You are the **orchestrator**. Do the cheap steps inline; delegate the expensive
ones to subagents so this conversation stays affordable across a long run.

## Hard limits — these are the whole reason this is safe to run

1. **At most one fix-and-re-run cycle.** If it is still red after that, stop and
   report. An agent looping on a red suite burns tokens and eventually starts
   weakening assertions to reach green.
2. **Never make a test pass by weakening it.** No deleted assertions, no
   `waitForTimeout`, no raised global timeouts, no added retries, no
   `test.skip` on a genuinely failing test. If the only way to green is to see
   less, the answer is "still red", and that is a perfectly good outcome.
3. **App bugs are reported, never absorbed.** If the app contradicts
   `app-domain`, the test stays as it is and the bug gets written up.
4. **No commits, no pushes, no PRs.** You edit the working tree and report. A
   human commits.
5. **Nothing is quarantined on one red run.** Flake claims need run history
   (`/detect-flaky`), not a hunch.

## Input

`$ARGUMENTS` — `smoke`, `regression`, or a spec path. Blank means `smoke`.

## Step 0 — Scope (inline)
`$ARGUMENTS`: `smoke` (default) → `npm run pw:test:smoke`; `regression` →
`npm run pw:test`; a spec path → that spec only. Say which you are running and
why before you start.

## Step 1 — Run (inline, Bash)
Run it. Capture the full output. Record: total, passed, failed, flaky,
duration. RunHistoryReporter appends this run to `.test-history/runs.jsonl`
automatically — you do not have to record anything yourself.

**All green?** Skip to Step 5 and report, including a one-line trend from
`npm run history:analyze`. A green run still deserves a report; that is how
anyone knows the loop actually ran.

## Step 2 — Classify each failure (delegate)
Spawn **one** subagent (`general-purpose`, foreground) for the whole failure
set — not one per failure. Give it: the failing test names, the run output
excerpt, the evidence paths (`test-results/`, the `C:\LogFolder\<run>\`
folder), and the table below. Ask it to return a table only:

| Test | Class (selector rot / test bug / app bug / flake candidate) | Evidence | Confidence |

Classify on the signal, not the symptom:

| Signal | Class |
|---|---|
| `TimeoutError` waiting for an element, "element not found", strict-mode violation | **Selector rot** |
| Element found, but the assertion disagrees, **and** `app-domain` confirms the old expected behaviour is still correct | **Test bug** |
| Element found, assertion disagrees, **and** the app now contradicts `app-domain`'s documented rule for that flow | **App bug** — do not touch the test |
| Passed on a prior run, fails now, no relevant change, failure looks timing-sensitive (race, animation, network jitter) | **Flake candidate** — never force green with sleeps or weakened assertions |
| Page never loaded / wrong URL / setup failed before the flow started | **Environment** — check `BASE_URL` and credentials before anything else |

Cross-check its verdicts against `npm run history:json -- --runs 10` yourself,
inline. A test the history shows failing every run is **not** a flake, whatever
a single run suggests — history beats a single-run impression.

## Step 3 — Fix what is safely fixable (delegate, in this order)

- **Selector rot** → one `test-builder` subagent following
  `.claude/skills/heal-test/SKILL.md`. High/Medium confidence only; Low
  confidence is proposed in the report, never applied. Every applied heal gets
  its row in `docs/reports/healing-log.md`.
- **Test bug** (logic/data wrong, app behaves as documented) → one
  `test-builder` subagent scoped to those specs, following
  `.claude/skills/generate-tests/SKILL.md`.
- **App bug** → no code change. Write it up in `docs/reports/app-bugs.md`: expected
  (quoting `app-domain`), observed, evidence path, affected TC-IDs.
- **Flake candidate** → no code change now. Note it for `/detect-flaky`, which
  has the history to judge it.

If nothing falls into the two fixable buckets, skip Step 4 — do not re-run to
watch the same failures again.

## Step 4 — Prove it (inline, Bash)
Re-run **only the affected specs**. Report the real result, whatever it is.
This step exists because "fix applied" and "fix works" are different claims,
and only the second one is worth anything.

## Step 5 — Report (delegate or inline)
Produce the digest per `.claude/skills/run-report/SKILL.md` → `docs/reports/run-report.md`,
extended with an autopilot section:

```markdown
## Autopilot actions
- Healed: <test> — <old locator> → <new locator> (confidence, docs/reports/healing-log.md)
- Fixed: <test> — <what was wrong in the test>
- Filed: <n> app bug(s) — docs/reports/app-bugs.md
- Left red: <test> — <why it was not safe to fix automatically>
- Proposed, not applied: <low-confidence heals awaiting a human>
```

Then tell the user, in under 12 lines: green/red before and after, what you
changed, what you filed, what still needs them. Name the next command if there
is an obvious one (`/detect-flaky`, `/heal-test <spec>`).

## Done means

- The suite ran, and the real before/after numbers are reported — not a
  prediction of them.
- Every failure is classified, and every classification has a named action:
  healed, fixed, filed, or left red with a reason.
- At most one fix-and-re-run cycle was spent.
- `docs/reports/run-report.md` is written, with the autopilot section.
- Nothing is green because it was skipped, quarantined, or weakened.

## When *not* to use this skill
- You want a new test written → `/ship-test`.
- You already know which spec broke and how → `/heal-test` or `/generate-tests`
  directly; autopilot's overhead only pays off across a whole suite.
- The app is mid-deploy or the environment is down. A red suite against a dead
  environment is an environment finding, and every "fix" you make against it
  will be wrong. Check, then stop.
