---
name: app-domain
description: Domain knowledge for the application under test — app overview, user flows, business rules, data models, and UI selectors. Read this before creating scenarios, strategies, or tests. TEMPLATE — fill in every section below for your project before running /create-scenarios.
user-invocable: false
---

# App Domain Knowledge

> **This is a template.** It ships empty on purpose — the AI pipeline
> (`create-scenarios`, `test-strategy`, `generate-tests`, `review-tests`,
> `ship-test`) reads this file first, every time, so its output is only as good
> as what's filled in here. Replace every `<placeholder>` before shipping the
> first real test. See `CLAUDE.md` → "Bootstrapping a New Project" for the full
> setup checklist.

## App Overview
`<One paragraph: what the app is, who its users are, what problem it solves.>`

### Apps / Areas in Scope
| Area | URL / Route | Purpose |
|------|-------------|---------|
| `<e.g. Login>` | `<path>` | `<what a user does here>` |
| `<e.g. Dashboard>` | `<path>` | `<what a user does here>` |

---

## Data Models

`<One JSON-shaped block per core entity — the shape your forms submit and your
API/UI returns. This is what test data generation and assertions key off.>`

```json
{
  "<entityName>": {
    "<field>": "<type / example value>"
  }
}
```

---

## User Flows

`<One flow per numbered journey. Be specific about routes and the exact
observable outcome — these are what create-scenarios turns into TC-### blocks
and what generate-tests turns into spec steps.>`

### Flow 1: `<name, e.g. "Register">`
1. Navigate to `<route>`
2. `<step>`
3. `<step>` → `<expected outcome>`

### Flow 2: `<name, e.g. "Login">`
1. Navigate to `<route>`
2. `<step>` → `<expected outcome>`

---

## Business Rules

`<Every rule a test might assert against. Group by flow/feature. This is the
section review-tests cross-references assertions against — an assertion that
can't be traced to a rule here is a signal the test may be checking the wrong
thing.>`

### `<Feature> Rules`
- `<rule>`
- `<rule>`

---

## Test Data Location
All credentials and test inputs: `playwright/testdata/*.json`

```json
{
  "validUser": { "...": "..." },
  "loginUser": { "email": "...", "password": "..." }
}
```
