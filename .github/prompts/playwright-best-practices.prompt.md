---
mode: agent
description: Playwright TypeScript coding standard for this framework — locator priority, assertion patterns, Page Object conventions, wait strategies, logging, and the anti-patterns flagged in review. Use when writing, healing, or reviewing a spec or Page Object; it is the checklist /review-tests scores against (mirrors the playwright-best-practices Claude Code skill).
---

Read `.claude/skills/playwright-best-practices/SKILL.md` — it is the single
source of truth for coding standards in this repo and is used by both the
Claude Code and Copilot pipelines.

This skill is a **reference**, not a workflow. Typical ways to invoke it:

- **Before writing a spec** — read it to make sure every rule is applied from
  the start rather than caught in review.
- **During a `/review-tests` pass** — it is the checklist that review scores
  against; open both side-by-side.
- **While healing a locator** — §Locator Priority and §Self-Healing Policy
  (§9) govern which selectors are acceptable and at what confidence threshold.
- **Whenever an anti-pattern is flagged** — look up the rule number in the
  checklist and apply the canonical fix.

The two `.github/instructions/` files (`playwright-specs.instructions.md` and
`page-objects.instructions.md`) surface the most critical rules automatically
when you edit matching files — this prompt gives you the full standard on
demand.

What rule, section, or file do you want to apply the standard to?
${input:task}
