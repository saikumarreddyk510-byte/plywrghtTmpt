---
mode: agent
description: Repair a Playwright spec whose locators no longer match the live app, semantically re-locating each broken element (mirrors the heal-test Claude Code skill).
---

Follow the process in `.claude/skills/heal-test/SKILL.md` exactly, including
its confidence tiers and the "what this is for (and isn't)" scope guard. It
is the single source of truth for this step — used by both the Claude Code
and Copilot pipelines. Read it, `.claude/skills/playwright-best-practices/SKILL.md`
§9, and `.claude/skills/app-domain/SKILL.md` before touching anything.

Copilot-specific mechanics:
- Use the Playwright MCP server registered in `.vscode/mcp.json` for the
  live-DOM snapshot (prefer the failed run's trace if one exists under
  `test-results/` — `trace: "retain-on-failure"` is set in
  `playwright.config.ts`).
- Every High/Medium-confidence fix still gets a row in
  `docs/healing-log.md`, same file and format as the Claude Code pipeline —
  don't start a second log.

Spec to heal (blank = the most recently failed run):
${input:task}
