---
name: explore-app
description: Crawl the live app through Playwright MCP and draft the app-domain skill from what is actually there — user flows, business rules, data models, selector inventory — plus a list of proposed new scenarios. Use when bootstrapping a new project, when app-domain is still the empty template, or after a release changed the app enough that the documented domain is stale.
argument-hint: [start URL or area to explore, or blank for BASE_URL and the primary nav]
disable-model-invocation: true
---

# Explore App — Draft the Domain From the Real App

Every other skill in this pipeline reads `app-domain` first. Until now that
file had to be hand-written before any of them could run, which made it the
one step with no AI in it at all. You close that gap: you go look at the app
and write down what is actually there.

You are **documenting**, not testing. No spec is written here, no assertion is
made about whether behaviour is correct — you have no oracle yet. Everything
you produce is a *proposal a human confirms*.

## Guardrails — read these before you touch the app

- **Only explore an environment the user owns or is authorised to test.** If
  `BASE_URL` points at production, say so and ask before crawling.
- **Read-mostly.** Navigate, open menus, hover, read. Do **not** submit forms
  that create, pay, delete, email, or notify. Fill a form only to read its
  client-side validation, and never submit unless the user explicitly said the
  environment is disposable.
- **Never overwrite `app-domain`.** Diff against it and propose additions, the
  same way `review-tests` proposes fixes instead of silently rewriting specs.
- **Never invent a business rule.** If you did not observe it, it goes in the
  Open Questions list, not the Business Rules section.

## Input

`$ARGUMENTS` — a start URL or an area to explore. Blank means `BASE_URL`
and the primary navigation.

## Knowledge Sources
1. `.claude/skills/app-domain/SKILL.md` — the current documented state. Read it
   first so you can tell "new" from "already known".
2. `docs/pipeline/test-scenarios.md` — what has already been proposed as a scenario.
3. `playwright/support/pageObjects/` — pages already modelled in code.
4. The live app, through the Playwright MCP server (`.mcp.json`).

## Process

### Step 1 — Map the surface (breadth first)
Start at `$ARGUMENTS` or `BASE_URL`. For each page you land on, capture one
accessibility snapshot and record:
- URL and page title.
- Primary navigation targets (the links/menu items that lead somewhere new).
- The page's purpose in one sentence, in the app's own vocabulary.
- Whether it required a login to reach.

Follow the primary nav to a depth of 2–3, breadth before depth. Stop expanding
a branch once pages start repeating structure (a list of 200 items is one page
type, not 200 pages).

### Step 2 — Inventory the interactive elements
Per page, record every element a test would need to touch:
| Element | Role/type | Best locator (in priority order from `playwright-best-practices` §2) | Notes |

Flag elements with **no stable handle** — no id, no accessible name, no
`data-testid`. That list is one of the most valuable things you produce: it is
the exact ask for the app team, and it is cheaper to fix in the app than to
work around in every test forever.

### Step 3 — Derive flows and candidate rules
- **User flows**: the sequences the nav actually supports, written as
  "As a <role>, I <verb> so that <outcome>", each with its concrete page path.
- **Candidate business rules**: only things you *observed* — a validation
  message, a disabled control and what re-enabled it, a required field, a
  format constraint, a state that changed what was displayed. Record the
  evidence (page + element + observed text) beside each one.
- **Data models**: field names, types, and any observed constraints (max
  length, allowed characters, required-ness). This is what `/generate-testdata`
  needs to produce boundary values that mean something.
- **Console/network noise**: JS errors, 4xx/5xx calls, broken links. These are
  findings, not scenarios — report them separately.

### Step 4 — Write the output

**A. Proposed `app-domain` additions** → `docs/pipeline/domain-draft.md`, structured
with the same section headings as `.claude/skills/app-domain/SKILL.md`, and
marked per item:
- `[NEW]` — not in app-domain today.
- `[CONFLICT]` — app-domain says something the app does not do. Never silently
  resolve one of these; they are either a stale doc or a real regression, and
  a human decides which.
- `[CONFIRMED]` — matches what is already documented.

**B. Proposed scenarios** → append to `docs/pipeline/test-scenarios.md` under a
`## Proposed by /explore-app (unreviewed)` heading, using the `create-scenarios`
TC template and numbering. Do not renumber or edit existing TCs.

**C. App findings** → `docs/pipeline/exploration-findings.md`: missing test handles,
console errors, broken links, anything that looked like a defect. One table,
each row with the page and the evidence.

### Step 5 — Report
Under 10 lines: pages visited, flows found, `[NEW]`/`[CONFLICT]` counts,
scenarios proposed, and the single highest-value thing you found. Then tell the
user the next step explicitly: review `docs/pipeline/domain-draft.md`, merge what is
right into `app-domain`, then run `/create-scenarios` or `/ship-test`.

## Done means

- Every page reached is recorded with its URL, purpose, and interactive
  elements.
- Every candidate business rule carries the evidence you observed it from.
- `[NEW]` / `[CONFLICT]` / `[CONFIRMED]` markers are applied to every proposed
  item, and `app-domain` itself is untouched.
- Elements with no stable test handle are listed — that list is the ask for the
  app team.
- Anything you inferred rather than observed is in Open Questions, not in
  Business Rules.

## When *not* to use this skill
- `app-domain` is already accurate and the app has not changed — you would be
  spending tokens to re-derive known facts.
- You need to test one specific known flow → `/ship-test` directly.
- The app is behind a login you do not have credentials for. Say that and stop;
  a crawl of a login wall documents nothing.
