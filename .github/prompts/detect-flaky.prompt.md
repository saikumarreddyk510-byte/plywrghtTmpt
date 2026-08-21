---
mode: agent
description: Find tests that flip between pass and fail using .test-history run history, hypothesise a cause, and quarantine only what is justified (mirrors the detect-flaky Claude Code skill).
---

Follow the process in `.claude/skills/detect-flaky/SKILL.md` exactly,
including the forbidden "fixes" (no `waitForTimeout`, no raised global
timeouts, no per-test retries, no weakened assertions) and the requirement that
every quarantine gets a row with a re-check date in `docs/reports/flaky-log.md`.

Copilot-specific mechanics:
- Start from `npm run history:json -- --runs 30 --min-runs 3`. Do not re-derive
  the statistics by reading `.test-history/runs.jsonl` yourself — the script is
  deterministic, your judgement is needed for *why* a test flips.
- A `consistently-failing` verdict is not flakiness; it is a regression — read
  the run's trace in the Playwright HTML report instead of quarantining it.

Spec or test to focus on (blank = whole suite):
${input:task}
