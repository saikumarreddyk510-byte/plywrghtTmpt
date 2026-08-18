---
name: ship-test
description: Turn one plain-English test scenario into a fully implemented, passing Playwright spec — the single-prompt entry point for this framework. Chains scenario capture, layer classification, real-browser (MCP) implementation, and a scoped code review through isolated subagents with tiered models, so cost and latency stay low even after many runs in the same session. Use whenever the user describes a user flow to automate, says "add a test for X", pastes a TC-ID, or asks to turn a scenario into a spec.
argument-hint: [scenario description, or a TC-ID from docs/test-scenarios.md, or blank for the next unimplemented TC]
---

# Ship Test — One Prompt → One Passing Spec

You are the **orchestrator**. Your job is to turn `$ARGUMENTS` into a merged, passing
Playwright spec with the least total token spend — by doing the cheap parts yourself,
inline, and handing the expensive parts to isolated subagents that report back a
short summary instead of their full working context.

Never do steps 2–3 inline in this conversation. Every subagent read of
`app-domain`, `playwright-best-practices`, or existing spec/PO files must happen
**inside that subagent**, not here — that's what keeps this orchestrator's own
context (and therefore every subsequent `/ship-test` call in the same session)
cheap.

## Step 0 — Resolve the input (inline, no subagent)

- Scenario text given → this is the scenario.
- `TC-###` given → look it up in `docs/test-scenarios.md`.
- Blank → read `docs/test-scenarios.md`, pick the first TC-ID with no matching
  spec under `playwright/e2e/` (grep TC-IDs across specs first — don't open every
  file).
- Scenario doesn't describe a browser-observable user flow (it's a pure function,
  an API contract, or backend-only logic) → **stop here**, tell the user this
  belongs at Unit/API layer, not this pipeline. Don't force a UI test onto it.

## Step 1 — Fast triage (inline, no subagent — this is the main token saver)

1. **Formalize, don't re-derive.** If the input isn't already a `TC-###` block,
   write one directly using the template in the `create-scenarios` skill and
   append it to `docs/test-scenarios.md`. Don't run a full scenario sweep for one
   flow — that skill's "6 lenses / full suite" mode is for batch generation only.
2. **Classify the layer yourself**, using the Decision Rules from the
   `test-strategy` skill, in one line of reasoning. This pipeline only ships
   Playwright E2E, so the answer is E2E almost every time — confirm it, append one
   row to `docs/test-strategy.md`, and move on. Only invoke the full
   `test-strategy` skill as a subagent if the scenario is genuinely ambiguous
   across layers.
3. **Check for reuse** with `Grep`/`Glob` only (never a full read of every file):
   search `playwright/support/pageObjects/*-po.ts` for a class already covering
   the target page, and `playwright/e2e/*.spec.ts` for a spec already close to
   this flow. Note the single closest existing spec + PO pair — this is the
   pattern the build subagent will mirror instead of inventing structure from
   scratch.

## Step 2 — Build (delegate — foreground, default model, do not downgrade)

Spawn one subagent (`Agent`, `subagent_type: "general-purpose"`, no `model`
override — correctness matters most here, `run_in_background: false` because the
next step depends on its result). Give it, in the prompt itself (so it doesn't have
to rediscover them):

- The TC block from Step 1.
- The one closest existing spec + PO file path to mirror line-for-line in
  structure (import order, `beforeEach`, logging, naming).
- An explicit instruction to read the `playwright-best-practices` skill and the
  `app-domain` skill, then follow the `generate-tests` skill's
  **Write → Verify via Playwright MCP → Run → Debug loop** (cap 3 retries).
- **MCP discipline**: take one `browser_snapshot`/navigation per page under test to
  build the selector map, verify only the elements this scenario touches, then
  write the Page Object from that — don't re-snapshot the whole page after every
  single action.
- **Structural determinism**: copy the required spec/PO skeleton from the
  `playwright-best-practices` skill verbatim and only vary selectors, data, and
  assertions — don't redesign the shape of the file.
- Instruction to return **only**: files created/changed, TC-ID(s) covered, final
  pass/fail from the real run, and any app bugs found — not full file contents,
  not intermediate reasoning.

## Step 3 — Review (delegate — foreground, scoped to the new file only)

Spawn a second subagent (`Agent`, `subagent_type: "general-purpose"`,
`run_in_background: false`) with **only** the exact file paths Step 2 touched, and
the instruction to run the `review-tests` skill's checklist against those files
only — never the whole suite. Ask it to return only Critical/Important issues (max
5 lines each) plus the score. This scoping, not a cheaper model, is the safe way to
keep review fast — don't downgrade the review model unless the user passed
`--fast`.

## Step 4 — Fix loop (at most once)

If Step 3 returned any `[CRITICAL]` issue, spawn one more build subagent exactly
like Step 2, but scoped to just those fixes on the existing files. Re-review isn't
required after this — report the fix as applied and let the user re-run the review
skill later if they want a second pass.

## Step 5 — Report (inline, short)

Tell the user, in under 10 lines:
- TC-ID(s) shipped and the files touched.
- Pass/fail from the real browser run.
- Review score and any remaining non-critical issues.
- Any app bugs discovered (don't silently paper over a real bug with a workaround
  in the test).

## When *not* to use this skill

- Generating scenarios for a whole feature or the whole app → use `/create-scenarios`
  directly (batch mode).
- Re-running strategy across many existing scenarios → use `/test-strategy`
  directly.
- Auditing the whole existing suite → use `/review-tests` with no argument.

`/ship-test` is for the one-scenario-in, one-passing-spec-out loop; the four
underlying skills stay available individually for batch work and manual control.
