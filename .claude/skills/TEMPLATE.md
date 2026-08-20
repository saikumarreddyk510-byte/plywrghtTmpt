# Skill Template

Copy this into `.claude/skills/<your-skill>/SKILL.md`, fill every section, then
run `npm run skills:validate`.

This file lives at the top of `skills/` rather than in a directory of its own on
purpose: Claude Code loads `<dir>/SKILL.md`, so a `_TEMPLATE/SKILL.md` would be
loaded as a real, broken skill. Keep it flat.

Delete any section that genuinely does not apply — but delete it deliberately.
The validator warns about the four that carry the most weight (`Guardrails`,
`Done means`, `When not to use`, and `$ARGUMENTS` usage), because those are the
ones people skip and then regret.

---

```markdown
---
name: <kebab-case, must equal the directory name>
description: <What it does — the artifact it produces and the file it writes.> Use when <the concrete trigger>, <a second trigger>, or <a third>. <One line steering away from the nearest overlapping skill.>
argument-hint: [<what to pass> — blank for <the default behaviour>]
disable-model-invocation: true
---

# <Skill Name> — <the promise, in six words>

<Two or three lines: the role being adopted, and what this skill deliberately
does NOT do. The exclusion matters more than the inclusion — it is what stops
one skill quietly growing into all of them.>

## Input

`$ARGUMENTS` — <what it means>. Blank means <the default>.

## Knowledge Sources

<Numbered, each with a concrete path or skill name, and one clause on why it is
read. Never "read the codebase".>

1. `<skill-name>` skill — <what it supplies>.
2. `path/to/file.ts` — <what it supplies>.

## Preflight — stop conditions

<The states in which the honest move is to stop rather than produce something.
Every skill has some. Naming them is what prevents confident garbage.>

- **<Condition>** → <what to do instead, naming the skill that handles it>.

## Process

### Step 1 — <verb phrase>
<What to do, concretely enough to be checkable.>

### Step 2 — <verb phrase>
<...>

## Output contract

<The exact file(s) written, whether appended or overwritten, and which skill
consumes them next. Then the literal template of the output.>

## Guardrails

<The never-do list. Each entry states the rule AND the failure it prevents —
a rule with no stated consequence gets rationalised away under pressure.>

- **<Rule in bold.>** <Why — the specific bad outcome it prevents.>

## Done means

<Falsifiable completion criteria. Without these the agent decides for itself
when it is finished, and it will decide generously.>

- <Criterion someone else could check.>

## When *not* to use this skill

<Route to the sibling skill that fits better. Overlapping skills without
explicit boundaries get invoked by coin flip.>

- <Situation> → `/<other-skill>`, because <reason>.
```

---

## The standard, in eight rules

1. **`name` equals the directory name.** Enforced. A mismatch means the skill
   loads under a name nobody types.

2. **The description is the routing logic.** It is often the only part read
   before a skill is chosen. Say what it produces, then `Use when …` with
   concrete triggers, then one clause steering away from the nearest neighbour.
   80–1024 characters.

3. **Name the stop conditions.** The most valuable output of a skill is often
   "the input for this does not exist yet — run X first". A skill that cannot
   decline produces confident output from missing premises.

4. **State the output contract exactly.** Which file, appended or overwritten,
   and who reads it next. This pipeline is skills passing files to each other;
   an unstated contract is a broken handoff waiting to happen.

5. **Guardrails carry their reason.** "Never add `waitForTimeout`" is followed;
   "Never add `waitForTimeout` — it hides the race instead of removing it, and
   the race comes back in CI" is *understood*, which is what survives an agent
   under pressure to reach green.

6. **"Done means" is falsifiable.** "The tests pass" is checkable. "The suite is
   in good shape" is not.

7. **Boundaries are explicit.** Every user-invocable skill ends by naming the
   siblings it is confused with, and why the other one wins.

8. **Keep SKILL.md under 500 lines.** Longer means reference material belongs in
   a sibling file the skill links to, loaded only when it is actually needed.

## Two rules specific to this framework

- **Never reach green by seeing less.** No skill may delete an assertion, add a
  sleep, raise a global timeout, add retries, or skip a genuinely failing test
  in order to report success. Every skill that can touch a spec repeats this in
  its own Guardrails — deliberately, because it is the rule most worth
  over-stating.
- **App bugs are reported, never absorbed.** If the app contradicts
  `app-domain`, the test stays as written and the bug is filed to
  `docs/reports/app-bugs.md`. A suite that adapts to every regression stops
  detecting them.

## Before you commit a new skill

```bash
npm run skills:validate          # errors fail; warnings are quality signals
npm run skills:validate -- --strict   # warnings fail too
```

Then add it to the catalog in `.claude/skills/README.md`, and — if the Copilot
pipeline should have it too — add a thin pointer prompt in `.github/prompts/`
that references the SKILL.md rather than restating it. One source of truth per
step; the prompt file is a pointer, never a copy.
