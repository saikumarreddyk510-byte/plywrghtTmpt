# Skills — the AI test-automation pipeline

Sixteen skills. Two are reference material every other skill reads; fourteen do
work. They pass files to each other rather than context, which is what lets any
one of them be invoked alone.

- **Authoring the standard**: [`TEMPLATE.md`](TEMPLATE.md)
- **Enforcing it**: `npm run skills:validate` ([`validate-skills.mjs`](validate-skills.mjs))
- **Design rationale**: `docs/architecture.md`

## Reference skills — read, never invoked

These are `user-invocable: false`. Every working skill reads at least one.

| Skill                       | What it holds                                                                                   | Who must keep it true                           |
| --------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `app-domain`                | Flows, business rules, data models, verified selectors — the only source of truth about the app | A human, with `/explore-app` drafting proposals |
| `playwright-best-practices` | Locator priority, POM conventions, wait strategy, logging, self-healing policy, anti-patterns   | A human; `/review-tests` scores against it      |

**`app-domain` is the load-bearing file.** Skills that reason from an empty
domain produce confident guesses, which is why several of them refuse to run
until it is filled in.

## Authoring — scenario to passing spec

| Skill                 | In → Out                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/explore-app`        | Live app → `docs/pipeline/domain-draft.md` + proposed TCs. Bootstraps `app-domain`; proposes, never overwrites |
| `/create-scenarios`   | `app-domain` → TC blocks in `docs/pipeline/test-scenarios.md`, via six lenses                                  |
| `/test-strategy`      | Scenarios → layer assignments in `docs/pipeline/test-strategy.md`                                              |
| `/generate-tests`     | E2E rows → Page Object + spec + config, run until genuinely green                                              |
| `/generate-api-tests` | API rows → `playwright/api/*.api.spec.ts`                                                                      |
| `/generate-testdata`  | Data models → fixtures plus seeded boundary and adversarial cases                                              |
| `/review-tests`       | Specs → `docs/reports/review-report.md`. Read-only by construction                                             |
| **`/ship-test`**      | **One scenario → one reviewed, passing spec.** Chains the above through isolated subagents                     |

## Maintenance — red suite to honest report

| Skill            | In → Out                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/heal-test`     | Selector rot → relocated locators, logged to `docs/reports/healing-log.md`. Never applies at low confidence          |
| `/detect-flaky`  | `.test-history/runs.jsonl` → genuine flakes separated from consistent failures, with a fix or a receipted quarantine |
| `/run-report`    | Last run → `docs/reports/run-report.md`, in business language, for people who will never open Allure                 |
| `/audit-a11y`    | Real pages → WCAG-mapped findings ranked by user impact, with the gaps stated                                        |
| **`/autopilot`** | **Run → classify → fix → prove → report**, in one prompt, under hard limits                                          |

## Two entry points

Everything else is a stage you can drive by hand.

```
/ship-test <scenario>              authoring loop:    scenario in, passing spec out
/autopilot [smoke|regression|spec] maintenance loop:  red suite in, honest report out
```

Both orchestrate through subagents (`.claude/agents/`) rather than inline, so a
long session does not accumulate every file the pipeline has ever read. That
cost model is only preserved if the orchestrator never reads what it delegated —
see `ship-test`'s guardrails.

## The invariants every skill inherits

Stated once here, and repeated inside each skill that can violate them. The
repetition is deliberate: these are the rules an agent under pressure to show
progress will otherwise rationalise away.

1. **Never reach green by seeing less.** No deleted assertion, no
   `waitForTimeout`, no raised global timeout, no added retries, no `test.skip`
   on a genuinely failing test.
2. **App bugs are reported, never absorbed.** The app contradicting `app-domain`
   means the test stays as written and the bug is filed to
   `docs/reports/app-bugs.md`.
3. **Never claim a result you did not observe.** A spec that was not run is not
   passing, whatever it looks like.
4. **Nothing is auto-applied at low confidence.** Applies to heals, flake
   verdicts, and domain rules alike. Low confidence is reported, not acted on.
5. **No commits, no pushes, no PRs.** Skills edit the working tree and report; a
   human commits.
6. **Reviewers cannot edit; builders cannot review.** Enforced by the tool lists
   in `.claude/agents/`, not by instruction alone.

## Working on the skills themselves

```bash
npm run skills:validate            # frontmatter, dead paths, dead npm scripts, dead skill refs
npm run skills:validate -- --strict # warnings fail too
```

The validator exists because skills fail silently: malformed frontmatter means a
skill never loads, and a path that was renamed sends the agent somewhere that
does not exist. Neither produces an error at run time — the agent just does
something slightly wrong and reports success. It runs as the `lint-skills` job in
`.github/workflows/playwright.yml`.

**Errors** — invalid or unclosed frontmatter, unknown frontmatter key,
`name` not matching the directory, missing or oversized description, a
referenced file/npm script/sibling skill that does not exist.

**Warnings** — thin description or no `Use when …` trigger, missing
`argument-hint`, missing Guardrails / Done means / When-not-to-use, declaring an
argument the body never reads, over 500 lines.

Adding a skill: copy [`TEMPLATE.md`](TEMPLATE.md), validate, add a row to the
table above, and — if the Copilot pipeline should have it too — add a thin
pointer in `.github/prompts/` that references the SKILL.md rather than restating
it. One source of truth per step.
