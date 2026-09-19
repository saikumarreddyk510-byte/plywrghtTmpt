# Skills & Agents — Complete Guide (Tenglish)

Ee document `.claude/` folder lo unna **anni skills inka agents** ni explain
chestundi — beginner nunchi advanced varaku.

Mee main question idi:

> "Nenu oka scenario isthe chaalu — code rasi, run chesi, result chusi, review
> chesi, genuine failure ayithe report cheyyali, lekapothe fix chesi malli run
> chesi, issue fix ayinda leda ani chusi, report ivvali. Idi ela pani chestundi?"

Aa exact flow **Part 4** lo step by step undi. Kaani daani mundu, aa flow lo
paalgone prathi piece ni ardham chesukovali. Anduke scratch nunchi modaluddam.

> **Vellipovadam tondaraga kavalante:** **Part 0** ki vellandi — akkada
> "ekkada type cheyyali, em type cheyyali" ani exact ga undi. Theory
> taruvata chadavachu.
>
> Chinna version ee repo lo already undi: `docs/quickstart.md` §3. Idi
> daani kanna ekkuva detail inka ee app ki specific ga undi.

---

# PART 0 — Ela Start Cheyyali (Where to type the scenario)

## 0.1 Ekkada Type Cheyyali

Skills anni `C:\Learnings\PlayWrightAI\.claude\` lo unnayi. Ante mee Claude
Code session **aa folder lo ne root ayyi undali**. Vere folder lo start
chesthe skills load avvavu.

**Terminal nunchi:**

```powershell
cd C:\Learnings\PlayWrightAI
claude
```

**VS Code nunchi:**

```
File → Open Folder → C:\Learnings\PlayWrightAI
→ taruvata Claude Code panel ni open cheyyandi
```

**Sariggane ayinda ani ela telusu?** Prompt box lo `/` ani kottandi. Ee
list lo ivi kanipinchali:

```
/ship-test
/autopilot
/create-scenarios
/test-strategy
/generate-tests
/review-tests
/heal-test
/detect-flaky
...
```

Ivi kanipinchakapothe — meeru thappu folder lo unnaru. `cd` chesi malli
start cheyyandi.

## 0.2 Modati Sari Matrame — MCP Approve Cheyyandi

Modati sari `claude` run chesinappudu, Playwright MCP server ni approve
cheyyamani adugutundi (`.mcp.json` lo register ayi undi).

**Approve cheyyandi.** Idi lekapothe builder agent selectors ni live page lo
verify cheyyaledu — guess chesi rastundi, taruvata debug chestundi. Adi
chala ekkuva runs teeskuntundi.

`generate-tests` skill lo idi explicit ga rasi undi:

> a selector guessed and then debugged costs several runs; a selector read
> off the live page costs one snapshot.

## 0.3 Em Type Cheyyali

Normal prompt box lo ne type cheyyandi. Rendu forms pani chestayi:

```
/ship-test <mee scenario ikkada>
```

leda slash lekunda — `ship-test` ki `disable-model-invocation` ledu, kabatti
meeru flow ni describe chesthe adi automatic ga trigger avutundi:

```
add a test for logging in with a wrong password
```

**Nerchukune rojullo `/ship-test` form ne vaadandi** — adi reliable, inka
ye skill run avutundo meeku clear ga telustundi.

## 0.4 Manchi Scenario Ela Rayali

Scenario ye motham input. Kabatti adi sariggane rayadam important.
**Mudu rules:**

| Rule | ❌ Bad | ✅ Good |
|---|---|---|
| **Observable** outcome cheppandi | "login works correctly" | "lands on `/dashboard/dash`" |
| **Okka flow** matrame, motham feature kaadu | "test the whole login page" | "invalid password shows the error toast" |
| `app-domain` lopala undandi | "test the payment gateway" | Login / Register / Dashboard lo edaina |

**Modati rule enduku?** `create-scenarios` skill lo ne reason undi:

> "The order is processed correctly" is not testable; "the order appears in
> the Orders list with status `Placed`" is.

Ante — verify cheyyagalige daanini cheppandi. "Correctly" ani chepthe,
correct ante enti ani agent guess cheyyalsi vastundi.

**Moodo rule enduku?** Mee `app-domain/SKILL.md` lo **mudu areas** matrame
document ayyayi:

| Area | Route |
|---|---|
| Login | `/client/#/auth/login` |
| Register | `/client/#/auth/register` |
| Dashboard | `/client/#/dashboard/dash` |

Vaati bayata unna flow adigithe, pipeline "idi document avvaledu, nenu
expectation ni verify cheyyalenu" ani cheputundi — guess cheyyadu. Adi
feature, bug kaadu.

## 0.5 Modati Command — Ide Try Cheyyandi

Mee setup already ready ga undi:

```
BASE_URL = https://rahulshettyacademy.com/client     ← .env lo set ayindi
app-domain = ade app ki document ayindi              ← placeholders ledu
MCP = .mcp.json lo register ayindi
```

`app-domain` Flow 1 lo idi rasi undi:

> **Invalid credentials** → stays on `/client/#/auth/login`, a
> `.toast-message` reading "Incorrect email or password." appears

Ante ee scenario **documented rule ki clean ga trace avutundi**:

```
/ship-test a user enters an invalid email and password on the login page and
stays on the login page with a toast reading "Incorrect email or password."
```

Idi copy chesi paste cheyyandi. Anthe.

## 0.6 ⚠️ Ippudu Idi Cheyyakandi

**`/ship-test` ni khali ga (argument lekunda) run cheyyakandi.**

Khali ante — "implement cheyyani modati TC ni teesko" ani artham
(`ship-test` Step 0). Kaani mee `docs/pipeline/test-scenarios.md` lo
**mudu vere apps** nunchi scenarios kalisi unnayi:

| TC range | Ye app | Status |
|---|---|---|
| TC-001 – TC-503 | AACargo facilities (`aacargo.com`) | Implement ayindi |
| TC-104, TC-601 – TC-1104 | **Google search** (23 TCs) | Implement avvaledu |
| — | Ecom app (`app-domain` document chesindi) | Scenarios ledu |

Khali ga run chesthe, adi Google search TC ni teeskuni, e-commerce
`app-domain` ni chusi test rayadaniki try chestundi. Motham confuse
avutundi.

**Kabatti eppudu explicit scenario ivvandi** — `test-scenarios.md` clean
ayye varaku.

## 0.7 Run Ayyaka Ee Files Ni Chadavandi

```
playwright/e2e/<new>.spec.ts       ← ee code rasindo
docs/reports/review-report.md      ← reviewer em cheppindo
docs/reports/healing-log.md        ← emaina selector heal ayinda
docs/reports/app-bugs.md           ← test lo kappakunda file chesina bugs
docs/pipeline/test-scenarios.md    ← ee TC block formalize chesindo
docs/pipeline/test-strategy.md     ← ye layer assign chesindo
```

**Report lo "PASSED" ani unte kuda** — `review-report.md` ni okkasari
chudandi. Test pass avvachu, kaani review lo `[IMPORTANT]` findings
undochu.

## 0.8 Taruvata Em Cheyyali

```
Test run cheyyalante        → npx playwright test <spec>.spec.ts --headed --project=<name>
Motham suite health check   → /autopilot smoke
Report kavalante            → npm run report:open   (Allure HTML)
Suite "randomly" red unte   → /detect-flaky
Okka spec locator break     → /heal-test playwright/e2e/<spec>.spec.ts
```

---

# PART 1 — Modati Basics

## 1.1 Skill Ante Enti?

Skill ante — **oka markdown file lo rasina instructions set**. Anthe. Magic emi
ledu.

`.claude/skills/ship-test/SKILL.md` ane file ni open chesthe, andulo "modata idi
cheyyi, taruvata adi cheyyi, ee rules break cheyyakudadu" ani plain English lo
rasi untundi.

Meeru Claude Code lo `/ship-test` ani type chesinappudu, aa file yokka content
**Claude yokka context loki load avutundi**. Ante Claude aa instructions ni
chadivi, vaati prakaram pani chestundi.

```
Meeru type chestaru:  /ship-test user logs in and sees dashboard
         ↓
Claude Code ship-test/SKILL.md ni open chesi chaduvutundi
         ↓
Aa file lo unna Step 0, Step 1, Step 2... ni follow chestundi
```

**Enduku idi manchi idea?** Endukante:

- Instructions **code lo** unnayi, Claude yokka memory lo kaadu. Ante avi
  version control lo untayi, review cheyyachu, marchachu.
- Prathi sari same process jarugutundi. Consistency vastundi.
- Meeru instructions ni edit chesthe, behaviour ventane marutundi. Python
  code marchanakkarledu.

## 1.2 SKILL.md File Ela Untundi?

Prathi skill file ki **rendu parts** untayi:

