# Locator Healing Log

Written by `/heal-test`, and by `/autopilot` and `/generate-tests` when their
debug loops delegate a locator-class failure to it. One row per **applied**
heal.

The rule that makes this file worth reading: **no silent fixes.** A locator that
was auto-relocated and turns out to point at the wrong element has to be
traceable from here — not discovered by accident weeks later when a test has
been quietly passing against something it was never meant to check.

Two things never appear in this log, by design:

- **Low-confidence heals**, because they are never applied. Ambiguous cases are
  reported as possible app bugs instead — see `docs/reports/app-bugs.md`.
- **Downgraded locators.** A heal relocates an element; it never drops below the
  priority order in `playwright-best-practices` §2. Replacing a role-based
  locator with a bare `nth()` is not a heal, it is a future failure with a
  later date on it.

**Medium** rows are worth a human glance: they matched on text, label, or
position rather than on a stable identifier.

| Date | Spec / Page Object | Old locator | New locator | Confidence | Reason |
|------|--------------------|-------------|-------------|------------|--------|
| _(none yet)_ | | | | | |
