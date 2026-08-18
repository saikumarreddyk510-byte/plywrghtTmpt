---
mode: agent
description: Generate functional test scenarios from domain knowledge using 6 thinking lenses (mirrors the create-scenarios Claude Code skill).
---

Follow the process in `.claude/skills/create-scenarios/SKILL.md` exactly. It
is the single source of truth for this step — used by both the Claude Code
and Copilot pipelines. Read it, and `.claude/skills/app-domain/SKILL.md`
(stop and say so if that file is still the empty template — scenarios written
against it are guesses, not tests), before doing anything else.

Copilot-specific mechanics: none beyond the above — this step is pure
reading/writing, no browser or MCP tool needed. Output goes to
`docs/test-scenarios.md`, same as the Claude Code pipeline.

Feature/flow to generate scenarios for (blank = full application):
${input:task}
