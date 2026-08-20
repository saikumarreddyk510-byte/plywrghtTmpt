# Quickstart — Scenario to Execution

The exact steps to go from "here's a scenario" to "here's a passing test" in
this repo, for this app (`rahulshettyacademy.com/client`, already configured
in `.env` and `.claude/skills/app-domain/SKILL.md`). Steps 1–2 are one-time;
step 3 repeats for every new scenario; step 4 is how you run what already
exists.

## 1. One-time setup (per machine, do once)

- [x] `npm install` — already done (`node_modules/` present)
- [x] `.env` — already has `BASE_URL`, `APP_USER`, `APP_PASSWORD` filled in
- [x] `.claude/skills/app-domain/SKILL.md` — already filled in for the Client
      app (login/register flows, verified selectors)
- [ ] **Approve Playwright MCP for Claude Code** — open a terminal in this
      folder and run `claude`, approve the `playwright` server when prompted.
      Without this, `/generate-tests`, `/heal-test`, and `/ship-test` can't
      verify selectors against the real page. (If you're driving from VS Code
      Copilot instead, nothing to do here — `.vscode/mcp.json` already covers
      it.)
- [ ] **GitHub repo secrets** (only needed for CI) — Settings → Secrets and
      variables → Actions on `saikumarreddyk510-byte/plywrghtTmpt`:
      `BASE_URL`, `APP_USER`, `APP_PASSWORD` (same as `.env`), and optionally
      `ANTHROPIC_API_KEY` for the AI enrichment jobs.

## 2. Starting a new app instead of this one?

Do this before step 3: `docs/architecture.md` §10 ("Bootstrapping a new
project") — set `BASE_URL`, fill in `app-domain`, adapt the login selectors.
Skip this if you're continuing to test the Client app — that's already done.

## 3. Scenario → passing test (repeat for every new scenario)

**One-shot (recommended):**
1. Write the scenario in plain English — what a user does, what should
   happen. Example: *"A logged-in user removes a product from the cart and
   the total updates to $0."*
2. Run it:
   - Claude Code: `/ship-test <scenario>` (or just paste the scenario as a
     normal message — the skill auto-triggers)
   - Copilot Chat (Agent mode, VS Code): `/ship-test` and paste the scenario
     when prompted
3. Read the report it gives you: TC-ID, files created, pass/fail, review
   score. Done.

**Step by step (more control over each stage):**
1. `/create-scenarios <feature>` → writes/updates `docs/pipeline/test-scenarios.md`
2. `/test-strategy <feature>` → writes/updates `docs/pipeline/test-strategy.md`
3. `/generate-tests <feature>` → writes the Page Object + spec, verifies
   selectors against the real app, runs it, debugs until it passes
4. `/review-tests <the new spec file>` → writes `docs/reports/review-report.md`

Both paths write the same files — you can start with `/create-scenarios` for
a whole feature, then `/ship-test TC-014` to implement one scenario from it
at a time.

**Worked example already in this repo:** `playwright/e2e/clientLogin.spec.ts`
+ `playwright/support/pageObjects/clientLogin-po.ts` — TC-001 (valid login)
and TC-301 (invalid login), built exactly this way, verified against the live
site. Use it as the pattern to match.

## 4. Running what already exists

```powershell
npm run pw:test                          # everything
npm run pw:test:smoke                    # smoke only
npx playwright test --project=<name>     # one project, e.g. client-login
npx playwright test <spec>.spec.ts --headed   # watch it in a real browser
npm run report:open                      # last Allure HTML report
npm run pw:test:api                      # API-layer specs only
npm run pw:test:a11y                     # accessibility audit
npm run history:analyze                  # stability stats across recent runs
```

## 5. When something breaks later

- **Just want it handled?** → `/autopilot` — runs the suite, triages every
  failure, heals selector rot, fixes test bugs, re-runs to prove the fix, and
  writes `docs/reports/run-report.md`. It never reaches green by weakening a test, and
  it files app bugs to `docs/reports/app-bugs.md` instead of absorbing them.
- Selector stopped matching after an app change → `/heal-test [spec]`
- A run went red and you don't know why → `/triage-failure [spec]`
- "It fails randomly" → `/detect-flaky` — it reads the run history, so it can
  tell a genuinely flaky test from one that has simply been failing all week
- Someone non-technical needs the state of the suite → `/run-report`
- Neither fixes it silently — both log/report what they found and only
  auto-apply a fix above a confidence threshold. See `docs/architecture.md`
  §4 and §11.

## 6. CI, once secrets are added

Push a branch, open a PR → smoke tests run automatically. A failure posts the
evidence as a PR comment with no AI required; if `ANTHROPIC_API_KEY` is set,
an AI diagnosis gets appended to the same comment. Nightly, the full
regression runs the same way against a tracked issue instead of a PR.
Details: `docs/architecture.md` §11.

## 7. Going beyond E2E

The pyramid `test-strategy` has always described is now implemented, not just
documented:

```
/explore-app              # bootstrap or refresh app-domain from the live app
/generate-api-tests       # the API/Integration rows in docs/pipeline/test-strategy.md
/generate-testdata        # boundary + adversarial data for the Security lens
/audit-a11y               # accessibility, prioritised by real user impact
```

Rules of thumb:
- If a rule can be checked without a browser, it belongs at API — push it down.
- Fuzz and boundary suites are regression-tier; keep them out of smoke so the
  PR gate stays fast.
- `/explore-app` and `/audit-a11y` both find **app** problems, not test
  problems. Those go to the app team (`docs/reports/app-bugs.md`), not the test backlog.
