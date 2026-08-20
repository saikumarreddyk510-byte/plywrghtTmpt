# Flaky Test Log

Written by `/detect-flaky`. One row per quarantine decision.

A quarantine with no **Re-check by** date is a deletion with extra steps — the
column is mandatory. Anything still quarantined two weeks past its date should
be raised for a decision: fix it, or delete it and accept that the coverage is
gone.

Numbers come from `npm run history:analyze` (source: `.test-history/runs.jsonl`).

| Date | Test | Pass rate | Flip rate | Hypothesis | Action | Owner | Re-check by |
|------|------|-----------|-----------|------------|--------|-------|-------------|
| _(none yet)_ | | | | | | | |
