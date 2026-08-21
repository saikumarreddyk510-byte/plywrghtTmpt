---
mode: agent
description: One prompt in, one passing spec out — orchestrates scenario capture, layer check, implementation, and review end to end (mirrors the ship-test Claude Code skill).
---

Follow the process in `.claude/skills/ship-test/SKILL.md` exactly — its five
steps (resolve input → classify → build → review → fix-once → report). It is
the single source of truth for this step — used by both the Claude Code and
Copilot pipelines.

Copilot-specific mechanics:
- Steps 2 (build) and 3 (review) in the Claude Code version run as isolated
  subagents for token/context efficiency (`docs/architecture.md` §5) — that
  specific mechanism is Claude Code's `Agent` tool and has no direct Copilot
  equivalent as of this writing. Run the same five steps sequentially in this
  chat instead; the process and file outputs are identical, this repo just
  won't get the same context-isolation benefit documented there when driven
  from Copilot. If Copilot Chat gains an equivalent delegation mechanism
  later, prefer it.
- Real-browser verification (step 2) uses the Playwright MCP server already
  registered in `.vscode/mcp.json`.

Scenario (plain English), a TC-ID, or blank for the next unimplemented TC in
`docs/pipeline/test-scenarios.md`:
${input:task}
