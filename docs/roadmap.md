# AI Enhancement Roadmap

`docs/architecture.md` describes what's **built**. This document is the
backlog it was built from — items get struck through and marked ✅ here as
they ship (with a pointer to where they landed in `docs/architecture.md`),
everything else is still proposed, not implemented.

## Where the AI stops today

The current pipeline (`create-scenarios` → `test-strategy` → `generate-tests` →
`review-tests`, orchestrated by `ship-test`) covers **authoring**: a scenario
becomes a passing, reviewed spec. Everything *after* a spec exists — running it
in CI, noticing it broke, figuring out why, fixing it, reporting on it, keeping
`app-domain` current as the app changes — is still manual. That's the gap this
roadmap closes, tier by tier.

```
[ Human writes app-domain ] → [ AI authors tests ] → [ AI runs, watches, fixes, reports ]
        ↑ Tier 2 closes this            done              done (Tier 1) · Tier 3 refines it
```

---

## Tier 1 — highest leverage, extends the pipeline you already have

**✅ Complete.** All three shipped — see `docs/architecture.md` §4 and §11.
None of it requires Claude Code or Anthropic specifically: the pipeline is
also drivable from VS Code + GitHub Copilot (§12), and CI's failure signal
(`triage-baseline`) works with zero AI vendor configured — the AI jobs are
optional enrichment on top, not a dependency.

| # | Enhancement | What it does | Why it matters |
|---|---|---|---|
| 1 | ~~Self-healing locators~~ | ✅ **Shipped** — `docs/architecture.md` §4, the `heal-test` skill. | — |
| 2 | ~~Failure triage agent~~ — `/triage-failure` | ✅ **Shipped** — `docs/architecture.md` §11, the `triage-failure` skill. Classifies a red run as selector rot / test bug / app bug / flake with evidence, and routes the fix instead of leaving it for a human to puzzle over. | — |
| 3 | ~~CI wiring~~ — `.github/workflows/playwright.yml` | ✅ **Shipped** — `docs/architecture.md` §11. Smoke on every PR, full regression nightly, `review-tests` auto-commenting on changed specs, `triage-failure` auto-commenting on red. Needs `ANTHROPIC_API_KEY` as a repo secret for the AI steps — the test-execution job itself doesn't. | — |

## Tier 2 — closes real gaps in coverage

**✅ Complete.** All three shipped — see `docs/architecture.md` §15 (API tier,
generated data) and §16 (exploration). None of them adds an npm dependency.

| # | Enhancement | What it does | Why it matters |
|---|---|---|---|
| 4 | ~~API & Unit test generators~~ — `/generate-api-tests` | ✅ **Shipped** — `docs/architecture.md` §15. API/Integration specs against `support/api/apiClient.ts`, run by `npm run pw:test:api`, so `test-strategy`'s API rows become code instead of a table. Unit generation stays out of scope on purpose: unit tests belong in the app repo, next to the code they test. | — |
| 5 | ~~Exploratory/discovery agent~~ — `/explore-app` | ✅ **Shipped** — `docs/architecture.md` §16. Crawls the live app through MCP and drafts `app-domain` (flows, rules, data models, selector inventory) plus proposed TCs and an app-findings list. Proposes only — never overwrites the domain file, and never auto-resolves a `[CONFLICT]`. | — |
| 6 | ~~AI-generated test data / fuzzing~~ — `/generate-testdata` | ✅ **Shipped** — `docs/architecture.md` §15. Realistic / boundary / adversarial values from `support/data/dataFactory.ts`, each carrying an explicit accept-or-reject expectation. Seeded, never random, so a fuzz failure is reproducible. | — |

## Tier 3 — maintenance, trust, and reporting

**Mostly complete.** 7, 9, and 10 shipped — see `docs/architecture.md` §13–§15.
8 (visual regression) is still proposed: it is the only item here that needs
baseline image storage and an image-capable review step, so it is a bigger
change than the rest and has not been built.