```markdown
---                                    ← Frontmatter start
name: ship-test
description: Turn one plain-English test scenario into a fully implemented,
  passing Playwright spec — the single-prompt entry point for this framework.
argument-hint: [scenario description, or a TC-ID, or blank]
---                                    ← Frontmatter end

# Ship Test — One Prompt → One Passing Spec     ← Body start

You are the orchestrator. Your job is to turn $ARGUMENTS into...
```

**Frontmatter** (`---` madhyalo unna part) — metadata:

| Field | Pani |
|---|---|
| `name` | Skill peru. Folder peru tho **match avvali**, lekapothe validator error istundi |
| `description` | Idi chala important — Claude ee description chusi "ee skill ippudu kavala" ani decide chestundi |
| `argument-hint` | Meeru ee skill ki em pass cheyyachu |
| `disable-model-invocation` | `true` unte — Claude dinni **sonta ga** pilavadu, meeru `/name` ani type chesthene |
| `user-invocable` | `false` unte — idi reference material, meeru direct ga pilavalemu |

**Body** — actual instructions. Steps, rules, tables, examples.

**`$ARGUMENTS` ante enti?** Meeru `/ship-test user logs in` ani type chesthe,
`$ARGUMENTS` = `"user logs in"`. Skill body lo `$ARGUMENTS` ekkada unte akkada
aa text vastundi.

## 1.3 Agent (Subagent) Ante Enti?

Idi skill kanna different concept. Chala important ga ardham chesukovali.

**Agent ante — oka separate Claude instance, sonta context tho, sonta tools
tho.**

`.claude/agents/test-builder.md` ni chudandi:

```markdown
---
name: test-builder
description: Writes and validates one Playwright spec — Page Object, spec file,
  and config entry, verified against the real app and debugged until it passes.
tools: Read, Write, Edit, Grep, Glob, Bash, Skill
---

# Test Builder
You implement exactly one thing at a time...
```

Aa `tools:` line — **ade asalu power**. Ee agent ki ee 7 tools matrame unnayi.
Inka emi ledu.

Ippudu `test-reviewer.md` ni chudandi:

```markdown
---
name: test-reviewer
tools: Read, Grep, Glob, Write, Skill
---
```

`Edit` **ledu**. `Bash` **ledu**.

Ante reviewer:
- Code ni chadavagaladu (`Read`)
- Report rayagaladu (`Write`)
- Kaani review chestunna file ni **marchaledu** (`Edit` ledu)
- Test ni **run cheyyaledu** (`Bash` ledu)

**Idi enduku genius design?** Reviewer prompt lo "please don't edit the code"
ani rasthe — adi kevalam request. Model marchipovachu, leda "chinna fix ye
kada" ani rationalize cheyyavachu.

Kaani `Edit` tool **asalu ivvakapothe** — adi physically marchaledu. Idi
**structural guarantee**, instruction kaadu.

Skills README lo ide ila cheppadu:

> **Reviewers cannot edit; builders cannot review.** Enforced by the tool lists
> in `.claude/agents/`, not by instruction alone.

## 1.4 Skill vs Agent — Difference

| | Skill | Agent |
|---|---|---|
| Enti | Instructions file | Separate Claude instance |
| Context | Mee main conversation loki load avutundi | **Sonta** fresh context |
| Tools | Mee current tools | Frontmatter lo define chesinavi matrame |
| Deniki | "Ela cheyyali" ani cheppadaniki | Pedda pani ni isolate cheyyadaniki |

## 1.5 Subagent Enduku? — Cost Model

Idi ardham chesukunte motham design ardham avutundi.

**Problem:** `app-domain/SKILL.md` inka `playwright-best-practices/SKILL.md`
pedda files. Vaatini chadivithe mee conversation context lo permanent ga
undipotayi. Session lo 10 tests ship chesthe — motham context blow avutundi,
prathi sari cost peragutundi.

**Solution:** Aa pedda files ni **subagent lopala** chadavali. Subagent pani
aipoyaka, adi chinna summary matrame tirigi istundi. Aa pedda files mee main
conversation loki **eppudu ravu**.

```
❌ WITHOUT SUBAGENT (bad)
┌──────────────────────────────────────────────┐
│ Main conversation                            │
│  + app-domain (pedda)                        │
│  + playwright-best-practices (pedda)         │
│  + existing spec files                       │
│  + generate-tests skill                      │
│  ...prathi ship-test ki inka peragutundi     │
│  → 10th ship-test = chala costly             │
└──────────────────────────────────────────────┘

✅ WITH SUBAGENT (good)
┌──────────────────────────┐    ┌─────────────────────────┐
│ Main conversation        │    │ test-builder subagent   │
│  (chinna ga undipotundi) │───▶│  + app-domain           │
│                          │    │  + best-practices       │
│                          │◀───│  + existing specs       │
│  "FILES: x.spec.ts       │    │  (ee context idi        │
│   RESULT: PASSED"        │    │   aipoyaka podutundi)   │
│  ← chinna summary matrame│    └─────────────────────────┘
└──────────────────────────┘
  → 10th ship-test = modati daanilane cheap
```

`ship-test/SKILL.md` lo idi explicit ga rasi undi:

> **Never do Steps 2–3 inline.** Every read of `app-domain`,
> `playwright-best-practices`, or existing spec files happens inside a
> subagent. That is the whole cost model: this orchestrator stays cheap so the
> tenth `/ship-test` in a session costs what the first did.

---

# PART 2 — Anni Skills (15)

`.claude/skills/` lo **15 folders** unnayi. (Note: `skills/README.md` lo
"Sixteen skills" ani rasi undi — adi chinna doc drift, actual count 15.)

Vaatini **mudu groups** ga divide cheyyachu:

```
┌─────────────────────────────────────────────────────────────┐
│ GROUP A — REFERENCE (2)                                     │
│ Ivi "invoke" cheyyalemu. Migata skills ivi chaduvutayi.     │
│                                                             │
│   app-domain                 ← App gurinchi truth           │
│   playwright-best-practices  ← Coding standard              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ GROUP B — AUTHORING (8)                                     │
│ Kotha tests rayadam                                         │
│                                                             │
│   explore-app        → app-domain ni draft cheyyadam        │
│   create-scenarios   → TC blocks rayadam                    │
│   test-strategy      → Ye layer lo test cheyyali            │
│   generate-tests     → E2E specs rayadam                    │
│   generate-api-tests → API specs rayadam                    │
│   generate-testdata  → Test data rayadam                    │
│   review-tests       → Code review                          │
│   ship-test ★        → Pai vaatini kalipi okka prompt lo    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ GROUP C — MAINTENANCE (5)                                   │
│ Unna tests ni healthy ga unchadam                           │
│                                                             │
│   heal-test     → Break ayina selectors fix                 │
│   detect-flaky  → Flaky vs genuinely broken separate        │
│   run-report    → Business language lo digest               │
│   audit-a11y    → Accessibility findings                    │
│   autopilot ★   → Pai vaatini kalipi okka prompt lo         │
└─────────────────────────────────────────────────────────────┘
```

**★ Rendu entry points matrame:**

```
/ship-test <scenario>                ← Kotha test kavalante IDI
/autopilot [smoke|regression|spec]   ← Unna suite ni check cheyyalante IDI
```

Migata 13 skills — avi stages. Meeru vaatini separate ga kuda pilavachu, kaani
mostly ee rendu ye vaadutaru.

## 2.1 GROUP A — Reference Skills

### `app-domain` — Motham Pipeline Ki Foundation

**Frontmatter:** `user-invocable: false` — ante meeru `/app-domain` ani type
cheyyalemu. Idi kevalam **chadivedi**.

**Andulo em untundi?**

```markdown
## App Overview
rahulshettyacademy.com/client — "Ecom" — a practice e-commerce app...
Angular SPA (hash routing, #/...)

## Data Models
{ "user": { "email": "string (unique)", "phone": "string (10 digits)", ... } }

## User Flows
### Flow 1: Login
1. Navigate to /client/#/auth/login
2. Fill Email (#userEmail) + Password (#userPassword)
3. Click the submit input (#login)
4. Valid credentials → redirected to /client/#/dashboard/dash
5. Invalid credentials → stays on login, .toast-message reading
   "Incorrect email or password." appears
```

**Idi enduku motham pipeline lo most important file?**

Endukante — **test fail ayinappudu, "idi mana test bug na, leda app bug na"
ani ela decide chestaru?**

Answer: `app-domain` ni chusi. Adi "login fail ayithe toast message ravali"
ani cheputundi. Ippudu app lo toast raakapothe — **app bug**. Mana test correct.

`app-domain` khali unte, ee judgement **asalu cheyyalemu**. Anduke README lo
ila rasi undi:

> **`app-domain` is the load-bearing file.** Skills that reason from an empty
> domain produce confident guesses, which is why several of them refuse to run
> until it is filled in.

`create-scenarios` lo aa refusal explicit ga undi:

> **`app-domain` is still the empty template or has no Business Rules.**
> Scenarios derived from an empty domain are guesses with TC numbers on them.
> Tell the user to run `/explore-app` first.

