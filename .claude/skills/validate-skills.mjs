#!/usr/bin/env node
/**
 * Skill linter for .claude/skills — run with `npm run skills:validate`.
 *
 * Skills are prompts, so nothing at runtime tells you one is broken: a skill
 * with malformed frontmatter silently never loads, and a skill pointing at a
 * file that was since renamed silently sends the agent to a dead path. This
 * catches both before a human does.
 *
 * ERRORS fail the build. WARNINGS are quality signals and only fail with --strict.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = resolve(SKILLS_DIR, "..", "..");
const STRICT = process.argv.includes("--strict");

/** Frontmatter keys Claude Code actually understands. Anything else is a typo. */
const KNOWN_KEYS = new Set([
  "name",
  "description",
  "argument-hint",
  "allowed-tools",
  "disable-model-invocation",
  "user-invocable",
  "model",
]);

/** Paths that legitimately do not exist on a clean checkout (generated at runtime). */
const GENERATED = [
  /^test-results\//,
  /^allure-(results|report)/,
  /^docs\/reports\//,
  /^docs\/pipeline\/(domain-draft|exploration-findings)\.md$/,
  /^playwright\/\.auth\//,
  /^\.test-history\//,
  /^\.env$/,
];

/** Referenced strings that are examples or placeholders, not real repo files. */
const isPlaceholder = (p) =>
  p.includes("*") || p.includes("<") || p.includes("|") || p.includes("\\");

const errors = [];
const warnings = [];
const err = (skill, msg) => errors.push(`${skill}: ${msg}`);
const warn = (skill, msg) => warnings.push(`${skill}: ${msg}`);

/** Minimal YAML-subset parser — frontmatter here is flat `key: value` only. */
function parseFrontmatter(raw, skill) {
  if (!raw.startsWith("---\n")) {
    err(skill, "no YAML frontmatter (the file must start with `---`)");
    return null;
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    err(skill, "frontmatter is never closed with `---`");
    return null;
  }
  const fm = {};
  for (const line of raw.slice(4, end).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("<!--")) {
      err(skill, `HTML comment inside frontmatter — invalid YAML: ${trimmed.slice(0, 60)}`);
      continue;
    }
    const m = trimmed.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!m) {
      err(skill, `frontmatter line is not \`key: value\`: ${trimmed.slice(0, 60)}`);
      continue;
    }
    fm[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return { fm, body: raw.slice(end + 4) };
}

function checkFrontmatter(skill, fm) {
  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) {
      err(skill, `unknown frontmatter key \`${key}\` — it is silently ignored (known: ${[...KNOWN_KEYS].join(", ")})`);
    }
  }

  if (!fm.name) err(skill, "missing `name`");
  else if (fm.name !== skill) err(skill, `\`name: ${fm.name}\` does not match its directory \`${skill}\``);
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) err(skill, `\`name\` must be kebab-case, got \`${fm.name}\``);

  if (!fm.description) {
    err(skill, "missing `description` — without it nothing can decide when the skill applies");
    return;
  }
  if (fm.description.length > 1024) err(skill, `description is ${fm.description.length} chars (max 1024)`);
  else if (fm.description.length < 80)
    warn(skill, `description is only ${fm.description.length} chars — say what it does AND when to use it`);
  if (!/\bUse (when|after|for|whenever|before|it when|this)\b/i.test(fm.description))
    warn(skill, "description has no trigger clause — add a `Use when …` sentence so invocation is unambiguous");

  const userInvocable = fm["user-invocable"] !== "false";
  if (userInvocable && !fm["argument-hint"])
    warn(skill, "user-invocable skill has no `argument-hint` — the slash-command UI shows no usage");
  if (!userInvocable && fm["argument-hint"])
    warn(skill, "`argument-hint` does nothing on a skill that is not user-invocable");
}

