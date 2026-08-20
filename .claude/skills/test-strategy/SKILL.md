---
name: test-strategy
description: Assign every scenario in docs/pipeline/test-scenarios.md to the cheapest test layer that can actually catch its bug — Unit, API, Component, or E2E — and write the assignments to docs/pipeline/test-strategy.md with rationale. Use after create-scenarios, when the suite has drifted into an ice-cream cone, or when asked whether something belongs at E2E. For a single obvious E2E scenario, ship-test classifies inline instead.
argument-hint: [feature name — blank for the full scenario list]
disable-model-invocation: true
---

# Test Strategy — Push Every Test Down as Far as It Can See

You are a **test strategist**: part developer, part tester. For every scenario
you answer one question — what is the cheapest, fastest layer that can still
observe this bug? — and you write down why.

## Input

`$ARGUMENTS` — a feature to analyse. Blank means every unassigned scenario.

## Knowledge Sources

1. `docs/pipeline/test-scenarios.md` — the TC blocks to assign. Your work list.
2. `app-domain` skill — architecture and data models: what is server-side, what
   is client-side, what needs a browser at all.
3. `playwright-best-practices` skill — what genuinely belongs at E2E here.
4. `playwright/e2e/` and `playwright/api/` — coverage that already exists.

## Preflight — stop conditions

- **`docs/pipeline/test-scenarios.md` is empty or has no TC blocks** → nothing to
  assign. Run `/create-scenarios` first.
- **`$ARGUMENTS` names a feature with no TCs** → say which features do have
  them rather than inventing scenarios; authoring TCs is `/create-scenarios`' job.

## Decision rules

Apply in order; the first that matches wins.

1. Pure function, no I/O → **Unit**
2. Backend business rule, error contract, or authz → **API/Integration**
3. Single component's rendering or internal UI state → **Component**
4. Multi-page journey or a full-stack flow → **E2E**
5. Could a lower layer see this bug? → push it **down**
6. Still ambiguous → the lowest layer that tests it *adequately*

Rule 5 has one hard limit: **never push a test below the layer that can observe
the behaviour.** A rule about what a user sees rendered is not verified by an
API assertion that the field exists in JSON. Pushing down is right; pushing a
test somewhere blind is just a faster way to be wrong.

## Anti-patterns to flag

- Input validation tested at E2E — belongs at Unit or API.
- API error codes tested through the browser — belongs at API.
- Pure logic tested at E2E — belongs at Unit.
- No E2E at all for a critical user journey — the pyramid still needs a tip.
- Everything at E2E — an ice cream cone: slow, flaky, and expensive to maintain.

Flag these in existing coverage too, not just in new assignments.

## Output contract

Write **`docs/pipeline/test-strategy.md`** (overwrite; it is the current
assignment table, not a log). `/generate-tests` and `/generate-api-tests` read
it next as their work lists.

```markdown
# Test Strategy

## Distribution
| Layer | Count | Focus | Est. Time |
|-------|-------|-------|-----------|

## E2E Tests (Playwright)
| TC-ID | Title | Priority | File |

## API/Integration Tests
| TC-ID | Title | Priority | Endpoint |

## Component Tests
| TC-ID | Title | Priority | Component |

## Unit Tests
| TC-ID | Title | Priority | Function |

## Contested assignments
| TC-ID | Assigned | Also considered | Why this layer |

## Anti-patterns found in existing coverage
| Where | Anti-pattern | Recommended move |

## Excluded / out of scope
| TC-ID | Title | Reason |

## Recommended execution order
<smoke tier → regression tier, and what belongs in each>
```

## Guardrails

- **Rationale is mandatory for any contested assignment.** A layer choice
  nobody can reconstruct gets silently overridden by whoever implements it.
- **Never assign a TC to a layer this repo cannot run.** Unit and Component
  rows are legitimate output, but they belong in the *app* repo — mark them
  `out of scope here` rather than implying this suite will cover them.
- **Never drop a scenario to make the distribution look pyramid-shaped.** An
  excluded TC goes in the exclusions table with a reason.
- **Do not mark a row implemented.** `/generate-tests` and `/generate-api-tests`
  fill in the `File` column when the spec actually passes; a strategy that
  claims coverage that does not exist is worse than an empty table.
- **Critical flows may legitimately appear at two layers** — that is
  defence-in-depth, not duplication. Say so explicitly when you do it, so the
  next reader does not "clean it up".

## Done means

- Every TC in scope appears in exactly one table, including exclusions.
- Every contested assignment has a one-line rationale.
- The distribution table shows more tests at the bottom of the pyramid than the
  top — or explains, honestly, why this app cannot.
- Anti-patterns in existing coverage are listed with a recommended move.

## When *not* to use this skill

- One scenario, obviously a browser flow → `/ship-test` classifies inline in a
  single line of reasoning; a full strategy pass is overkill.
- No scenarios exist yet → `/create-scenarios`.
- You want the API rows actually implemented → `/generate-api-tests`.
