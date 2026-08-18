---
mode: agent
description: Review Playwright TypeScript test files for quality, best-practice compliance, and correctness (mirrors the review-tests Claude Code skill).
---

Follow the process in `.claude/skills/review-tests/SKILL.md` exactly,
including its full checklist. It is the single source of truth for this step
— used by both the Claude Code and Copilot pipelines. Read it,
`.claude/skills/playwright-best-practices/SKILL.md`, and
`.claude/skills/app-domain/SKILL.md` before reviewing anything.

Copilot-specific mechanics: none — this is a static review, no browser or MCP
tool needed. Output goes to `docs/review-report.md`, same as the Claude Code
pipeline. If any file under review appears in `docs/healing-log.md`, also
apply the Self-Healing checklist items from `playwright-best-practices` §9.

File(s) to review (blank = all of `playwright/e2e/*.spec.ts`):
${input:task}