function checkBody(skill, fm, body, allSkills, npmScripts) {
  const lineCount = body.split("\n").length;
  if (lineCount > 500)
    warn(skill, `${lineCount} lines — move reference material into sibling files and link to them`);
  if (!/^# .+/m.test(body)) warn(skill, "no H1 title");

  const userInvocable = fm["user-invocable"] !== "false";
  if (userInvocable) {
    if (!/^#+ .*When \*?not\*? to use/im.test(body))
      warn(skill, 'no "When not to use this skill" section — overlapping skills need an explicit boundary');
    if (!/^#+ .*(Guard ?rails?|Rules|Hard limits)/im.test(body))
      warn(skill, "no guardrails/rules section — state what the skill must never do");
    if (!/^#+ .*(Done means|Definition of done)/im.test(body))
      warn(skill, 'no "Done means" section — without it the agent decides for itself when to stop');
    if (!body.includes("$ARGUMENTS") && fm["argument-hint"])
      warn(skill, "declares `argument-hint` but the body never uses `$ARGUMENTS`");
  }

  // Fenced code blocks hold illustrative paths and commands; exclude them from reference checks.
  const prose = body.replace(/```[\s\S]*?```/g, "");

  // --- dead file references -------------------------------------------------
  const seen = new Set();
  for (const [, ref] of prose.matchAll(/`([^`\n]+)`/g)) {
    const p = ref.trim().replace(/[.,;:]$/, "");
    if (!/^[\w.@][\w./@-]*\.(ts|mjs|md|json|jsonl|ya?ml|html)$/.test(p)) continue;
    if (isPlaceholder(p) || seen.has(p)) continue;
    seen.add(p);
    if (GENERATED.some((re) => re.test(p))) continue;
    if (!existsSync(join(REPO_ROOT, p))) err(skill, `references a path that does not exist: \`${p}\``);
  }

  // --- dead npm scripts -----------------------------------------------------
  for (const [, script] of body.matchAll(/npm run ([\w:-]+)/g)) {
    if (!npmScripts.has(script)) err(skill, `references an undefined npm script: \`npm run ${script}\``);
  }

  // --- dead sibling-skill references ---------------------------------------
  const refs = new Set();
  for (const [, s] of prose.matchAll(/`\/([a-z][a-z0-9-]*)`/g)) refs.add(s);
  for (const [, s] of prose.matchAll(/`([a-z][a-z0-9-]*)` skill/g)) refs.add(s);
  for (const s of refs) {
    if (!allSkills.has(s)) err(skill, `references a skill that does not exist: \`${s}\``);
  }
}

// ---------------------------------------------------------------------------
const skillDirs = readdirSync(SKILLS_DIR)
  .filter((d) => statSync(join(SKILLS_DIR, d)).isDirectory())
  .filter((d) => !d.startsWith("_") && !d.startsWith("."))
  .sort();

if (skillDirs.length === 0) {
  console.error("No skills found in .claude/skills");
  process.exit(1);
}

const allSkills = new Set(skillDirs);
const npmScripts = new Set(
  Object.keys(JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")).scripts ?? {}),
);

for (const skill of skillDirs) {
  const path = join(SKILLS_DIR, skill, "SKILL.md");
  if (!existsSync(path)) {
    err(skill, "directory has no SKILL.md — it will never load");
    continue;
  }
  const parsed = parseFrontmatter(readFileSync(path, "utf8").replace(/\r\n/g, "\n"), skill);
  if (!parsed) continue;
  checkFrontmatter(skill, parsed.fm);
  checkBody(skill, parsed.fm, parsed.body, allSkills, npmScripts);
}

for (const w of warnings) console.log(`  WARN   ${w}`);
for (const e of errors) console.log(`  ERROR  ${e}`);

const verdict = `${skillDirs.length} skills · ${errors.length} error(s) · ${warnings.length} warning(s)`;
console.log(errors.length === 0 ? `\nOK — ${verdict}` : `\nFAILED — ${verdict}`);
process.exit(errors.length > 0 || (STRICT && warnings.length > 0) ? 1 : 0);
