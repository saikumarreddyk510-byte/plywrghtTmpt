# App Bugs Found by the Test Pipeline

Written by `/autopilot`, `/generate-api-tests`, and `/generate-testdata` when
the **application** contradicts documented behaviour.

The rule that makes this file worth reading: a bug listed here has **not** been
worked around in the test suite. The test stays as written and stays red, so
the signal survives until someone fixes the app. Absorbing an app bug into a
test is how a suite quietly stops testing the thing it was written for.

## Template

### BUG-<NNN>: <one-line summary>

- **Found by**: `<skill>` on `<date>`
- **Expected** (per `app-domain` §<section>): <documented behaviour>
- **Observed**: <what the app actually did>
- **Evidence**: `<trace / screenshot / log path>`
- **Affected TCs**: TC-xxx, TC-yyy
- **Status**: open | filed as `<issue link>` | fixed in `<version>`

---

_(none yet)_
