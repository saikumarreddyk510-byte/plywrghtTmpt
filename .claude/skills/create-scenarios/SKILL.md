---
name: create-scenarios
description: Generate functional test scenarios from the documented domain by applying six thinking lenses — happy path, business rules, security, negative, edge cases, UI state — and write them to docs/pipeline/test-scenarios.md as numbered TC blocks. Use when starting coverage for a new feature, when a release added behaviour nothing tests yet, or when asked what should be tested. For a single scenario you already know, use ship-test instead.
argument-hint: [feature name — blank for the full suite]
disable-model-invocation: true
---

# Create Scenarios — Six Lenses Over the Documented Domain

You are a **functional test designer**: you think like a real user *and* like a
malicious one. You produce scenarios, not code — no spec is written here, and
no selector is chosen. Turning a TC into a passing spec is `/ship-test`'s job.

## Input

`$ARGUMENTS` — a feature or flow name. Blank means every flow in `app-domain`.

## Knowledge Sources

Read these before writing a single TC:

1. `app-domain` skill — app overview, user flows, business rules, data models.
   This is your only source of truth about the app.
2. `playwright/support/pageObjects/` — flows already modelled in code.
3. `playwright/e2e/` — specs that already exist, so you do not re-propose
   covered ground.
4. `docs/pipeline/test-scenarios.md` — TCs already proposed, and the highest
   number currently used in each range.

## Preflight — stop conditions

Stop and say so rather than proceeding if:

- **`app-domain` is still the empty template or has no Business Rules.**
  Scenarios derived from an empty domain are guesses with TC numbers on them.
  Tell the user to run `/explore-app` first, or fill the skill in by hand.
- **`$ARGUMENTS` names a feature `app-domain` does not document.** Do not
  invent the feature's behaviour. Say which flows *are* documented and ask.

## Process

### Step 1 — Establish the baseline
Grep `docs/pipeline/test-scenarios.md` for existing TC-IDs and record the
highest number in each range. Grep `playwright/e2e/` for TC-IDs already
implemented. New TCs continue the numbering; you never renumber an existing one,
because spec titles and `docs/pipeline/test-strategy.md` rows both reference
them by ID.

### Step 2 — Apply all six lenses to every flow in scope

| Lens | Question | Range |
|------|----------|-------|
| Happy Path | What is the expected successful journey? | TC-001–099 |
| Business Rules | What documented domain rule must hold? | TC-100–199 |
| Security | Can an unauthorised user reach or manipulate this? | TC-200–299 |
| Negative / Error | What happens on invalid input or wrong state? | TC-300–399 |
| Edge Cases | What are the boundary values and limits? | TC-400–499 |
| UI State | Conditional displays, loading, empty, disabled states? | TC-500–599 |

Apply **all six** to each flow. A lens that genuinely yields nothing for a flow
gets one line saying so — that is a finding, not an omission to hide.

### Step 3 — Write each TC

```
### TC-<NNN>: <Title>
**Category**: <Happy Path | Business Rule | Security | Negative | Edge Case | UI State>
**Priority**: <P0 | P1 | P2 | P3>
**Preconditions**: <what must be true before the test runs>
**Steps**: <numbered actions>
**Expected Results**: <observable outcome to verify>
**Business Rule**: <the rule from app-domain this traces to>
**Suggested Layer**: <E2E | API | Component | Unit>
```

Priority means blast radius, not effort: **P0** blocks a core revenue or access
flow, **P1** breaks a documented rule, **P2** degrades a secondary flow, **P3**
is cosmetic or rare.

## Output contract

Append to **`docs/pipeline/test-scenarios.md`** — never overwrite it.
`/test-strategy` reads this file next.

## Guardrails

- **Every TC traces to something documented.** Cite the `app-domain` rule or the
  observed behaviour it came from. A scenario with no traceable source is a
  guess, and a suite full of guesses fails for reasons nobody can adjudicate.
- **Never invent a business rule to justify a scenario.** If you suspect a rule
  exists but `app-domain` does not state it, write it under an
  `## Open questions` heading instead of asserting it as an expected result.
- **Expected Results must be observable.** "The order is processed correctly" is
  not testable; "the order appears in the Orders list with status `Placed`" is.
- **Never renumber or rewrite an existing TC.** Superseded ones are marked, not
  edited out from under the specs referencing them.
- **Security-lens scenarios target this app only** and assert that it *defends*
  itself — rejects the input, returns 403, does not leak a stack trace. They are
  never a script for attacking a system the user does not own.

## Done means

- Every flow in scope has been through all six lenses.
- Every new TC has a unique ID in the right range, a priority, and a traceable
  source.
- `docs/pipeline/test-scenarios.md` is appended to, not rewritten.
- You reported: TCs added per lens, flows covered, and any open questions the
  domain could not answer.

## When *not* to use this skill

- You already know the one scenario you want as a test → `/ship-test`, which
  formalises a single TC inline without a full sweep.
- `app-domain` is empty or stale → `/explore-app` first; this skill has nothing
  to reason over until then.
- You want layer assignments for existing scenarios → `/test-strategy`.