### `playwright-best-practices` — Coding Standard

Idi kuda `user-invocable: false`. 227 lines, 10 sections.

**§2 — Locator Priority (most important section):**

```
Priority 1: Element IDs           page.locator("#username")
Priority 2: Accessibility Roles   page.getByRole("button", { name: "Sign In" })
Priority 3: Labels/Placeholders   page.getByLabel("First Name")
Priority 4: Semantic Text         page.locator("button:has-text('Add')")
Priority 5: CSS Classes           page.locator(".card h4")     ← LAST RESORT

NEVER: XPath, index-based nth-child, page.waitForTimeout()
```

**§3 — Required spec structure:**

```typescript
test.describe("<Feature> Tests", () => {
  test.beforeEach(async ({ page }) => {
    setPage(page);                              // REQUIRED — always first
    page.on("pageerror", () => {});             // REQUIRED
    await page.goto("<URL>", { waitUntil: "domcontentloaded" });
  });

  test("TC01 - <action> - <expected result>", async () => {
    comFunc.reportMessageInfo("TC01 - Step 1: <description>");
    await myPage.doAction();
    comFunc.reportMessagePass("TC01 - <action> confirmed ✅");
  });
});
```

**§9 — Self-Healing Policy (confidence tiers):**

| Confidence | Rule |
|---|---|
| **High** — unambiguous role + purpose match | Apply, re-run, log it |
| **Medium** — text/label match, or position-disambiguated | Apply, re-run, log it, **flag for human** |
| **Low** — multiple candidates, or nothing matches | **Never apply.** Report it — app bug kavachu |

**§10 — Anti-patterns table:**

| Anti-Pattern | Fix |
|---|---|
| `page.waitForTimeout()` | `waitForURL`, `waitFor`, leda `expect` |
| Hardcoded credentials | `testdata/*.json` nunchi chadavandi |
| Locators in spec files | Page Object loki move cheyyandi |
| No step logging | `comFunc.reportMessage*` add cheyyandi |
| Missing `setPage(page)` | `beforeEach` lo modati line |
| Tests dependent on each other | Prathi test self-contained ga |

**Ee file enduku separate ga undi?** Endukante **mudu vere skills** dinni
chaduvutayi:

- `generate-tests` — code rayadaniki standard ga
- `review-tests` — checklist ga (prathi rule oka review criterion)
- `heal-test` — healed locator quality ni downgrade cheyyakudadu ani

Okka chota rule ni marchithe, mudu chotla behaviour marutundi.

## 2.2 GROUP B — Authoring Skills

### `explore-app` — App Ni Chusi Domain Draft Cheyyadam

**Problem idi solve chestundi:** `app-domain` ni evaru rayali? Mundu adi
manual ga rayalsi vachedi — ade pipeline lo AI leni okka step.

**Idi em chestundi:** Playwright MCP tho live app ni crawl chesi:

```
Step 1 — Map the surface (breadth first)     ← Ye pages unnayo
Step 2 — Inventory the interactive elements  ← Buttons, forms, links
Step 3 — Derive flows and candidate rules    ← Flows ni kanukkovadam
Step 4 — Write the output                    ← docs/pipeline/domain-draft.md
Step 5 — Report
```

**Chala important:** Idi `app-domain/SKILL.md` ni **direct ga rayadu**. Adi
`docs/pipeline/domain-draft.md` ni rastundi. **Manishi** chadivi merge cheyyali.

Enduku? Endukante app ni chusi "ee rule undi" ani infer cheyyadam — adi
guess. Guess ni truth file lo direct ga pettakudadu.

### `create-scenarios` — Six Lenses

Plain app knowledge nunchi test scenarios ni generate chestundi. Kaani random
ga kaadu — **aaru lenses** dwara:

| Lens | Question | TC Range |
|---|---|---|
| Happy Path | Expected successful journey enti? | TC-001–099 |
| Business Rules | Ye documented rule hold avvali? | TC-100–199 |
| Security | Unauthorised user idi reach cheyagalada? | TC-200–299 |
| Negative / Error | Invalid input ichhe em avutundi? | TC-300–399 |
| Edge Cases | Boundary values inka limits enti? | TC-400–499 |
| UI State | Loading, empty, disabled states? | TC-500–599 |

**TC ranges enduku?** TC-205 ani chusthe ventane "idi security scenario" ani
telustundi. File open cheyyakarledu.

**Output format — TC block:**

```
### TC-<NNN>: <Title>
**Category**: <Happy Path | Business Rule | Security | Negative | Edge Case | UI State>
**Priority**: <P0 | P1 | P2 | P3>
**Preconditions**: <test run avvadaniki mundu em true ga undali>
**Steps**: <numbered actions>
**Expected Results**: <observable outcome>
**Business Rule**: <app-domain lo ye rule ki trace avutundo>
**Suggested Layer**: <E2E | API | Component | Unit>
```

**Priority ante effort kaadu, blast radius:**

- **P0** — core revenue leda access flow block avutundi
- **P1** — documented rule break avutundi
- **P2** — secondary flow degrade avutundi
- **P3** — cosmetic leda rare

**Rendu golden rules ikkada:**

1. **"Expected Results must be observable."**
   - ❌ "The order is processed correctly" — idi test cheyyalemu
   - ✅ "the order appears in the Orders list with status `Placed`" — idi cheyyachu

2. **"Never invent a business rule to justify a scenario."** Rule undi ani
   anipisthe kaani `app-domain` lo lekapothe — `## Open questions` kinda
   rayali, expected result ga assert cheyyakudadu.

### `test-strategy` — Ye Layer Lo Test Cheyyali

Idi **cost ni save chese skill**. Prathi scenario ki okate question:

> Ee bug ni chudagalige **cheapest, fastest layer** edi?

**Decision rules — order lo apply avutayi, modati match win:**

```
1. Pure function, no I/O                      → Unit
2. Backend business rule, error contract, authz → API/Integration
3. Single component's rendering/UI state      → Component
4. Multi-page journey leda full-stack flow    → E2E
5. Lower layer ee bug ni chudagalada?         → push it DOWN
6. Inka ambiguous ga unte                     → lowest layer that tests it adequately
```

**Rule 5 ki oka hard limit undi:**

> **never push a test below the layer that can observe the behaviour.** A rule
> about what a user sees rendered is not verified by an API assertion that the
> field exists in JSON.

Ante — user ki screen meeda em kanipistundo, adi API JSON lo field unda ani
check chesthe verify avvadu. Push down cheyyadam correct, kaani **blind**
layer ki push cheyyadam thappu.

**Anti-patterns idi flag chestundi:**

| Anti-pattern | Enduku thappu |
|---|---|
| Input validation at E2E | Unit leda API lo cheyyali — 100x fast |
| API error codes through browser | API lo cheyyali |
| Pure logic at E2E | Unit lo cheyyali |
| **No E2E at all for a critical journey** | Pyramid ki tip kuda kavali |
| **Everything at E2E** | "Ice cream cone" — slow, flaky, costly |

**Test pyramid picture:**

```
        ▲
       /E2E\          ← Konni matrame. Slow, expensive, real user journeys
      /─────\
     /  API  \        ← Ekkuva. Fast, business rules, error contracts
    /─────────\
   /   Unit    \      ← Chala ekkuva. Chala fast, pure logic
  /─────────────\

  ICE CREAM CONE (thappu):
  \─────────────/
   \    Unit   /      ← Konni
    \─────────/
     \  API  /        ← Konni
      \─────/
       \E2E/ ...ivi pedda ga    ← Motham ikkade. Slow inka flaky.
        ▼
```

### `generate-tests` — Code Rayadam (Ikkade Asalu Pani)

Ee skill motham pipeline lo **most important working skill**. `test-builder`
agent deenine follow avutundi.

Modati line ye tone ni set chestundi:

> You write Playwright TypeScript *and run it*. **A spec you have not executed
> is not finished, however good it looks.**

**Preflight — stop conditions (modata ivi check):**

```
- Scenario ki browser avasaram leda?     → STOP. /generate-api-tests ki pampu
- Playwright MCP approve avvaleda?       → Cheppu. Selectors "unverified" ani label cheyyi
- BASE_URL set kaleda / env down?        → STOP. Dead environment meeda
                                            debug chesina prathi cheeju thappu
```

Aa moodo point chala manchi line:

> Every failure you debug against a dead environment teaches you something false.

**Process: Write → Verify → Run → Debug**

