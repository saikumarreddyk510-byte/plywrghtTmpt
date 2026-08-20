---
mode: agent
description: Turn the last run plus run history into a short plain-English digest of what broke and why it matters (mirrors the run-report Claude Code skill).
---

Follow the structure in `.claude/skills/run-report/SKILL.md` exactly,
including its honesty rules: lead with the verdict, business language in the
body with TC-IDs in parentheses, never call a failure a flake without citing
its pass rate, and count quarantined tests as lost coverage rather than as
passes.

Copilot-specific mechanics:
- Inputs are `npm run history:json -- --runs 10`, the newest
  `C:\LogFolder\<specName>_<ts>_<runId>\out.txt`, and
  `.claude/skills/app-domain/SKILL.md` for the business translation.
- Write `docs/reports/run-report.md` (overwrite — it is a snapshot, not a log).

Run to report on (blank = most recent):
${input:task}
