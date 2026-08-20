import type { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { comFunc } from "../commonFunctions/commonFunctions";

/**
 * a11yAudit — dependency-free accessibility sweep.
 *
 * Deliberately has **no npm dependency**: it runs a set of structural WCAG
 * checks inside the page itself, so `npm ci` stays untouched and the audit
 * works on any machine that can already run the suite. It covers the
 * violations that are cheap and unambiguous to detect from the DOM (missing
 * names, labels, landmarks, heading order); it does not attempt colour
 * contrast or anything needing rendered-pixel analysis — see "Known gaps".
 *
 * Consumed by the `/audit-a11y` skill, which turns raw violations into a
 * prioritised, actionable list instead of a dumped report.
 */

export type A11yImpact = "critical" | "serious" | "moderate";

export interface A11yViolation {
  /** Stable rule id — matches axe-core naming where an equivalent rule exists. */
  rule: string;
  impact: A11yImpact;
  /** Human-readable statement of what is wrong. */
  message: string;
  /** CSS path to the offending element ("" for document-level rules). */
  selector: string;
  /** Truncated outerHTML, for the report. */
  snippet: string;
}

export interface A11yAuditResult {
  url: string;
  scannedAt: string;
  violations: A11yViolation[];
  counts: Record<A11yImpact, number>;
}

/**
 * Runs the audit against the page's current DOM.
 * Call it after the page has settled — a11y findings on a half-rendered page
 * are noise, not violations.
 */
export async function auditPage(page: Page): Promise<A11yAuditResult> {
  const violations = (await page.evaluate(() => {
    type Impact = "critical" | "serious" | "moderate";
    const found: {
      rule: string;
      impact: Impact;
      message: string;
      selector: string;
      snippet: string;
    }[] = [];

    const cssPath = (el: Element): string => {
      const parts: string[] = [];
      let node: Element | null = el;
      while (node && node.nodeType === 1 && parts.length < 5) {
        const current: Element = node;
        let part = current.nodeName.toLowerCase();
        if (current.id) {
          parts.unshift(part + "#" + current.id);
          break;
        }
        const parent: Element | null = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            (c) => c.nodeName === current.nodeName,
          );
          if (siblings.length > 1) {
            part += ":nth-of-type(" + (siblings.indexOf(current) + 1) + ")";
          }
        }
        parts.unshift(part);
        node = parent;
      }
      return parts.join(" > ");
    };

    const add = (rule: string, impact: Impact, message: string, el?: Element) =>
      found.push({
        rule,
        impact,
        message,
        selector: el ? cssPath(el) : "",
        snippet: el ? el.outerHTML.slice(0, 200) : "",
      });

    const isHidden = (el: Element) =>
      el.getAttribute("aria-hidden") === "true" ||
      el.getAttribute("role") === "presentation" ||
      el.getAttribute("role") === "none" ||
      (el as HTMLElement).offsetParent === null;

    const accessibleName = (el: Element): string => {
      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ")
          .trim();
        if (text) return text;
      }
      const ariaLabel = el.getAttribute("aria-label");
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
      const title = el.getAttribute("title");
      if (title && title.trim()) return title.trim();
      const text = (el.textContent ?? "").trim();
      if (text) return text;
      const img = el.querySelector("img[alt]");
      const alt = img?.getAttribute("alt")?.trim();
      return alt ?? "";
    };

    // 1. Images need an alt attribute (an empty alt is valid for decorative).
    document.querySelectorAll("img").forEach((img) => {
      if (!img.hasAttribute("alt") && !isHidden(img)) {
        add("image-alt", "critical", "Image has no alt attribute", img);
      }
    });

    // 2. Interactive controls must expose an accessible name.
    document.querySelectorAll('button, a[href], [role="button"], [role="link"]').forEach((el) => {
      if (isHidden(el)) return;
      if (!accessibleName(el)) {
        add(
          "control-name",
          "critical",
          "<" + el.nodeName.toLowerCase() + "> has no accessible name",
          el,
        );
      }
    });

    // 3. Form fields need a real label — a placeholder alone is not one.
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      const type = (el.getAttribute("type") ?? "").toLowerCase();
      if (["hidden", "submit", "button", "reset", "image"].includes(type)) return;
      if (isHidden(el)) return;
      const id = el.getAttribute("id");
      const hasLabelEl = id
        ? Boolean(document.querySelector('label[for="' + CSS.escape(id) + '"]'))
        : false;
      const wrapped = Boolean(el.closest("label"));
      const named = Boolean(
        el.getAttribute("aria-label")?.trim() || el.getAttribute("aria-labelledby")?.trim(),
      );
      if (hasLabelEl || wrapped || named) return;
      if (el.getAttribute("placeholder")?.trim()) {
        add("form-label", "serious", "Field is labelled only by its placeholder", el);
      } else {
        add("form-label", "critical", "Form field has no associated label", el);
      }
    });

    // 4. Page-level rules.
    const lang = document.documentElement.getAttribute("lang");
    if (!lang || !lang.trim()) {
      add("html-lang", "serious", "<html> has no lang attribute");
    }
    if (!document.title || !document.title.trim()) {
      add("document-title", "serious", "Document has no <title>");
    }
    if (!document.querySelector("main, [role='main']")) {
      add("landmark-main", "moderate", "Page has no <main> landmark");
    }

    // 5. Duplicate ids break every aria-*-by reference pointing at them.
    const seen = new Map<string, number>();
    document.querySelectorAll("[id]").forEach((el) => {
      seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
    });
    seen.forEach((count, id) => {
      if (count > 1) {
        add("duplicate-id", "serious", 'id "' + id + '" is used ' + count + " times");
      }
    });

    // 6. Heading levels must not skip (h1 straight to h3).
    let previousLevel = 0;
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      const level = Number(h.nodeName.substring(1));
      if (previousLevel && level > previousLevel + 1) {
        add(
          "heading-order",
          "moderate",
          "Heading jumps from h" + previousLevel + " to h" + level,
          h,
        );
      }
      previousLevel = level;
    });

    // 7. Frames need a title; positive tabindex breaks natural focus order.
    document.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.getAttribute("title")?.trim() && !isHidden(frame)) {
        add("frame-title", "serious", "<iframe> has no title", frame);
      }
    });
    document.querySelectorAll("[tabindex]").forEach((el) => {
      if (Number(el.getAttribute("tabindex")) > 0) {
        add("tabindex-positive", "moderate", "Positive tabindex overrides natural focus order", el);
      }
    });

    return found;
  })) as A11yViolation[];

  const counts: Record<A11yImpact, number> = { critical: 0, serious: 0, moderate: 0 };
  violations.forEach((v) => (counts[v.impact] += 1));

  return { url: page.url(), scannedAt: new Date().toISOString(), violations, counts };
}