| # | Enhancement | What it does | Why it matters |
|---|---|---|---|
| 7 | ~~Flaky test detection~~ — `/detect-flaky` | ✅ **Shipped** — `docs/architecture.md` §14. `RunHistoryReporter` writes `.test-history/runs.jsonl`; `analyzeHistory.ts` computes pass rate, flip rate, and a verdict per test; the skill hypothesises a cause and quarantines with a receipt in `docs/reports/flaky-log.md`. | — |
| 8 | **Visual regression with AI-judged diffs** | Baseline screenshots + pixel diff, but an LLM looks at both images before flagging: is this a real UI regression, or a timestamp/font-rendering/dynamic-content difference? | Pure pixel-diff visual testing drowns teams in false positives until nobody trusts it. The AI judgment step is what keeps it usable. |
| 9 | ~~Natural-language run reports~~ — `/run-report` | ✅ **Shipped** — `docs/architecture.md` §13. Verdict first, business language in the body, TC-IDs in parentheses, trend from run history, quarantined tests counted as lost coverage rather than passes. | — |
| 10 | ~~Accessibility auditing~~ — `/audit-a11y` | ✅ **Shipped** — `docs/architecture.md` §15. Dependency-free structural scan in `support/a11y/a11yAudit.ts` (`npm run pw:test:a11y`), plus live keyboard/focus checks via MCP, prioritised by real user impact and mapped to WCAG in `docs/reports/a11y-report.md`. Its gaps (contrast, screen-reader quality) are stated in every report. | — |

---

## What stays human-gated, on purpose

"100% AI-driven" should mean the *work* is automated, not that every decision
ships unreviewed. Keep these gates even after building everything above:

- **Self-healing (Tier 1.1) auto-applies only above a confidence threshold** —
  below it, propose and wait. A silently "fixed" locator that now points at the
  wrong element is worse than a red test.
- **`triage-failure` never auto-closes a bug as "flake"** without evidence
  attached (trace/screenshot/history) — that's exactly the failure mode that
  erodes trust in a test suite.
- **CI auto-comments, it doesn't auto-merge.** Review output blocks nothing by
  itself; a human still approves the PR.
- **`/autopilot` gets at most one fix-and-re-run cycle**, and may never reach
  green by weakening a test (deleted assertion, `waitForTimeout`, raised global
  timeout, added retry). Still red after one honest attempt is a valid,
  reportable outcome — an agent that keeps going until green has an obvious
  shortcut available and will eventually take it.
- **App bugs are filed (`docs/reports/app-bugs.md`), never absorbed into a test.** The
  test stays red so the signal survives until someone fixes the app.
- **Nothing is quarantined off a single red run**, and every quarantine in
  `docs/reports/flaky-log.md` carries a re-check date. A quarantine without one is a
  deletion with extra steps.
- **Exploratory agent (Tier 2.5) drafts `app-domain`, it doesn't overwrite it**
  — diff against the existing file and propose additions, the same way
  `review-tests` proposes fixes instead of silently rewriting specs.

## What is left

| # | Item | Why it is still open |
|---|---|---|
| 8 | Visual regression with AI-judged diffs | Needs baseline image storage, a diff step, and an image-capable review pass. The AI-judgement step is what would keep it usable — pure pixel diffing drowns teams in false positives — but the storage and review plumbing is a bigger change than anything in Tier 2. |
| — | Unit test generation | Deliberately out of scope for this repo. Unit tests belong next to the code they test, in the app repo, run by that repo's CI. `test-strategy` should keep assigning work to the Unit tier and naming the function — it just hands the assignment over rather than implementing it here. |
| — | Parallel-safe execution | `fullyParallel: false` is forced by the shared `globalVariables.page` handle. Every new layer added above (API, a11y, fuzz) makes the serial run longer. Moving to fixture-injected pages would unlock parallelism, but it is a breaking refactor of every existing Page Object — a deliberate decision for a human, not a silent one. |

## Where the AI stands now

```
[ /explore-app drafts domain ] → [ AI authors tests ] → [ AI runs, watches, fixes, reports ]
        Tier 2 ✅ (human confirms)        done                   Tier 1 + 3 ✅ (/autopilot)
```

Every stage now has an AI path, and every stage that can silently corrupt the
suite still has a human gate on it. That combination — not the absence of
gates — is what "100% AI-driven" is supposed to mean here.
