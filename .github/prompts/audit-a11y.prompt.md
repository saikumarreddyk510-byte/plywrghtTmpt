---
mode: agent
description: Run the dependency-free accessibility sweep and turn raw violations into a prioritised, WCAG-mapped fix list (mirrors the audit-a11y Claude Code skill).
---

Follow the process in `.claude/skills/audit-a11y/SKILL.md` exactly, including
its guard rails: state the gaps (colour contrast and screen-reader quality are
not covered by a structural DOM scan), fix the app rather than the test, and
rank findings by real user impact instead of raw rule severity.

Copilot-specific mechanics:
- The scan is `playwright/support/a11y/a11yAudit.ts` (no npm dependency); run
  it with `npm run pw:test:a11y`.
- Keyboard traversal, focus visibility, and focus management need interaction —
  drive those through the Playwright MCP server in `.vscode/mcp.json`.
- Report to `docs/reports/a11y-report.md`.

Page or flow to audit (blank = every flow in app-domain):
${input:task}
