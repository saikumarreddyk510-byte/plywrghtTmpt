/**
 * dataFactory — generated test data for the lenses that had none.
 *
 * `create-scenarios` has always produced Security / Negative / Edge Case
 * scenarios, but `testdata/*.json` only ever held one happy-path row, so those
 * scenarios could only ever be written as happy-path tests with a different
 * title. This module is what `/generate-testdata` and the fuzz specs it writes
 * pull from.
 *
 * Everything is **seeded and deterministic**: the same seed produces the same
 * data on every machine and every CI run, so a failure is reproducible. Never
 * use Math.random() in a test — a bug you cannot reproduce is a bug nobody fixes.
 */

// ─── Seeded PRNG (mulberry32) ───────────────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Default seed. Override with PW_DATA_SEED to shake out seed-dependent bugs. */
export const defaultSeed = Number(process.env.PW_DATA_SEED ?? 20250819);

// ─── Realistic values ───────────────────────────────────────────────────────

const FIRST_NAMES = ["Ana", "Liam", "Priya", "Mateo", "Yuki", "Omar", "Nina", "Tobias"];
const LAST_NAMES = ["Reddy", "Okafor", "Nakamura", "Silva", "Kowalski", "Haddad", "Berg"];
const DOMAINS = ["example.com", "test.example", "mail.example.org"];

export class DataFactory {
  private readonly rand: () => number;

  constructor(seed: number = defaultSeed) {
    this.rand = seededRandom(seed);
  }

  private pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.rand() * items.length)];
  }

  int(min: number, max: number): number {
    return Math.floor(this.rand() * (max - min + 1)) + min;
  }

  firstName(): string {
    return this.pick(FIRST_NAMES);
  }

  lastName(): string {
    return this.pick(LAST_NAMES);
  }

  fullName(): string {
    return `${this.firstName()} ${this.lastName()}`;
  }

  /** Unique-per-call email — safe for "register a new user" flows. */
  email(prefix = "qa"): string {
    return `${prefix}+${Date.now().toString(36)}${this.int(100, 999)}@${this.pick(DOMAINS)}`;
  }

  phone(): string {
    return `${this.int(200, 999)}${this.int(200, 999)}${this.int(1000, 9999)}`;
  }

  /** Password that satisfies a typical upper/lower/digit/symbol policy. */
  password(): string {
    return `Qa${this.pick(LAST_NAMES)}${this.int(10, 99)}!`;
  }

  /** ISO date offset from today — negative for the past. */
  isoDate(dayOffset = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().slice(0, 10);
  }

  /** Realistic free text of roughly `words` words. */
  sentence(words = 8): string {
    const bank = ["shipment", "delayed", "terminal", "pallet", "customs", "priority", "handling"];
    return Array.from({ length: words }, () => this.pick(bank)).join(" ");
  }
}

// ─── Boundary and adversarial cases ─────────────────────────────────────────

export interface DataCase {
  /** Short label — use it as the test title so failures name themselves. */
  label: string;
  value: string;
  /** What the app should do with it. Drives the assertion, not the input. */
  expect: "accept" | "reject";
  /** Which `create-scenarios` lens this row exists to serve. */
  lens: "Edge Case" | "Negative" | "Security";
}

/**
 * Boundary values for a length-constrained text field.
 * `min`/`max` come from the field's rule in the `app-domain` skill — if the
 * rule is not documented there, document it before generating data for it.
 */
export function lengthBoundaries(min: number, max: number): DataCase[] {
  const cases: DataCase[] = [
    { label: "empty", value: "", expect: min > 0 ? "reject" : "accept", lens: "Negative" },
    { label: "whitespace only", value: "   ", expect: "reject", lens: "Negative" },
    {
      label: `exactly min (${min})`,
      value: "a".repeat(Math.max(min, 1)),
      expect: "accept",
      lens: "Edge Case",
    },
    { label: `exactly max (${max})`, value: "a".repeat(max), expect: "accept", lens: "Edge Case" },
    {
      label: `max + 1 (${max + 1})`,
      value: "a".repeat(max + 1),
      expect: "reject",
      lens: "Edge Case",
    },
  ];
  if (min > 1) {
    cases.push({
      label: `min - 1 (${min - 1})`,
      value: "a".repeat(min - 1),
      expect: "reject",
      lens: "Edge Case",
    });
  }
  return cases;
}

