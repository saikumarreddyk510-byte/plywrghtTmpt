---
name: generate-testdata
description: Turn the data models documented in app-domain into real test data — realistic rows, boundary values, and adversarial payloads — wired into testdata/*.json and data-driven specs via the seeded dataFactory. Use when the Security/Negative/Edge Case scenarios have no data to exercise, when a new form or model appears, or when asked for fuzz/boundary tests.
argument-hint: [model, form, or field to generate data for — blank for every model in app-domain]
disable-model-invocation: true
---

# Test Data Generator

`create-scenarios` has produced Security, Negative, and Edge Case scenarios
since day one, but `testdata/*.json` only ever held one happy-path row — so
those scenarios could only be written as happy-path tests with a scarier title.
You produce the data that makes those lenses real.

## Input

`$ARGUMENTS` — a model, form, or field. Blank means every model documented
in `app-domain`.

## Knowledge Sources
1. `app-domain` skill — **Data Models** section: fields, types, constraints.
   This is your input. If a field's constraint is not documented there, you do
   not know it — see "Unknown constraints" below.
2. `playwright/support/data/dataFactory.ts` — the generators. Use them; do
   not write a second set of payloads inline in a spec.
3. `playwright/testdata/*.json` — existing fixtures and their shape.
4. `docs/pipeline/test-scenarios.md` — the TC rows your data has to serve.

## The three tiers of data

| Tier | What it is | Generator |
|---|---|---|
| Realistic | Plausible values a real user would enter | `dataFactory.firstName()`, `.email()`, `.phone()`, … |
| Boundary | Min, max, min−1, max+1, empty, whitespace, unicode | `lengthBoundaries()`, `numericBoundaries()`, `unicodeCases()` |
| Adversarial | XSS, SQLi, traversal, CRLF, control chars, 10k strings | `adversarialCases()` |

Every generated case carries an `expect: "accept" | "reject"` and a `lens`.
That field is the whole point: a fuzz test without a stated expectation is not
a test, it is a crash probe.

## Rules that keep this trustworthy

- **Seeded, never random.** `dataFactory` is deterministic
  (`PW_DATA_SEED` overrides). A failure a colleague cannot reproduce gets
  ignored, and an unreproducible failure is worse than no test.
- **Adversarial payloads target your own app only.** These assert the app
  *neutralises* input — no script executed, no stack trace leaked, no raw echo.
  They are assertions about sanitisation, not an attack tool. Never point them
  at a system the user does not own, and never at production.
- **No real personal data.** Generated values only. If an existing fixture
  contains what looks like a real name, email, or phone number, flag it and
  replace it with a generated one.
- **Unknown constraints get asked, not guessed.** If `app-domain` does not say
  a field's max length, do not invent 255. Add the field to an "Undocumented
  constraints" list in your report and — where safe — observe the real limit
  via Playwright MCP (`maxlength` attribute, validation message) and propose
  the value as a documented rule.

## Process

### Step 1 — Extract the model
For `$ARGUMENTS` (or every model in `app-domain`), build a field table:
`field · type · required · min · max · format · documented rule`.
Anything you cannot fill in from `app-domain` is marked `?` and goes in the
undocumented list.

### Step 2 — Generate the fixtures
Write realistic rows to `playwright/testdata/<model>.json`, keyed by intent:
`valid`, `minimal` (only required fields), `maximal` (every field at max),
and any role-specific variants the domain calls for. Keep them stable — specs
reference them by key, so renaming a key breaks tests.

Boundary and adversarial cases are **not** written to JSON: they come from
`dataFactory` at runtime so one change to the payload list updates every spec.

### Step 3 — Write the data-driven spec
One spec per form/model, looping the cases:

```ts
for (const c of textFieldCases(2, 50)) {
  test(`TC-4xx - Shipment ref rejects/accepts: ${c.label}`, async () => {
    comFunc.reportMessageInfo(`Entering ${c.lens} value: ${c.label}`);
    await shipmentPage.enterReference(c.value);
    await shipmentPage.submit();
    if (c.expect === "reject") {
      await shipmentPage.verifyValidationError();       // rejected, cleanly
    } else {
      await shipmentPage.verifyAccepted();
    }
  });
}
```

Assertion rules for the adversarial tier specifically:
- **Rejected cleanly** means a validation message — *not* a 500, *not* a stack
  trace, *not* a raw echo of the payload into the DOM.
- Also assert the payload did not execute: after an XSS case, the marker it
  would have set must be absent.
- A 500 on an adversarial input is an **app bug**. Report it. Do not relax the
  case to make the suite green.

### Step 4 — Keep smoke fast
Fuzz suites are regression-tier by default: wrap them in `if (!process.env.SMOKE)`
so `npm run pw:test:smoke` stays a smoke run. A 60-case fuzz loop in the PR
gate teaches people to ignore the PR gate.

### Step 5 — Run and report
Run the spec for real. Report: fixtures written, cases generated per tier, TC
rows now covered, undocumented constraints found, and any app bug the
adversarial tier surfaced (with the exact input and observed response).

## Done means

- Every model in scope has a field table, with unknowns marked `?` rather than
  guessed.
- Fixtures are written and keyed by intent; boundary and adversarial cases come
  from `dataFactory` at runtime, not from JSON.
- Every generated case carries an `expect` and a `lens`.
- The data-driven spec has been run for real, and fuzz tiers are kept out of
  smoke.
- Undocumented constraints are listed as a proposal for `app-domain`, and any
  5xx on an adversarial input is filed as an app bug.

## When *not* to use this skill

- `app-domain` documents no data models → `/explore-app` first; boundary values
  invented without a documented constraint test nothing in particular.
- You want the scenarios themselves, not the data → `/create-scenarios`.
- You want a single spec implemented end to end → `/ship-test`.