```
Step 1 — READ
  best-practices, strategy row, domain flow, inka CLOSEST existing spec + PO
  → Aa pair yokka import order, beforeEach shape, logging style, naming ni
    EXACT ga match cheyyali. Kotha structure invent cheyyakudadu.

Step 2 — WRITE
  Page Object → playwright/support/pageObjects/<page>-po.ts
  Spec        → playwright/e2e/<feature>.spec.ts
  Config      → playwright.config.ts lo project block
  Test data   → playwright/testdata/*.json  (spec lo literal EPPUDU kaadu)

Step 3 — VERIFY selectors against the real page (Playwright MCP)
  Live page ki navigate chesi, prathi element nijam ga unda ani confirm.
  Idi spec run cheyyadaniki MUNDU cheyyali, fail ayyaka kaadu.

Step 4 — RUN
  npx playwright test <spec>.spec.ts --headed --project=<name>
  Full output capture cheyyali. "This step is not optional."

Step 5 — ON FAILURE, classify BEFORE changing anything
  (Ee table Part 4 lo detail ga undi — ade mee question ki answer)

  Re-run after each fix, at most 3 attempts, then stop and report it blocked.
```

**Step 3 enduku chala matter chestundi?**

> a selector guessed and then debugged costs several runs; a selector read off
> the live page costs one snapshot.

Ante — guess chesi, fail ayyaka fix chesi, malli run... adi 4-5 runs. Live page
ni okkasari chusi correct selector rayadam — okka snapshot. Chala cheap.

### `generate-api-tests` inka `generate-testdata`

**`generate-api-tests`** — `test-strategy` eppudu API rows assign chestune
undedi, kaani evaru implement chesevaru kaadu. Ee skill aa gap ni close
chestundi. `ApiClient` wrapper ni vadutundi, inka nijam ga run chestundi.

**`generate-testdata`** — Problem statement skill lo ne clear ga undi:

> `create-scenarios` has produced Security, Negative, and Edge Case scenarios
> since day one, but `testdata/*.json` only ever held one happy-path row — so
> those scenarios could only be written as **happy-path tests with a scarier
> title**.

Mudu tiers of data generate chestundi:

```
1. Realistic  — normal ga kanipinche data
2. Boundary   — limits daggara (min-1, min, max, max+1)
3. Adversarial— SQL injection strings, XSS payloads, unicode, chala pedda inputs
```

Anni `dataFactory` yokka **seeded** generator nunchi — ante reproducible.

### `review-tests` — Read-Only Audit

Tone ni chudandi:

> You **report**; you do not rewrite. Naming a fix precisely enough that
> someone else applies it in one pass is the job — and it is what keeps the
> review trustworthy, because **a reviewer who edits the code is no longer an
> independent check on it.**

**Checklist — 8 categories:**

```
Coverage          → strategy lo assign ayina anni TC-IDs implement ayyaya
Required boilerplate → setPage first? pageerror handler? logging?
Selectors         → XPath ledu kada? §2 priority follow ayinda?
Assertions        → prathi test ki meaningful expect() unda?
                    assertion nijam ga aa business rule ni verify chestunda?
Data              → hardcoded credentials ledu kada?
Page Objects      → spec lo page.locator() ledu kada?
Reliability       → waitForTimeout ledu kada? tests independent na?
Config            → project block unda? testMatch nijam ga match avutunda?
Self-healing      → healing-log lo ee file unte, heals quality ni
                    downgrade cheyyaleda
```

**Severity levels:**

| Severity | Ante |
|---|---|
| `[CRITICAL]` | Failure cause chestundi, leda **real bug ni escape avvanistundi** |
| `[IMPORTANT]` | Reliability leda maintainability ni tagginchutundi |
| `[SUGGESTION]` | Style, naming |

**Output table format:**

```markdown
| Line | Severity | Current code | Rule violated | Fix |
|------|----------|--------------|---------------|-----|
| 23 | [CRITICAL] | `await page.waitForTimeout(2000)` | best-practices §7 | `await locator.waitFor({ state: "visible" })` |
```

**Oka chala manchi guardrail:**

> **Do not invent issues to fill the table.** If the file is good, say so and
> score it accordingly. A review that always finds ten problems teaches people
> to skim reviews.

Inkoti:

> **Acknowledge what is right before listing what is wrong** — reviews that
> only subtract get argued with instead of applied.

### `ship-test` ★ — Entry Point

Idi orchestrator. Pai vaatini kalipi okka prompt lo nadipistundi. Full detail
**Part 4** lo undi.

## 2.3 GROUP C — Maintenance Skills

### `heal-test` — Selector Rot Ni Fix Cheyyadam

**"Selector rot" ante enti?** App developers UI ni marcharu. Mundu `#submit-btn`
undedi, ippudu `#submitButton` ayindi. Test code lo emi marchaledu, kaani test
fail avutundi. Test logic correct, kevalam **address marindi**.

**Idi ye failures ki matrame:**

```
✅ TimeoutError waiting for an element
✅ "element not found"
✅ Strict-mode violation (okati kanna ekkuva elements match avutunnayi)

❌ Assertion failure — element DORIKINDI kaani content thappu ga undi
❌ Navigation failure — page ye load avvaledu
```

Aa distinction ni skill chala clear ga cheputundi:

> Healing answers *"does this element still exist under a different selector?"*
> — not *"is the app doing the right thing?"*. **Confusing the two is how a
> real regression quietly gets papered over.**

Ante — element dorikindi kaani text thappu ga unte, adi selector problem kaadu.
Adi app behaviour marindi ani artham. Daanini "heal" chesthe — **nijamaina bug
ni kappesinattu**.

**Process:**

```
Step 1 — Isolate the failure
  Locator-class na ani confirm cheyyi. Kaakapothe AAPU, hand off cheyyi.

Step 2 — See what the page looks like NOW
  Prefer the failing run's TRACE — andulo failure moment lo exact DOM undi.
  (Anduke playwright.config.ts lo trace: "retain-on-failure" set chesaru!)
  Trace lekapothe MCP tho navigate chesi OKKA snapshot teeyali.

Step 3 — Find the semantic match
  Old locator yokka PURPOSE ni chudali ("the submit button"), literal string
  kaadu. Ee order lo vetakali:
    1. Stable identifier that's simply new (id/data-testid renamed)
    2. Role + accessible name matching the same intent
    3. Label/placeholder text
    4. Visible text, position tho disambiguate (only if needed)

  NEVER bare nth() as a fix — unless original already positional.

Step 4 — Judge confidence, then act
  (§9 table — High apply, Medium apply+flag, Low APPLY NOTHING)

Step 5 — Record it
  docs/reports/healing-log.md lo oka row.
```

**Healing log enduku?**

> No silent fixes. A locator that was auto-relocated and turns out to be the
> wrong element should be **traceable from this log**, not discovered by
> accident weeks later.

Ante — auto-fix thappu ayithe, 3 vaaralaki "arey ee test thappu element ni
check chestondi" ani kanukkovadam kaadu. Log lo chusi ventane teliyali.

**Oka attempt matrame:**

> Cap at one healing attempt per locator per invocation — if the first proposed
> fix doesn't make the test pass, stop and report rather than guessing again.

### `detect-flaky` — Flaky vs Genuinely Broken

**Flaky ante enti?** Code marchaledu, kaani konni runs lo pass, konni lo fail.

**Idi enduku dangerous?** Rendu vidhaalu ga:

1. Flaky test ni "broken" anukuni chala time waste cheyyachu.
2. **Nijam ga broken test ni "flaky" anukuni ignore cheyyachu** — idi inka
   dangerous.

Skill modati line:

> Without history, "flaky" is a **feeling**. This skill starts from **data**.

**Step 1 — numbers ni meere calculate cheyyakandi:**

```bash
npm run history:json -- --runs 30 --min-runs 3
```

> Do not re-derive the arithmetic in your head or by reading the raw JSONL —
> the script is deterministic and its verdicts are reproducible; **your
> judgement is needed for *why*, not *how often***.

**Verdicts:**

| Verdict | Ante | Em cheyyali |
|---|---|---|
| `flaky` | Same code, outcome flips | Diagnose chesi fix cheyyi |
| `consistently-failing` | **Eppudu pass avvadu** | **Idi flaky KAADU.** Idi regression |
| `stable` | Flips levu | Vadileyyi |
| `insufficient-data` | `--min-runs` kanna takkuva | Cheppu, guess cheyyaku |

**Step 2 — cause hypothesis table:**

| Signal | Likely cause | Targeted fix |
|---|---|---|
| `locator` class, high duration variance | Render ni race chestundi | Real post-condition meeda wait cheyyi |
| `timeout`, CI lo worse | Slow environment, fixed sleep, animation | `waitForTimeout` teeseyyi; **specific** timeout matrame perigi, global kaadu |
| `assertion` on changing data | Live/shared data meeda depend | Test sonta data create chesukovali |
| Fails only after another spec | Shared state (`globalVariables` process-wide!) | `beforeEach` lo reset |
| `network` class | Third-party call | Route-block cheyyi; flaky backend ante **app finding** |
| Passes on retry every time | Real timing bug, retries tho dachina | Fix cheyyi. **Retries flakiness ni dachutayi, teeyavu** |

**Step 4 — Quarantine, with a receipt:**

```markdown
| Date | Test | Pass rate | Flip rate | Hypothesis | Action | Owner | Re-check by |
```