/** Boundary values for a numeric field. */
export function numericBoundaries(min: number, max: number): DataCase[] {
  return [
    { label: "zero", value: "0", expect: min <= 0 ? "accept" : "reject", lens: "Edge Case" },
    { label: "negative", value: "-1", expect: min <= -1 ? "accept" : "reject", lens: "Negative" },
    { label: `min (${min})`, value: String(min), expect: "accept", lens: "Edge Case" },
    { label: `max (${max})`, value: String(max), expect: "accept", lens: "Edge Case" },
    { label: `max + 1 (${max + 1})`, value: String(max + 1), expect: "reject", lens: "Edge Case" },
    { label: "decimal in integer field", value: "1.5", expect: "reject", lens: "Negative" },
    { label: "non-numeric", value: "abc", expect: "reject", lens: "Negative" },
    { label: "leading zeros", value: "007", expect: "accept", lens: "Edge Case" },
    { label: "exponent notation", value: "1e3", expect: "reject", lens: "Edge Case" },
  ];
}

// Invisible / control characters are built by code point on purpose — pasting
// the literal character into source makes the payload invisible in diffs and
// in review, which is exactly the property you do not want in a test fixture.
const RTL_OVERRIDE = String.fromCharCode(0x202e);
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
const NULL_BYTE = String.fromCharCode(0);

/** Unicode / encoding cases that break naive input handling. */
export function unicodeCases(): DataCase[] {
  return [
    { label: "accented latin", value: "José Müller", expect: "accept", lens: "Edge Case" },
    { label: "CJK", value: "東京貨物", expect: "accept", lens: "Edge Case" },
    { label: "emoji", value: "shipment \u{1F4E6}", expect: "accept", lens: "Edge Case" },
    { label: "RTL script", value: "شحنة", expect: "accept", lens: "Edge Case" },
    {
      label: "RTL override control char",
      value: `abc${RTL_OVERRIDE}txt.exe`,
      expect: "reject",
      lens: "Security",
    },
    {
      label: "zero-width space",
      value: `DF${ZERO_WIDTH_SPACE}W`,
      expect: "reject",
      lens: "Edge Case",
    },
    { label: "trailing whitespace", value: "DFW  ", expect: "accept", lens: "Edge Case" },
  ];
}

/**
 * Adversarial payloads. These assert the app **neutralizes** the input —
 * a passing test means no script executed, no error leaked, no raw echo of the
 * payload. They are inputs to *your own* app under test, not an attack tool:
 * keep them pointed at environments you own.
 */
export function adversarialCases(): DataCase[] {
  return [
    {
      label: "XSS script tag",
      value: "<script>window.__xss=1</script>",
      expect: "reject",
      lens: "Security",
    },
    {
      label: "XSS img onerror",
      value: '<img src=x onerror="window.__xss=1">',
      expect: "reject",
      lens: "Security",
    },
    { label: "SQL tautology", value: "' OR '1'='1", expect: "reject", lens: "Security" },
    { label: "SQL comment terminator", value: "admin'--", expect: "reject", lens: "Security" },
    { label: "template injection", value: "{{7*7}}", expect: "reject", lens: "Security" },
    { label: "path traversal", value: "../../etc/passwd", expect: "reject", lens: "Security" },
    {
      label: "CRLF injection",
      value: "test\r\nSet-Cookie: a=b",
      expect: "reject",
      lens: "Security",
    },
    { label: "null byte", value: `test${NULL_BYTE}.txt`, expect: "reject", lens: "Security" },
    {
      label: "very long string (10k)",
      value: "A".repeat(10_000),
      expect: "reject",
      lens: "Security",
    },
  ];
}

/**
 * The full generated set for one text field — what a data-driven fuzz spec
 * loops over. Filter by `lens` to keep a smoke run small.
 */
export function textFieldCases(min: number, max: number): DataCase[] {
  return [...lengthBoundaries(min, max), ...unicodeCases(), ...adversarialCases()];
}

export const dataFactory = new DataFactory();
