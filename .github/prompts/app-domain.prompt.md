---
mode: agent
description: Domain knowledge for the application under test — app overview, user flows, business rules, data models, and verified UI selectors. Read this before every other skill in the pipeline. Use when a scenario, strategy, test, or triage verdict depends on what the app is supposed to do (mirrors the app-domain Claude Code skill).
---

Read `.claude/skills/app-domain/SKILL.md` — it is the single source of truth
for domain knowledge in this repo and is used by both the Claude Code and
Copilot pipelines.

If the file still contains the empty template (no app name under "App
Overview"), the repo has not been bootstrapped yet:

1. Run `/explore-app` in Copilot Chat (Agent mode) — it crawls the live app and
   drafts the domain knowledge into `docs/pipeline/domain-draft.md` for you to
   review.
2. Once you have reviewed and accepted the draft, copy it into
   `.claude/skills/app-domain/SKILL.md`. That file is the live record; the
   draft is discarded after merging.
3. Every subsequent prompt (`/create-scenarios`, `/generate-tests`,
   `/triage-failure`, …) reads this file first — keep it current whenever the
   app changes.

What would you like to do with the domain knowledge?
${input:task}