> A quarantine with **no re-check date is a deletion with extra steps.**

### `run-report` — Business Language Lo Digest

> Allure is for engineers debugging a test. This is for everyone who just needs
> to know whether the release is safe. **Different audience, different
> document.**

Sections: Verdict → Numbers → What broke **in business terms** → Fixed since
last run → Watch list → Recommended next step.

"What broke in business terms" ante — "TC-042 failed with TimeoutError" kaadu.
"Customers cannot complete checkout when the cart has more than 5 items" — ala.

### `audit-a11y` — Accessibility

Scan already `a11yAudit.ts` lo rasi undi. Ee skill yokka pani **judgement**:

- Ye violations nijam ga user ni block chestunnayi
- WCAG criteria ki map cheyyadam
- Keyboard/focus checks — ivi DOM snapshot lo teliyavu, MCP tho cheyyali
- Cover cheyyaleni gaps ni **explicit ga cheppadam** (color contrast lanti vi)

### `autopilot` ★ — Maintenance Entry Point

Full detail **Part 5** lo.

---

# PART 3 — Rendu Agents

## `test-builder`

```yaml
tools: Read, Write, Edit, Grep, Glob, Bash, Skill
```

**Personality:**

> You implement exactly one thing at a time... and it does not stop until that
> spec passes for real. **You do not design test strategy, you do not review
> other people's code — that's `test-reviewer`'s job, not yours, even if you
> notice something.**

Aa chivari part — "even if you notice something" — chala deliberate. Agents
scope creep cheyyadaniki try chestayi. Idi aapatundi.

**Em ledu:**

- **No `Agent`** — idi inko subagent ni spawn cheyyaledu. Ante chain flat ga
  untundi: orchestrator → builder. Tree kaadu.
- **No web/artifact tools** — repo lo unnadi leda Playwright MCP matrame.

**`Bash` enduku undi:**

> You do have `Bash` — you need it to actually run `npx playwright test` and
> confirm green, not just claim it. **A spec you haven't run is not done.**

## `test-reviewer`

```yaml
tools: Read, Grep, Glob, Write, Skill
```

**Personality:**

> You review. You do not fix. **That split is enforced by what tools you have,
> not just by instruction**: you have no `Edit` and no `Bash` — you cannot
> change the file you're looking at and you cannot run it.

**`Write` enduku undi appudu?** Okate reason — review report rayadaniki:

> Write `docs/reports/review-report.md` (**your one legitimate `Write`**).

## Rendu Agents Ki Common Pattern

Rendu agents yokka body lo "process" ni **rayaledu**. Badulu ga:

```markdown
# test-builder
Follow `.claude/skills/generate-tests/SKILL.md` exactly — it is the single
source of truth for this role, shared with the Copilot-driven version...

# test-reviewer
Follow `.claude/skills/review-tests/SKILL.md` exactly, including its full
checklist — it is the single source of truth for this role...
```

**Enduku ila?** Endukante same pipeline **GitHub Copilot** tho kuda nadustundi
(`.github/prompts/` folder chudandi). Rendu chotla process ni duplicate chesthe,
okati update chesi inkoti marchipothe — drift avutundi. Anduke okate SKILL.md
ni rendu point chestayi.

---

# PART 4 — ★ MEE QUESTION KI ANSWER ★

## Scenario Isthe Em Jarugutundi (Step By Step)

Meeru ee command kodataru:

```
/ship-test user searches for DFW and sees the cargo terminal address
```

Ippudu **exact ga em jarugutundo** chuddam.

### Overall Picture

```
┌────────────────────────────────────────────────────────────────────┐
│  MAIN CONVERSATION (orchestrator — ship-test/SKILL.md follow avutundi)│
│                                                                    │
│  Step 0 ─ Input resolve         (INLINE — cheap)                   │
│  Step 1 ─ TC rayadam + classify (INLINE — cheap)                   │
│                    │                                               │
│                    ▼                                               │
│  Step 2 ─ BUILD ──────────────────┐  (DELEGATE — expensive)        │
│                                   │                                │
│                    ┌──────────────▼─────────────────────┐          │
│                    │  test-builder SUBAGENT             │          │
│                    │  (sonta context, 7 tools)          │          │
│                    │                                    │          │
│                    │  generate-tests/SKILL.md follow    │          │
│                    │  → read skills                     │          │
│                    │  → write PO + spec + config        │          │
│                    │  → verify selectors (MCP)          │          │
│                    │  → RUN IT                          │          │
│                    │  → fail ayithe CLASSIFY chesi fix  │          │
│                    │  → green varaku (max 3 attempts)   │          │
│                    └──────────────┬─────────────────────┘          │
│                                   │ chinna summary tirigi          │
│                    ◀──────────────┘                                │
│                    │                                               │
│                    ▼                                               │
│  Step 3 ─ REVIEW ─────────────────┐  (DELEGATE — scoped)           │
│                                   │                                │
│                    ┌──────────────▼─────────────────────┐          │
│                    │  test-reviewer SUBAGENT            │          │
│                    │  (sonta context, NO Edit, NO Bash) │          │
│                    │                                    │          │
│                    │  review-tests/SKILL.md follow      │          │
│                    │  → checklist apply                 │          │
│                    │  → review-report.md rayadam        │          │
│                    │  → score + findings return         │          │
│                    └──────────────┬─────────────────────┘          │
│                    ◀──────────────┘                                │
│                    │                                               │
│                    ▼                                               │
│  Step 4 ─ [CRITICAL] unda?  ── YES ──▶ inko test-builder subagent  │
│                    │                    (aa fixes matrame)         │
│                    │ no                 ★ OKKASARI MATRAME ★       │
│                    ▼                                               │
│  Step 5 ─ REPORT (10 lines lopu)                                   │
└────────────────────────────────────────────────────────────────────┘
```

### Step 0 — Input Resolve (inline)

Orchestrator modata mee input ni ardham chesukuntundi:

```
- Scenario text ichara?        → ade vaadu
- TC-### ichara?               → docs/pipeline/test-scenarios.md lo vetuku
- Khali ga vadilara?           → implement cheyyani modati TC teesko
                                 (grep TC-IDs across specs first — don't open
                                  every file)
```

**Ikkada oka important stop condition:**

> Scenario doesn't describe a browser-observable user flow (it's a pure
> function, an API contract, or backend-only logic) → **stop here**, tell the
> user this belongs at Unit/API layer, not this pipeline. **Don't force a UI
> test onto it.**

Ante — "discount calculation function ni test cheyyi" ani adigithe, idi
"sare" ani browser test rayadu. "Idi Unit layer pani" ani chepthundi.

### Step 1 — Fast Classification (inline — main token saver)

Mudu chinna panulu:

```
1. FORMALIZE, don't re-derive
   Mee text ni TC block ga marchi test-scenarios.md ki append cheyyali.
   → create-scenarios yokka TEMPLATE ni vaadutundi
   → Kaani full "6 lenses sweep" cheyyadu! Adi batch mode ki matrame.

2. CLASSIFY the layer yourself
   → test-strategy yokka Decision Rules ni okka line lo apply
   → Ee pipeline E2E matrame ship chestundi, so answer almost always E2E
   → test-strategy.md ki okka row append
   → Genuinely ambiguous ayithene full test-strategy skill ni subagent ga pilavali

3. CHECK FOR REUSE — Grep/Glob matrame (full read KAADU)
   → pageObjects/*-po.ts lo aa page ki class already unda
   → e2e/*.spec.ts lo aa flow ki spec already unda
   → CLOSEST existing spec + PO pair ni note cheyyi
```

Aa moodo point chala important. Builder ki "ee file la ne rayi" ani oka
**template** istundi. Anduvalla builder kotha structure invent cheyyadu.

### Step 2 — BUILD (delegate)

Ippudu orchestrator oka `test-builder` subagent ni spawn chestundi.

**Enti pass chestundi?** Kevalam rendu things:

```
- Step 1 lo rasina TC block
- Mirror cheyyalsina closest spec + PO file paths
```

Anthe. `app-domain`, `playwright-best-practices` — ivi **pass cheyyadu**.
Builder vaatini **thane** chaduvutundi, sonta context lo.

**Builder lopala em jarugutundo:**

```
1. READ (sonta context lo — orchestrator ki idi teliyadu)
   .claude/skills/generate-tests/SKILL.md          ← process
   .claude/skills/playwright-best-practices/SKILL.md ← standard
   .claude/skills/app-domain/SKILL.md              ← app knowledge
   playwright/e2e/facilities.spec.ts               ← closest spec (mirror)
   playwright/support/pageObjects/facilities-po.ts ← closest PO (mirror)

2. WRITE
   playwright/support/pageObjects/dfwSearch-po.ts
   playwright/e2e/dfwSearch.spec.ts
   playwright.config.ts  (project block add)
   playwright/testdata/dfwSearch.json  (data kavalante)

3. VERIFY selectors (Playwright MCP)
   Live page ki navigate chesi, prathi element unda ani confirm
   → Idi run cheyyadaniki MUNDU

4. RUN
   npx playwright test playwright/e2e/dfwSearch.spec.ts --headed --project=dfw-search

5. FAIL ayithe → CLASSIFY (★ idi mee question yokka heart ★)
```

