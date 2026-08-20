---
mode: agent
description: Write Playwright TypeScript E2E tests with real-browser validation and a self-healing debug loop (mirrors the generate-tests Claude Code skill).
---

Follow the process in `.claude/skills/generate-tests/SKILL.md` exactly. It is
the single source of truth for this step — used by both the Claude Code and
Copilot pipelines. Read it, `.claude/skills/playwright-best-practices/SKILL.md`,
`.claude/skills/app-domain/SKILL.md`, and `docs/pipeline/test-strategy.md` before
writing anything.

Copilot-specific mechanics:
- Real-browser verification uses the Playwright MCP server already registered
  in `.vscode/mcp.json` (the same server Claude Code's pipeline uses via
  `.mcp.json`) — use it to confirm selectors against the live page before
  writing the Page Object, and again while debugging a failure.
- Run tests from the integrated terminal: `npx playwright test <spec>.spec.ts
  --headed --project=<name>`. Do not stop after writing — the test is only
  done when it passes for real, in a real browser.
- Locator-class failures (timeout / not found / strict-mode violation) during
  the debug loop → follow `/heal-test`'s procedure instead of guessing.

Feature/flow to implement:
${input:task}
