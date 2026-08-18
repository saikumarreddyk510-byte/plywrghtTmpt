---
mode: agent
description: Diagnose why a Playwright run went red — selector rot, test bug, app bug/regression, or environment flake — and route the fix (mirrors the triage-failure Claude Code skill).
---

Follow the process in `.claude/skills/triage-failure/SKILL.md` exactly,
including its classification table and the "never label flake without
evidence" guardrail. It is the single source of truth for this step — used
by both the Claude Code and Copilot pipelines. Read it,
`.claude/skills/heal-test/SKILL.md`, `.claude/skills/generate-tests/SKILL.md`,
and `.claude/skills/app-domain/SKILL.md` before diagnosing anything.

Copilot-specific mechanics:
- Evidence lives under `C:\LogFolder\<specName>_<ts>_<runId>\` (out.txt,
  Allure results) and `test-results/` at the repo root (raw traces,
  screenshots) for a local run — same paths the Claude Code pipeline reads.
- Delegate selector-rot findings to `/heal-test` and test-logic findings to
  `/generate-tests`, exactly as the skill specifies — don't re-diagnose what
  those steps already own.

Spec or evidence directory (blank = the most recent failed run):
${input:task}