## ★ Step 5 — Failure Classification (Mee Question Ki Core Answer) ★

Meeru adigaru: *"genuine failure ayithe report cheyyali, lekapothe fix chesi
malli run cheyyali"*. **Aa decision ikkade jarugutundi.**

Test fail ayinappudu, builder **emi marchadaniki mundu** ee table ni apply
chestundi:

| Failure signal | Ante | Em cheyyali |
|---|---|---|
| Timeout waiting for element / not found / strict-mode violation | **Locator-class** (selector rot) | `heal-test` procedure follow — MCP snapshot, semantic re-match, **High/Medium confidence lo matrame apply**, healing-log lo rayali |
| Element **dorikindi**, assertion disagree ayindi, **inka `app-domain` puratana expectation correct ani confirm chestundi** | **Test bug** | **Test ni fix cheyyi** |
| Element **dorikindi**, assertion disagree ayindi, **inka app `app-domain` ki contradict chestundi** | **APP BUG** | ★ **Report cheyyi. Test ni ADAPT CHEYYAKU** ★ |
| Locator heal meeda **Low confidence** | **Possible app bug** | **AAPU inka report cheyyi.** Red ni clear cheyyadaniki locator guess cheyyaku |

**Idi English lo ardham chesukundam:**

```
Test fail ayindi
    │
    ▼
Element ni Playwright kanugonnada?
    │
    ├── LEDU (timeout / not found)
    │      → Idi SELECTOR problem
    │      → App marindi, kaani logic correct
    │      → HEAL cheyyi (confidence high unte)
    │      → Fix chesi MALLI RUN cheyyi
    │
    └── AVUNU, dorikindi. Kaani assertion fail ayindi
           │
           ▼
       app-domain lo em rasi undi?
           │
           ├── app-domain: "login fail ayithe toast ravali"
           │   App: toast vastondi
           │   Test: toast raaledu ani check chestondi
           │      → MANA TEST THAPPU (test bug)
           │      → TEST NI FIX CHEYYI, malli run
           │
           └── app-domain: "login fail ayithe toast ravali"
               App: toast RAADU ippudu
               Test: toast ravali ani check chestondi
                  → ★ APP BUG ★
                  → TEST NI MUTTUKOKU
                  → docs/reports/app-bugs.md lo FILE CHEYYI
                  → Red ga vadileyyi — ADE CORRECT ANSWER
```

**Idi enduku motham pipeline lo most important logic?**

Endukante — AI ki "test ni green cheyyi" ani chepthe, adi **easiest path**
teeskuntundi. Assertion ni teesesthe green vastundi. `waitForTimeout(5000)`
pettthe green vastundi. Kaani appudu test **panikiraani** di ayipotundi.

Ee classification adi aapatundi. "Green cheyyadam" goal kaadu — "**nijam ni
cheppadam**" goal.

Skills README lo invariant #2 ide:

> **App bugs are reported, never absorbed.** The app contradicting `app-domain`
> means the test stays as written and the bug is filed to
> `docs/reports/app-bugs.md`.

Inka invariant #1:

> **Never reach green by seeing less.** No deleted assertion, no
> `waitForTimeout`, no raised global timeout, no added retries, no `test.skip`
> on a genuinely failing test.

**Retry limit:**

> Re-run after each fix, **at most 3 attempts**, then stop and report it blocked.

Ante infinite loop raadu. Mudu try chesi kaakapothe — "blocked" ani report
chestundi.

**Builder return chese summary:**

```
FILES: playwright/e2e/dfwSearch.spec.ts
       playwright/support/pageObjects/dfwSearch-po.ts
       playwright.config.ts
TC_IDS: TC-010
RESULT: 1 passed (12.4s)
APP_BUGS: NONE
```

Chinna ga. Full working transcript kaadu. Ade cost model.

### Step 3 — REVIEW (delegate, scoped)

Orchestrator inko subagent ni spawn chestundi — `test-reviewer`.

**Enti pass chestundi?** **Kevalam Step 2 lo touch ayina file paths.** Motham
suite kaadu.

> This scoping (one file, not the whole suite), **not a cheaper model**, is the
> safe way to keep review fast.

Idi manchi point. Review ni cheap cheyyadaniki chinna model vaadadam risky —
review quality podutundi. Badulu ga **scope** ni chinna cheyyadam safe.

**Reviewer lopala:**

```
1. READ
   .claude/skills/review-tests/SKILL.md        ← checklist
   .claude/skills/playwright-best-practices/SKILL.md ← standard
   .claude/skills/app-domain/SKILL.md          ← business rules
   (inka review chese files)

2. CHECKLIST apply — 8 categories, prathi item check

3. WRITE docs/reports/review-report.md

4. RETURN: score + [CRITICAL]/[IMPORTANT] findings matrame
```

Reviewer **physically** code ni marchaledu — `Edit` tool ledu. Kabatti daani
report ni nammochu.

### Step 4 — Fix Loop (★ OKKASARI MATRAME ★)

```
[CRITICAL] findings unnaya?
    │
    ├── LEDU → Step 5 ki vellu
    │
    └── UNNAYI → inko test-builder subagent spawn
                 (Step 2 la ne, kaani aa fixes ki MATRAME scoped)
                     │
                     ▼
                 Fix apply ayindi
                     │
                     ▼
                 ★ RE-REVIEW AVASARAM LEDU ★
                 "report the fix as applied and let the user
                  re-run /review-tests later if they want"
                     │
                     ▼
                 Step 5
```

**Enduku okkasari matrame?** `autopilot` skill lo reason clear ga rasi undi:

> An agent looping on a red suite burns tokens and **eventually starts
> weakening assertions to reach green**.

Ante — loop ni open ga vadilithe, AI frustrate ayyi "sare, ee assertion ni
teesesta" ani chestundi. Hard limit ade aapatundi.

### Step 5 — Report (inline, 10 lines lopu)

```
- TC-ID(s) shipped inka files touched
- Real browser run nunchi pass/fail
- Review score inka remaining non-critical issues
- Ye app bugs dorikayo
```

## Complete Example — Modati Nunchi Chivari Varaku

Real ga ela untundo:

```
YOU:
  /ship-test user searches for DFW and sees the cargo terminal address

─────────────────────────────────────────────────────────────────────
ORCHESTRATOR (inline):
  Step 0: Scenario text ichadu. Browser flow ye. Continue.

  Step 1: docs/pipeline/test-scenarios.md ni grep chesa. Highest TC = TC-009.
          Kotha TC-010 rasa:

          ### TC-010: Search DFW and verify cargo terminal address
          **Category**: Happy Path
          **Priority**: P0
          **Preconditions**: Facilities page reachable
          **Steps**: 1. Go to facility search  2. Search "DFW"
                     3. Open cargo terminal section
          **Expected Results**: Address matches facilities.json dfw.cargoTerminal
          **Business Rule**: app-domain § Facilities
          **Suggested Layer**: E2E

          → test-scenarios.md ki append ayindi
          → test-strategy.md ki row append ayindi (E2E, multi-step browser journey)

          Grep results:
          CLOSEST_SPEC: playwright/e2e/facilities.spec.ts
          CLOSEST_PO:   playwright/support/pageObjects/facilities-po.ts

─────────────────────────────────────────────────────────────────────
  Step 2: → test-builder subagent spawn

  ┌─ BUILDER (sonta context) ─────────────────────────────────────┐
  │  generate-tests, best-practices, app-domain chadiva           │
  │  facilities.spec.ts + facilities-po.ts chadiva (mirror kosam) │
  │                                                               │
  │  Rasa:                                                        │
  │   - facilities-po.ts ki kotha methods (existing PO ni extend) │
  │   - playwright/e2e/dfwCargo.spec.ts                           │
  │   - playwright.config.ts lo "dfw-cargo" project block         │
  │                                                               │
  │  MCP tho selectors verify chesa → anni unnayi                 │
  │                                                               │
  │  RUN 1: npx playwright test dfwCargo.spec.ts --project=dfw-cargo│
  │         ✗ FAILED — TimeoutError waiting for                   │
  │           locator("#cargo-terminal-address")                  │
  │                                                               │
  │  CLASSIFY: Timeout waiting for element → LOCATOR-CLASS        │
  │            → heal-test procedure follow avutunna              │
  │                                                               │
  │  Trace ni chusa. Page lo aa element ippudu                    │
  │  <section aria-label="Cargo Terminal"> lopala undi,           │
  │  id marchesaru.                                               │
  │                                                               │
  │  CONFIDENCE: High — okkate element, same role, same purpose   │
  │  → Apply: getByRole("region", { name: "Cargo Terminal" })     │
  │  → docs/reports/healing-log.md lo row rasa                    │
  │                                                               │
  │  RUN 2: ✓ PASSED (14.2s)                                      │
  └───────────────────────────────────────────────────────────────┘
       │ returns chinna summary:
       │   FILES: playwright/e2e/dfwCargo.spec.ts
       │          playwright/support/pageObjects/facilities-po.ts
       │          playwright.config.ts
       │   TC_IDS: TC-010
       │   RESULT: 1 passed (14.2s)
       │   APP_BUGS: NONE
       ▼
─────────────────────────────────────────────────────────────────────
  Step 3: → test-reviewer subagent spawn (aa 3 files matrame)

  ┌─ REVIEWER (sonta context, NO Edit, NO Bash) ──────────────────┐
  │  review-tests checklist, best-practices, app-domain chadiva   │
  │  Aa 3 files ni chadiva                                        │
  │                                                               │
  │  Findings:                                                    │
  │  | Line | Severity | Current | Rule | Fix |                   │
  │  | 34 | [IMPORTANT] | address string spec lo inline undi     │
  │  |    |             | | best-practices §8 |                   │
  │  |    |             | | testdata/facilities.json loki move |  │
  │  | 12 | [SUGGESTION]| method peru getAddr() | naming |        │
  │  |    |             | | getCargoTerminalAddress() |           │
  │                                                               │
  │  Score: 8/10                                                  │
  │  → docs/reports/review-report.md rasa                         │
  └───────────────────────────────────────────────────────────────┘
       │ returns: "Score 8/10. No [CRITICAL].
       │           1 [IMPORTANT]: data inline at line 34."
       ▼
─────────────────────────────────────────────────────────────────────
  Step 4: [CRITICAL] ledu → fix loop SKIP

─────────────────────────────────────────────────────────────────────
  Step 5: REPORT

  Shipped TC-010 — DFW cargo terminal address.
  Files: playwright/e2e/dfwCargo.spec.ts,
         playwright/support/pageObjects/facilities-po.ts,
         playwright.config.ts
  Run: 1 passed (14.2s) — real browser run.
  Healed 1 locator (High confidence) — see docs/reports/healing-log.md
  Review: 8/10, no critical. 1 important: move the address literal
          into playwright/testdata/facilities.json.
  App bugs: none.
```

