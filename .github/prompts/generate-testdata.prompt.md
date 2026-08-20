---
mode: agent
description: Generate realistic, boundary, and adversarial test data from the app-domain data models and wire it into data-driven specs (mirrors the generate-testdata Claude Code skill).
---

Follow the process in `.claude/skills/generate-testdata/SKILL.md` exactly,
including its rules: seeded and deterministic (never `Math.random()`),
adversarial payloads only against an app the user owns, no real personal data,
and undocumented constraints get asked rather than guessed. Read it and the
Data Models section of `.claude/skills/app-domain/SKILL.md` first.

Copilot-specific mechanics:
- Generators live in `playwright/support/data/dataFactory.ts`. Use them;
  do not paste a second set of payloads into a spec.
- Fuzz loops are regression-tier: wrap them in `if (!process.env.SMOKE)` so the
  PR gate stays fast.

Model / form / field (blank = every model in app-domain):
${input:task}
