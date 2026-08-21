# CI/CD

Two workflows, split by the only question that separates CI from CD:

> **CI protects the codebase. CD changes something outside it.**

Everything up to _"is this code good?"_ is CI. Everything after _"it's good — now
put it somewhere"_ is CD.

| File                               | Half              | Protects / changes            |
| ---------------------------------- | ----------------- | ----------------------------- |
| `.github/workflows/playwright.yml` | CI (+ one CD job) | This repo: lint, types, tests |
| `.github/workflows/e2e-gate.yml`   | CD-facing         | Someone else's release        |

---

## CI — `playwright.yml`

Runs on every push, every PR, and daily. See the header comment in the file for
the trigger-to-suite mapping; the short version:

| Trigger           | Suite       |
| ----------------- | ----------- |
| Push (any branch) | full        |
| PR → main         | smoke       |
| Daily 03:00 UTC   | smoke       |
| Manual            | your choice |

The daily run is the one people underestimate. These specs drive **live
applications**, which break on days nobody pushed. A suite that only runs on
push cannot tell you that.

### Local hooks run the same checks first

`.githooks/pre-commit` formats staged files; `.githooks/pre-push` runs
`lint` + `typecheck`. Installed by `npm install` via the `prepare` script.

The CI `quality` job duplicates the pre-push checks on purpose: a hook is
advisory (`--no-verify` skips it, and a fresh clone has none until someone
installs). The hook gives fast feedback; the job gives enforcement.

---

## CD — the honest version

A test framework rarely has a deploy pipeline of its own. It has **two**
CD-shaped responsibilities, and this repo implements both.

### 1. Be the gate in someone else's pipeline — `e2e-gate.yml`

This is the important one.

```
app repo:  build → deploy to staging → [ e2e-gate.yml ] → promote to prod
                                              ↑ decides
```

Called from the application's CD workflow:

```yaml
jobs:
  deploy-staging:
    # ... your deploy ...

  e2e:
    needs: deploy-staging
    uses: <owner>/<this-repo>/.github/workflows/e2e-gate.yml@main
    with:
      environment: staging
      suite: smoke
    secrets: inherit

  promote:
    needs: e2e # promotion cannot happen unless the suite passed
    # ... your production deploy ...
```

`needs: e2e` is the entire point. The suite stops being a notification and
becomes a **gate**: production is unreachable while tests are red.

Deploy systems without GitHub Actions (Jenkins, Octopus, a shell script) use the
`repository_dispatch` trigger instead — one API call. The trade-off is real:
`repository_dispatch` is fire-and-forget, so the caller **cannot block on the
result**. Prefer `workflow_call` whenever the caller lives in Actions.

### 2. Deliver the artifact this repo produces — the report

`playwright.yml` has a `publish-report` job that deploys the Playwright HTML
report to GitHub Pages: a real deploy job, a real `github-pages` environment, a
stable URL.

**It is off by default.** A template that publishes to the internet the moment
someone clones it is a trap — reports carry test names, target URLs and failure
screenshots. Turn it on deliberately:

1. Settings → Pages → Source: **GitHub Actions**
2. Settings → Secrets and variables → Actions → Variables: `PUBLISH_REPORT` = `true`

---

## Environments

Create one GitHub Environment per target (Settings → Environments): `qa`,
`staging`, `production`. Give **each** its own secrets:

| Secret                      | Notes                                       |
| --------------------------- | ------------------------------------------- |
| `BASE_URL`                  | The app instance this environment points at |
| `APP_USER` / `APP_PASSWORD` | Credentials valid for _that_ instance       |

Environment-scoped secrets are the whole reason to use environments: one
workflow tests whichever target it is handed, and production credentials never
resolve during a qa run. Environments also carry **protection rules** — require
a human approval before the suite may touch production, if that is your policy.

### Unset secrets are empty strings, not undefined

The single sharpest edge in this setup. An unset GitHub Actions secret arrives
as `""`, so `process.env.BASE_URL ?? "<default>"` passes `""` straight through —
`??` only catches null/undefined. Every fallback in this repo uses `||` for that
reason.

The specs then **skip themselves** when `BASE_URL` is unset rather than failing.
A suite that goes red over missing configuration teaches people to ignore red.

---

## Deliberately not here

- **Deploying an application.** This repo has no deployable artifact. Adding a
  deploy job to a test framework is cargo-culting the shape of CI/CD without the
  substance.
- **Auto-merging or auto-fixing on green.** See "What stays human-gated" in
  [roadmap.md](roadmap.md).