**App bug dorikithe ela untundi?** Same flow, kaani:

```
  │  RUN 1: ✗ FAILED —                                            │
  │    Expected: "DFW Cargo Terminal, 2400 W 32nd St"             │
  │    Received: "Page not found"                                 │
  │                                                               │
  │  CLASSIFY: Element dorikindi. Assertion disagree ayindi.      │
  │            app-domain ni check chesa:                         │
  │            "Flow 3: Facilities → DFW facility page shows      │
  │             cargo terminal address"                           │
  │            App ippudu 404 istondi → app-domain ki CONTRADICT  │
  │            → ★ APP BUG ★                                      │
  │                                                               │
  │  ACTION: Test ni MARCHALEDU.                                  │
  │          docs/reports/app-bugs.md lo file chesa:              │
  │            Expected (app-domain §Flow 3): cargo terminal page │
  │            Observed: 404 Page not found                       │
  │            Evidence: test-results/dfwCargo-TC010/trace.zip    │
  │            Affected TC-IDs: TC-010                            │
  │                                                               │
  │  RESULT: 1 failed — app bug, not a test bug                   │
```

Inka final report:

```
  Shipped TC-010 but it is RED, and that is correct.
  The app returns 404 for the DFW facility page; app-domain §Flow 3
  documents it should show the cargo terminal. Filed to
  docs/reports/app-bugs.md. Test left as written — do not "fix" it
  until the app is fixed.
```

**Ade asalu value.** Green kaadu — **nijam**.

---

# PART 5 — `/autopilot` — Maintenance Loop

`/ship-test` ante kotha test rayadam. `/autopilot` ante **unna suite ni
check chesi fix cheyyadam**.

Mee question lo "genuine failure ayithe report, lekapothe fix chesi re-run"
ane part — adi rendintilo undi. Kaani `autopilot` motham suite ki idi
chestundi.

```
/autopilot                 → smoke (default)
/autopilot regression      → motham suite
/autopilot <spec path>     → aa spec matrame
```

## Flow

```
Step 0 — SCOPE (inline)
  smoke / regression / spec path. Em run chestunnavo, enduko cheppu.
      ↓
Step 1 — RUN (inline, Bash)
  npm run pw:test:smoke  (leda pw:test)
  Capture: total, passed, failed, flaky, duration
  RunHistoryReporter automatic ga runs.jsonl ki append chestundi

  ★ Anni green aa? → Step 5 ki dooki, report ivvu.
    "A green run still deserves a report; that is how anyone knows
     the loop actually ran."
      ↓
Step 2 — CLASSIFY each failure (delegate)
  ★ OKKA subagent — prathi failure ki okkokkati KAADU ★
  general-purpose subagent, foreground.

  Deeniki istaru: failing test names, run output excerpt,
                  evidence paths (test-results/, C:\LogFolder\<run>\)

  Idi oka table matrame return cheyyali:
  | Test | Class | Evidence | Confidence |

  Classification table (signal meeda, symptom meeda kaadu):
  ┌──────────────────────────────────────┬──────────────────────┐
  │ TimeoutError, not found, strict-mode │ SELECTOR ROT         │
  │ Element dorikindi, assertion disagree│ TEST BUG             │
  │   + app-domain puratana expectation  │                      │
  │     correct ani confirm chestundi    │                      │
  │ Element dorikindi, assertion disagree│ ★ APP BUG ★          │
  │   + app app-domain ki contradict     │ Test ni MUTTUKOKU    │
  │ Mundu pass ayindi, ippudu fail,      │ FLAKE CANDIDATE      │
  │   change emi ledu, timing-sensitive  │                      │
  │ Page load avvaledu / wrong URL       │ ENVIRONMENT          │
  │                                      │ BASE_URL check cheyyi│
  └──────────────────────────────────────┴──────────────────────┘

  ★ Taruvata orchestrator ee verdicts ni cross-check chestundi:
    npm run history:json -- --runs 10
    "A test the history shows failing every run is NOT a flake,
     whatever a single run suggests — history beats a single-run
     impression."
      ↓
Step 3 — FIX what is safely fixable (delegate, ee order lo)

  SELECTOR ROT → test-builder subagent, heal-test follow
                 High/Medium confidence matrame
                 Low = report lo propose, apply KAADU
                 Prathi heal ki healing-log.md row

  TEST BUG     → test-builder subagent, aa specs ki scoped
                 generate-tests follow

  APP BUG      → ★ CODE CHANGE LEDU ★
                 docs/reports/app-bugs.md lo rayali:
                   expected (app-domain quote chesi), observed,
                   evidence path, affected TC-IDs

  FLAKE        → ★ CODE CHANGE LEDU ippudu ★
                 /detect-flaky ki note cheyyi — daaniki history undi judge chestundi

  Rendu fixable buckets lo emi lekapothe → Step 4 SKIP
  "do not re-run to watch the same failures again"
      ↓
Step 4 — PROVE IT (inline, Bash)
  ★ Affected specs ni MATRAME re-run cheyyi ★
  Real result report cheyyi, adi emaina saare.

  "This step exists because 'fix applied' and 'fix works' are
   different claims, and only the second one is worth anything."
      ↓
Step 5 — REPORT
  docs/reports/run-report.md + autopilot section:

  ## Autopilot actions
  - Healed: <test> — <old locator> → <new locator> (confidence, healing-log.md)
  - Fixed: <test> — <test lo em thappu undindo>
  - Filed: <n> app bug(s) — docs/reports/app-bugs.md
  - Left red: <test> — <enduku automatic ga fix cheyyadam safe kaadu>
  - Proposed, not applied: <low-confidence heals, human kosam waiting>
```

## Autopilot Yokka 5 Hard Limits

Skill lo ivi "the whole reason this is safe to run" ani rasi undi:

```
1. At most ONE fix-and-re-run cycle.
   Taruvata kuda red unte — AAPU inka report cheyyi.

2. Never make a test pass by weakening it.
   No deleted assertions, no waitForTimeout, no raised global timeouts,
   no added retries, no test.skip on a genuinely failing test.
   ★ "If the only way to green is to see less, the answer is
      'still red', and that is a perfectly good outcome." ★

3. App bugs are reported, never absorbed.

4. No commits, no pushes, no PRs.
   Working tree ni edit chestundi inka report istundi. Manishi commit chestadu.

5. Nothing is quarantined on one red run.
   Flake claims ki run history kavali (/detect-flaky), hunch kaadu.
```

## Eppudu `/autopilot` Vaadakudadu

```
- Kotha test kavali            → /ship-test
- Ye spec break ayindo telusu  → /heal-test leda /generate-tests direct ga
                                  (autopilot overhead motham suite ki matrame worth)
- App mid-deploy lo undi /
  environment down undi        → ★ AAPU ★
```

