---
mode: agent
description: Analyze test scenarios and assign optimal test pyramid layers — Unit/API/Component/E2E (mirrors the test-strategy Claude Code skill).
---

Follow the process in `.claude/skills/test-strategy/SKILL.md` exactly. It is
the single source of truth for this step — used by both the Claude Code and
Copilot pipelines. Read it, `docs/pipeline/test-scenarios.md`, and
`.claude/skills/app-domain/SKILL.md` before doing anything else.

Copilot-specific mechanics: none — pure analysis and writing, no browser or
MCP tool needed. Output goes to `docs/pipeline/test-strategy.md`, same as the Claude
Code pipeline.

Feature to analyze (blank = the entire application):
${input:task}
