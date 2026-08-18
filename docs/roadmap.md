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

| # | Enhancement | What it does | Why it matters |
|---|---|---|---|
| 4 | **API & Unit test generators** | `generate-api-tests` (Playwright `request` fixture) and `generate-unit-tests`, mirroring `generate-tests` but for the layers `test-strategy` already assigns work to. | `test-strategy` has flagged "everything at E2E = ice cream cone" as an anti-pattern since it was written — but nothing has ever implemented the API/Unit tier it recommends. The pyramid is currently only documented, not built. |
| 5 | **Exploratory/discovery agent** — `/explore-app` | Crawls the live app via Playwright MCP — clicks primary nav, tries sample form input, notes console errors, broken links, and accessibility violations — then drafts/updates `app-domain`'s User Flows and Business Rules, and proposes new TC scenarios for whatever it found. | `app-domain` currently has to be hand-written before anything else runs (by design — see the guard rail in `docs/architecture.md` §2). This is the one piece of the pipeline that's still 0% AI. |
| 6 | **AI-generated test data / fuzzing** | Reads the data models already documented in `app-domain` and generates realistic, boundary, and adversarial values per field (XSS payloads, max-length strings, unicode, negative numbers, empty/null) instead of the fixed rows in `testdata/*.json`. | `create-scenarios`' Security and Edge Case lenses already exist — they just have no data to actually exercise. This is what makes those lenses real instead of aspirational. |

## Tier 3 — maintenance, trust, and reporting

| # | Enhancement | What it does | Why it matters |
|---|---|---|---|
| 7 | **Flaky test detection** | A lightweight custom reporter appends pass/fail per test per run to a local log; a periodic `/detect-flaky` skill flags inconsistent tests, hypothesizes a cause (timing, ordering, shared state), and quarantines them out of the smoke suite. | Without history, "flaky" is just a feeling. This makes it measurable and lets AI act on it instead of a human eyeballing CI over weeks. |
| 8 | **Visual regression with AI-judged diffs** | Baseline screenshots + pixel diff, but an LLM looks at both images before flagging: is this a real UI regression, or a timestamp/font-rendering/dynamic-content difference? | Pure pixel-diff visual testing drowns teams in false positives until nobody trusts it. The AI judgment step is what keeps it usable. |
| 9 | **Natural-language run reports** | Turns the Allure JSON summary into a short digest — what changed vs. the last run, which business flows are affected, trend over time — posted to PR/Slack instead of requiring someone to open the HTML report. | Allure is for engineers. A one-paragraph "what broke and why it matters" is for everyone else who needs to know. |
| 10 | **Accessibility auditing** | axe-core scan per page, with an AI pass turning raw violations into prioritized, actionable fixes rather than a dumped report. | Same shape as visual regression: the scan already exists as a library; the AI step is what turns output into action. |

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
- **Exploratory agent (Tier 2.5) drafts `app-domain`, it doesn't overwrite it**
  — diff against the existing file and propose additions, the same way
  `review-tests` proposes fixes instead of silently rewriting specs.

## Suggested build order

Tier 1 is done — the pipeline now runs, watches, and diagnoses itself instead
of stopping the moment a spec is written. What's left is Tier 2 (real coverage
gaps) and Tier 3 (trust/reporting polish).

5 (exploratory agent) is worth building first if bootstrapping new projects
(`docs/architecture.md` §10) is the current bottleneck, since it directly
shortens that step — and it's also the last piece of the pipeline that's still
0% AI.
4 (API/Unit generators) is worth building first if the suite is E2E-heavy
enough that `test-strategy` is already flagging the ice-cream-cone anti-pattern
in real output.
7 (flaky detection) pairs naturally with `triage-failure`'s flake-candidate
flag (§11) — it's what turns "flagged once" into "tracked and quarantined
automatically."