Aa chivari point chala important:

> A red suite against a dead environment is an **environment finding**, and
> every "fix" you make against it will be wrong. Check, then stop.

---

# PART 6 — 6 Invariants (Prathi Skill Ivi Follow Avutundi)

`skills/README.md` lo ivi okka chota rasi unnayi, inka **prathi skill lopala
malli repeat avutayi**. Aa repetition deliberate:

> The repetition is deliberate: these are the rules an agent under pressure to
> show progress will otherwise **rationalise away**.

```
1. Never reach green by seeing less.
   No deleted assertion, no waitForTimeout, no raised global timeout,
   no added retries, no test.skip on a genuinely failing test.

2. App bugs are reported, never absorbed.
   App app-domain ki contradict chesthe — test unnattu ne undi,
   bug docs/reports/app-bugs.md ki file avutundi.

3. Never claim a result you did not observe.
   Run cheyyani spec passing kaadu, adi ela kanipinchina saare.

4. Nothing is auto-applied at low confidence.
   Heals, flake verdicts, domain rules — anniti ki. Low confidence
   ante report cheyyali, act cheyyakudadu.

5. No commits, no pushes, no PRs.
   Skills working tree ni edit chestayi inka report istayi. Manishi commit chestadu.

6. Reviewers cannot edit; builders cannot review.
   Ivi .claude/agents/ lo tool lists dwara enforce ayyayi,
   instruction dwara kaadu.
```

---

# PART 7 — Validator

```bash
npm run skills:validate              # frontmatter, dead paths, dead refs
npm run skills:validate -- --strict  # warnings kuda fail avutayi
```

**Idi enduku undi?** README lo reason chala manchi ga cheppadu:

> The validator exists because **skills fail silently**: malformed frontmatter
> means a skill never loads, and a path that was renamed sends the agent
> somewhere that does not exist. **Neither produces an error at run time — the
> agent just does something slightly wrong and reports success.**

Ade asalu danger. Skill load avvakapothe error raadu — agent normal Claude la
behave chestundi inka "done" ani cheputundi.

| Level | Em check chestundi |
|---|---|
| **Errors** | Invalid/unclosed frontmatter, unknown key, `name` folder tho match avvakapovadam, missing/oversized description, referenced file/npm script/sibling skill lekapovadam |
| **Warnings** | Thin description, no `Use when...` trigger, missing `argument-hint`, missing Guardrails/Done-means/When-not-to-use, declared argument ni body chadavakapovadam, 500 lines daatadam |

CI lo `lint-skills` job ga run avutundi (`.github/workflows/playwright.yml`).

---

# PART 8 — Beginner → Advanced Path

## Level 1 — Just Use It

```
/ship-test user logs in with valid credentials and lands on the dashboard
```

Anthe. Taruvata ee files ni chadavandi:

```
docs/pipeline/test-scenarios.md    ← Ee TC create ayindo
docs/pipeline/test-strategy.md     ← Ye layer assign ayindo
playwright/e2e/<new>.spec.ts       ← Ee code rasindo
docs/reports/review-report.md      ← Review em cheppindo
docs/reports/healing-log.md        ← Emaina heal ayinda
```

## Level 2 — Stages Ni Separate Ga Nadapandi

```
/create-scenarios login          ← Aaru lenses apply avutayi chudandi
/test-strategy login             ← Layer decisions chudandi
/generate-tests TC-001           ← Code rayadam chudandi
/review-tests playwright/e2e/login.spec.ts   ← Review chudandi
```

Prathi stage output ni chusthe, `/ship-test` lopala em jarugutundo clear ga
ardham avutundi.

## Level 3 — Maintenance

```
/autopilot smoke                 ← Suite health check
/detect-flaky                    ← 30 runs history analysis
/run-report                      ← Business digest
/heal-test playwright/e2e/x.spec.ts   ← Okka spec ni heal
```

## Level 4 — `app-domain` Ni Nimpandi

Idi **highest leverage work**. `app-domain` ekkuva accurate ga unte, migata
anni skills ekkuva accurate avutayi.

```
/explore-app                     ← Live app crawl chesi draft istundi
                                   → docs/pipeline/domain-draft.md
                                 ← Meeru chadivi app-domain/SKILL.md loki merge
```

## Level 5 — Skills Ni Marchandi

Udaharanaki, mee team ki `data-testid` mandatory ante —
`playwright-best-practices/SKILL.md` §2 lo priority order ni marchandi:

```markdown
### Priority 1: data-testid (team standard)
page.getByTestId("submit-btn")

### Priority 2: Element IDs
page.locator("#username")
```

Taruvata:

```bash
npm run skills:validate
```

Ippudu **mudu skills** automatic ga aa kotha rule ni follow avutayi —
`generate-tests` (rayadaniki), `review-tests` (check cheyyadaniki),
`heal-test` (quality downgrade cheyyakudadu ani). Okka file marchi, moodu
behaviours marchesaru.

## Level 6 — Kotha Skill Rayadam

```bash
cp .claude/skills/TEMPLATE.md .claude/skills/my-skill/SKILL.md
# Edit chesi...
npm run skills:validate
# skills/README.md lo table ki row add cheyyandi
# Copilot pipeline ki kuda kavalante .github/prompts/ lo thin pointer add cheyyandi
```

Aa "thin pointer" idea important:

> add a thin pointer in `.github/prompts/` that **references the SKILL.md
> rather than restating it. One source of truth per step.**

---

# PART 9 — Gotchas

1. **`app-domain` khali unte motham pipeline guesswork.** Idi modati pani.
   Konni skills adi khali unte **run cheyyadaniki refuse chestayi** — adi
   feature, bug kaadu.

2. **`/ship-test` okka scenario ki matrame.** Motham feature ki scenarios
   kavalante `/create-scenarios` batch mode vaadandi.

3. **Fix cycle okkasari matrame — rendintilo.** Taruvata kuda red unte, adi
   report avutundi. Ade correct behaviour. Loop ni marchakandi.

4. **App bug ni "fix" cheyyakandi.** Test red ga undadam correct answer
   kavachu. `docs/reports/app-bugs.md` ni regular ga chudandi.

5. **Reviewer eppudu code ni marchadu.** "Fixed it" ani cheppadu. Fix
   kavalante builder ni malli spawn cheyyali (ship-test Step 4 automatic ga
   chestundi).

6. **Okka red run tho "flaky" ani cheppakandi.** `/detect-flaky` ki
   `runs.jsonl` history kavali. `consistently-failing` anedi flaky **kaadu** —
   adi regression.

7. **Skills silent ga fail avutayi.** `npm run skills:validate` ni regular ga
   run cheyyandi.

8. **Orchestrator eppudu delegate chesina daanini chadavakudadu.** Adi
   chadivithe cost model break avutundi. `/ship-test` ni "help" cheyyadaniki
   file paste cheyyakandi.

9. **`disable-model-invocation: true`** unna skills ni Claude sonta ga
   pilavadu. Meeru `/name` ani type cheyyali. (`ship-test` ki idi **ledu** —
   ante meeru scenario describe chesthe adi automatic ga trigger avvachu.)

10. **Environment down unte AAPANDI.** Dead environment meeda chesina prathi
    "fix" thappu ga untundi.

---

# Summary

**Skills** = markdown files lo rasina instructions. 15 unnayi — 2 reference
(chadivedi matrame), 8 authoring, 5 maintenance.

**Agents** = separate Claude instances, sonta context inka sonta tools tho.
Rendu unnayi — `test-builder` (write + run cheyyagaladu) inka `test-reviewer`
(chadavagaladu, **marchaledu**, run cheyyaledu).

**Rendu entry points:**

```
/ship-test <scenario>     → kotha test: scenario in, reviewed passing spec out
/autopilot [scope]        → unna suite: run → classify → fix → prove → report
```

**Mee question ki answer — genuine failure ni ela detect chestundi:**

Test fail ayinappudu, **emi marchadaniki mundu** classify chestundi:

- Element **dorakaledu** → selector rot → heal chesi malli run
- Element **dorikindi**, assertion fail, **app-domain lo puratana rule correct**
  → mana test bug → fix chesi malli run
- Element **dorikindi**, assertion fail, **app app-domain ki contradict**
  → ★ **APP BUG — test ni muttukokudadu, file chesi red ga vadileyyali** ★
- **Low confidence** deni meeda ayina → apply cheyyakudadu, report cheyyali

**Aa classification ki foundation `app-domain`.** Adi lekapothe "mana thappa,
valla thappa" ani cheppalemu. Anduke adi motham pipeline lo most important file.

**Inka fix cycle okkasari matrame** — endukante loop ni open ga vadilithe,
progress chupinchali ane pressure lo AI assertions ni weaken cheyyadam
modalupedutundi. Green anedi goal kaadu. **Nijam cheppadam** goal.
