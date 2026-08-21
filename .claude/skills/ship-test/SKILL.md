---
name: ship-test
description: Turn one plain-English test scenario into a fully implemented, passing Playwright spec — the single-prompt entry point for this framework. Chains scenario capture, layer classification, real-browser (MCP) implementation, and a scoped code review through isolated subagents with tiered models, so cost and latency stay low even after many runs in the same session. Use whenever the user describes a user flow to automate, says "add a test for X", pastes a TC-ID, or asks to turn a scenario into a spec.
argument-hint: [scenario description, or a TC-ID from docs/pipeline/test-scenarios.md, or blank for the next unimplemented TC]
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
- `TC-###` given → look it up in `docs/pipeline/test-scenarios.md`.
- Blank → read `docs/pipeline/test-scenarios.md`, pick the first TC-ID with no matching
  spec under `playwright/e2e/` (grep TC-IDs across specs first — don't open every
  file).
- Scenario doesn't describe a browser-observable user flow (it's a pure function,
  an API contract, or backend-only logic) → **stop here**, tell the user this
  belongs at Unit/API layer, not this pipeline. Don't force a UI test onto it.

## Step 1 — Fast classification (inline, no subagent — the main token saver)

1. **Formalize, don't re-derive.** If the input isn't already a `TC-###` block,
   write one directly using the template in the `create-scenarios` skill and
   append it to `docs/pipeline/test-scenarios.md`. Don't run a full scenario sweep for one
   flow — that skill's "6 lenses / full suite" mode is for batch generation only.
2. **Classify the layer yourself**, using the Decision Rules from the
   `test-strategy` skill, in one line of reasoning. This pipeline only ships
   Playwright E2E, so the answer is E2E almost every time — confirm it, append one
   row to `docs/pipeline/test-strategy.md`, and move on. Only invoke the full
   `test-strategy` skill as a subagent if the scenario is genuinely ambiguous
   across layers.
3. **Check for reuse** with `Grep`/`Glob` only (never a full read of every file):
   search `playwright/support/pageObjects/*-po.ts` for a class already covering
   the target page, and `playwright/e2e/*.spec.ts` for a spec already close to
   this flow. Note the single closest existing spec + PO pair — this is the
   pattern the build subagent will mirror instead of inventing structure from
   scratch.

## Step 2 — Build (delegate — foreground, default model, do not downgrade)

Spawn one subagent (`Agent`, `subagent_type: "test-builder"`, no `model`
override — correctness matters most here, `run_in_background: false` because the
next step depends on its result). `test-builder`'s own definition
(`.claude/agents/test-builder.md`) already knows its process and tool limits
— give it only what's specific to this run:

- The TC block from Step 1.
- The one closest existing spec + PO file path to mirror line-for-line in
  structure (import order, `beforeEach`, logging, naming).

`test-builder` has no `Agent` tool — it cannot itself spawn further
subagents, so this stays a flat two-hop chain, not a tree.

## Step 3 — Review (delegate — foreground, scoped to the new file only)

Spawn a second subagent (`Agent`, `subagent_type: "test-reviewer"`,
`run_in_background: false`) with **only** the exact file paths Step 2
touched. `test-reviewer` has no `Edit` or `Bash` — it structurally cannot
modify what it's reviewing, only report on it, which is what makes its
output trustworthy without re-checking it yourself. This scoping (one file,
not the whole suite), not a cheaper model, is the safe way to keep review
fast — don't downgrade the review model unless the user passed `--fast`.

## Step 4 — Fix loop (at most once)

If Step 3 returned any `[CRITICAL]` issue, spawn one more `test-builder`
subagent exactly like Step 2, but scoped to just those fixes on the existing
files. Re-review isn't required after this — report the fix as applied and
let the user re-run `/review-tests` later if they want a second pass.

## Step 5 — Report (inline, short)

Tell the user, in under 10 lines:
- TC-ID(s) shipped and the files touched.
- Pass/fail from the real browser run.
- Review score and any remaining non-critical issues.
- Any app bugs discovered (don't silently paper over a real bug with a workaround
  in the test).

## Guardrails

- **Never do Steps 2–3 inline.** Every read of `app-domain`,
  `playwright-best-practices`, or existing spec files happens inside a
  subagent. That is the whole cost model: this orchestrator stays cheap so the
  tenth `/ship-test` in a session costs what the first did.
- **At most one fix cycle.** If `[CRITICAL]` issues survive it, report them
  rather than looping.
- **Never report a pass the build subagent did not actually observe.** Relay
  its real result, including red.
- **App bugs are reported, never papered over** with a workaround in the test.
- **No commits, no pushes.** You edit the working tree and report.

## Done means

- The TC exists in `docs/pipeline/test-scenarios.md` and has a strategy row.
- The spec, Page Object, and config entry exist and the spec was run for real.
- A scoped review ran against the new files, and any `[CRITICAL]` finding was
  either fixed or reported as outstanding.
- The final report is under 10 lines and states the real pass/fail.

## When *not* to use this skill

- Generating scenarios for a whole feature or the whole app → use `/create-scenarios`
  directly (batch mode).
- Re-running strategy across many existing scenarios → use `/test-strategy`
  directly.
- Auditing the whole existing suite → use `/review-tests` with no argument.

`/ship-test` is for the one-scenario-in, one-passing-spec-out loop; the four
underlying skills stay available individually for batch work and manual control.