/**
 * Logs the audit in the framework's own format and fails the test only on the
 * impact levels you opt into. Default is `critical` — a suite that fails on
 * every moderate finding on day one gets switched off by week two.
 */
export function reportA11y(result: A11yAuditResult, failOn: A11yImpact[] = ["critical"]): void {
  comFunc.reportMessageInfo(
    `A11y scan of ${result.url}: ${result.counts.critical} critical, ` +
      `${result.counts.serious} serious, ${result.counts.moderate} moderate`,
  );
  for (const v of result.violations) {
    const line = `[${v.impact}] ${v.rule}: ${v.message}${v.selector ? ` @ ${v.selector}` : ""}`;
    if (failOn.includes(v.impact)) {
      comFunc.reportMessageFail(line);
    } else {
      comFunc.reportMessageWarning(line);
    }
  }
  if (result.violations.length === 0) {
    comFunc.reportMessagePass(`No accessibility violations found on ${result.url}`);
  }
}

/** Persists the raw result so `/audit-a11y` can reason over it after the run. */
export function writeA11yReport(result: A11yAuditResult, outDir = "docs/reports/a11y"): string {
  fs.mkdirSync(outDir, { recursive: true });
  const slug = result.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-");
  const file = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(result, null, 2), "utf8");
  return file;
}

/**
 * Known gaps — deliberate, not oversights:
 *   - Colour contrast needs rendered-pixel analysis. Use axe-core or a manual
 *     pass for it and record the decision in docs/reports/a11y/README.md.
 *   - Keyboard traps and focus-visible need interaction, not a DOM snapshot;
 *     `/audit-a11y` drives those through Playwright MCP instead.
 */
