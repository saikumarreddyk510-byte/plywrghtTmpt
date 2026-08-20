---
mode: agent
description: Run the suite, triage what went red, fix what is safely fixable, re-run to prove it, and report — the closed maintenance loop (mirrors the autopilot Claude Code skill).
---

Follow the process in `.claude/skills/autopilot/SKILL.md` exactly, and treat
its hard limits as absolute: at most one fix-and-re-run cycle, never make a
test pass by weakening it, app bugs get filed rather than absorbed, nothing is
committed or pushed, and nothing is quarantined off a single red run.

Copilot-specific mechanics:
- Copilot has no subagent equivalent of the Claude Code delegation steps — run
  the triage and fix stages inline by following
  `.github/prompts/triage-failure.prompt.md`, `.github/prompts/heal-test.prompt.md`,
  and `.github/prompts/generate-tests.prompt.md` in that order, on the failures
  each one actually owns.
- Every applied heal still gets a row in `docs/reports/healing-log.md`; app bugs still
  go to `docs/reports/app-bugs.md`; the digest still lands in `docs/reports/run-report.md`.

Scope — smoke | regression | a spec file (blank = smoke):
${input:task}
