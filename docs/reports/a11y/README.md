# Accessibility Results

Raw JSON output from `playwright/support/a11y/a11yAudit.ts`, one file per
audited page, written by the `a11y` project (`npm run pw:test:a11y`).

These are **inputs**, not the deliverable. `/audit-a11y` reads them, ranks the
findings by real user impact, maps each to a WCAG 2.1 success criterion, and
writes `docs/reports/a11y-report.md` — that is the file to read.

## What this scan does not cover

Deliberate gaps, restated here so a reader of these files never mistakes them
for full WCAG coverage:

- **Colour contrast** — needs rendered-pixel analysis. Use axe-core or a manual
  pass, and record the decision here.
- **Screen-reader announcement quality** — needs a real assistive-technology
  pass with a human.
- **Keyboard traps / focus management** — needs interaction, so `/audit-a11y`
  drives those live through Playwright MCP rather than from this snapshot.
