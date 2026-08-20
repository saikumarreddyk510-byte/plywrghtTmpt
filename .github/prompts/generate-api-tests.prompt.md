---
mode: agent
description: Write Playwright API-layer specs for the API/Integration rows in docs/pipeline/test-strategy.md, using the ApiClient wrapper (mirrors the generate-api-tests Claude Code skill).
---

Follow the process in `.claude/skills/generate-api-tests/SKILL.md` exactly,
including the "what belongs here" table — hand browser-dependent scenarios back
to `generate-tests` instead of forcing them down a layer. Read it,
`.claude/skills/app-domain/SKILL.md`, and
`playwright/api/example.api.spec.ts` (the pattern to mirror) first.

Copilot-specific mechanics:
- Use `playwright/support/api/apiClient.ts` — do not hand-roll
  `request.newContext()`; the wrapper is what keeps API logs in the same format
  as the UI tests.
- The `api` project in `playwright.config.ts` already matches `*.api.spec.ts`,
  so no new project block is needed. Verify with
  `npx playwright test --project=api` — a spec you have not run is not done.

Endpoint / feature / TC-ID (blank = every API row in docs/pipeline/test-strategy.md):
${input:task}
