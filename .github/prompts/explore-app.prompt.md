---
mode: agent
description: Crawl the live app and draft the app-domain skill (user flows, business rules, data models, selector inventory) plus proposed scenarios — mirrors the explore-app Claude Code skill.
---

Follow the process in `.claude/skills/explore-app/SKILL.md` exactly, including
its guard rails: read-mostly exploration, never overwrite `app-domain`, never
invent a business rule you did not observe. It is the single source of truth
for this step, shared by the Claude Code and Copilot pipelines. Read it and the
current `.claude/skills/app-domain/SKILL.md` before you start.

Copilot-specific mechanics:
- Use the Playwright MCP server registered in `.vscode/mcp.json` for every page
  snapshot.
- Output goes to the same three files as the Claude Code pipeline:
  `docs/pipeline/domain-draft.md`, `docs/pipeline/test-scenarios.md` (append only, under the
  "Proposed by /explore-app (unreviewed)" heading), and
  `docs/pipeline/exploration-findings.md`.

Area to explore (blank = BASE_URL and the primary nav):
${input:task}
