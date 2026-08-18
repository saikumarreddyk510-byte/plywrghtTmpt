---
name: heal-test
description: Repair a Playwright spec whose locators no longer match the live app — re-inspects the real page via Playwright MCP, semantically re-locates each broken element, and applies a fix only when confident. Use when a previously-passing test starts failing on "element not found"/timeout, or as the step generate-tests' debug loop calls for that failure class.
argument-hint: [spec file, or blank to heal the last failed run]
disable-model-invocation: true
---

# Heal Test — Semantic Self-Healing for Broken Locators

You are diagnosing **selector rot**: the app changed, a locator that used to
match now matches nothing (or the wrong thing), and the test's own logic is
otherwise still correct. Your job is to relocate the element, not to redesign
the test.

## What this is for (and isn't)

Only for **locator-class failures**: `TimeoutError` waiting for an element,
"element not found", strict-mode violation (a locator matches more than one
element now). **Not** for:

- Assertion failures where the element *was* found but its content/state is
  wrong (`toHaveText` mismatch, wrong value, wrong URL). The element existing
  and disagreeing with the test is a behavior difference — a test bug or an
  app bug, not selector rot. Hand it back to the normal `generate-tests` debug
  loop instead of proceeding here.
- Navigation failures (wrong page, page never loaded). Investigate the flow
  itself, not a selector.

Healing answers *"does this element still exist under a different selector?"* —
not *"is the app doing the right thing?"*. Confusing the two is how a real
regression quietly gets papered over.

## Knowledge Sources
1. `playwright-best-practices` skill — locator priority order every healed
   locator must still respect (IDs > roles > labels > text > CSS), and the
   Self-Healing Policy section (confidence tiers, audit-log requirement).
2. `app-domain` skill — to judge whether what changed is a rename (heal it) or
   a real flow/behavior change (an app bug — don't heal it, report it).
3. The failing spec and its Page Object.
4. The failed run's trace, if one exists (`trace: "retain-on-failure"` is set
   in `playwright.config.ts` for exactly this).

## Process

### Step 1 — Isolate the failure
Run (or read the last failed run's output for) the target spec. Confirm it's a
locator-class failure per "What this is for" above — if it isn't, stop and hand
off instead of proceeding.

Identify: which Page Object method, the exact locator string that failed, and
what action/assertion was being attempted when it did.

### Step 2 — See what the page actually looks like now
Prefer the failing run's **trace** — it has the exact DOM at the moment of
failure, no re-navigation needed. Otherwise use Playwright MCP to navigate to
the same state (replay steps up to the failure point) and take **one**
snapshot. Don't re-snapshot per candidate locator under consideration.

### Step 3 — Find the semantic match
Work from the old locator's *purpose* ("the submit button", "the cart total
cell"), not its literal string. Search the current DOM for whatever now serves
that purpose, preferring in order:

1. A stable identifier that's simply new (`id`/`data-testid` renamed but still
   unique and stable) — always prefer this over anything below if one exists.
2. Role + accessible name matching the same intent.
3. Label/placeholder text matching the same intent.
4. Visible text content, disambiguated by position/context only if not unique.

Never fall back to a bare index/`nth()` selector as the fix unless the original
locator was already positional — a heal relocates the element, it never
downgrades the locator's quality below what `playwright-best-practices` §2
requires.

### Step 4 — Judge confidence, then act

| Confidence | When | Action |
|---|---|---|
| **High** | Exactly one element unambiguously matches the old locator's role + purpose | Apply the fix, re-run to confirm the test now passes, append a `docs/healing-log.md` entry |
| **Medium** | Matched by text/label only, or disambiguated by position among similar elements | Apply the fix, re-run to confirm, append the log entry, and call it out explicitly in the report as worth a human glance |
| **Low** | Multiple equally-plausible candidates, or nothing serves the same purpose anymore | **Apply nothing.** Cross-check the flow against `app-domain`. If the app now contradicts the documented flow, this is a candidate app bug, not selector rot — report it; don't guess a locator to make the red go away |

Cap at one healing attempt per locator per invocation — if the first proposed
fix doesn't make the test pass, stop and report rather than guessing again.

### Step 5 — Record it
Every High/Medium fix gets one row in `docs/healing-log.md` (create it with
this header if it doesn't exist yet):

```markdown
# Healing Log

| Date | Spec / Page Object | Old locator | New locator | Confidence | Reason |
|------|--------------------|--------------|-------------|------------|--------|
```

No silent fixes. A locator that was auto-relocated and turns out to be the
wrong element should be traceable from this log, not discovered by accident
weeks later.

## Output
Report:
- Which locators were healed (old → new), confidence, and file(s) changed.
- Which were left unhealed (Low confidence) and why, including any suspected
  app bug.
- Whether the test now passes — or still fails, and on what.
