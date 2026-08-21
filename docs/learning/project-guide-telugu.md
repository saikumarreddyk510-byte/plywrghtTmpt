# <span style="color:#0B7285;"><strong>PlayWrightAI — Ee Project Em Cheyagaladu? (Telugu + English Guide)</strong></span>

> Ee file lo: project enti, em features unnayi, "100% AI-driven" ante exactly
> enti, and ee stage lo manam ekkada unnam — simple ga, Telugu-English mix lo.

---

## <span style="color:#364FC7;"><strong>1) One Line Lo Cheppalante</strong></span>

> **Nuvvu oka scenario English lo cheppu → AI dhaanini working Playwright test
> ga rasi, real browser lo run chesi, pass ayye varaku fix chesi istundi.**

Antha kaadu. Aa test tarvata break aithe, **AI ye** debug chesi, fix chesi,
report kuda istundi. Ee rendo part ye asalu important — endukante test rayadam
oka roju panii, dhaanini **maintain cheyyadam** years panii.

**Real life analogy:**

> Oka new employee ni join chesukunnav anuko. Modati roju test rayadam
> nerpistav. Kani prathi roju "ee test enduku fail ayindi?" ani nuvve chudali
> ante, aa employee valla labham thakkuva. Ee project lo AI ki **rendu**
> nerpincham — rayadam **and** maintain cheyyadam.

---

## <span style="color:#5F3DC4;"><strong>2) Project Lo Rendu Layers Unnayi</strong></span>

Idi confusion ki main reason, so clear ga:

| Layer           | Enti idi                                                               | Ekkada undi              |
| --------------- | ---------------------------------------------------------------------- | ------------------------ |
| **Framework**   | Normal Playwright + TypeScript code. AI lekapoyina idi pani chestundi. | `playwright/` folder     |
| **AI Pipeline** | Skills — AI ki "ela pani cheyyalo" cheppe instruction files            | `.claude/skills/` folder |

<p><span style="color:#C92A2A;"><strong>Important:</strong></span> AI pipeline anedi
framework <strong>paina</strong> kurchuni undi, dhaani <strong>lopala</strong>
kaadu. Repa AI vaddu anukunte, <code>.claude/</code> delete chesina tests
normal ga run avutayi. Idi deliberate design.</p>

---

## <span style="color:#2B8A3E;"><strong>3) Ee Project Em Cheyagaladu? — Features List</strong></span>

### <span style="color:#364FC7;">A) Test Rayadam (Authoring)</span>

| Feature          | Command                     | Em chestundi                                                                                                                    |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Scenario create  | `/create-scenarios`         | App domain chusi 6 lenses tho TC-### scenarios rasthundi (happy path, business rules, security, negative, edge cases, UI state) |
| Layer decide     | `/test-strategy`            | Ee test E2E aa? API aa? Unit aa? — decide chestundi. "Anni E2E lo pettodhu" ani warn chestundi                                  |
| Test rayadam     | `/generate-tests`           | Page Object + spec + config entry rasi, **real browser lo run chesi**, pass ayye varaku debug chestundi                         |
| Review           | `/review-tests`             | Best practices ki against ga check chestundi. Idi **rayadu**, only report chestundi                                             |
| **Anni okesari** | **`/ship-test <scenario>`** | Paina anni steps ni auto ga chestundi — one prompt, one passing test                                                            |

### <span style="color:#364FC7;">B) Test Maintain Cheyyadam (Maintenance) — Idi Real Power</span>

| Feature          | Command          | Em chestundi                                                                                            |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| Self-healing     | `/heal-test`     | App lo button id change aithe, AI aa element ni **semantic ga** vetiki, locator ni fix chestundi        |
| Flaky detection  | `/detect-flaky`  | Run history chusi "ee test nijam ga flaky aa, leda roju fail avutunda?" ani cheptundi                   |
| **Anni okesari** | **`/autopilot`** | Suite run → fail ayina vaatini classify → fix cheyyagalige vaatini fix → malli run chesi prove → report |

### <span style="color:#364FC7;">C) Coverage Penchadam</span>

| Feature       | Command               | Em chestundi                                                                                                                         |
| ------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| App explore   | `/explore-app`        | Live app ni crawl chesi, flows/rules/data models ni **AI ye** document chestundi                                                     |
| API tests     | `/generate-api-tests` | Browser avasaram leni rules ni API layer lo test chestundi (fast + stable)                                                           |
| Test data     | `/generate-testdata`  | Boundary values + XSS/SQL injection lanti adversarial data generate chestundi                                                        |
| Accessibility | `/audit-a11y`         | Blind/keyboard users ki app work avutunda ani check chestundi                                                                        |
| Report        | `/run-report`         | Manager ki ardham ayye plain English report — "DFW facility hours kanipinchatledu" laaga, `facilities.spec.ts:88 failed` laaga kaadu |

---

## <span style="color:#5F3DC4;"><strong>4) Full Flow — Idea Nundi Report Varaku</strong></span>

```
   Nuvvu: "Login page lo wrong password pettina error ravali"
                          │
                          ▼
              /ship-test  ← ONE COMMAND
                          │
   ┌──────────────────────┼──────────────────────┐
   │                      │                      │
   ▼                      ▼                      ▼
Scenario rasi        Real browser lo         Best practices
TC-301 ga            selectors verify        review
document chestundi   chesi test rasthundi    chestundi
   │                      │                      │
   └──────────────────────┼──────────────────────┘
                          ▼
              ✅ Passing test ready
                          │
                    (2 vaaralu tarvata app change aindi)
                          │
                          ▼
              /autopilot  ← ONE COMMAND
                          │
   ┌──────────────────────┼───────────────────────┐
   ▼                      ▼                       ▼
Test run chestundi   Enduku fail ayindo      Fix chesi malli
                     kanukkuntundi           run chesi prove
   │                      │                       │
   └──────────────────────┼───────────────────────┘
                          ▼
         Report + "ee 2 app bugs unnayi" ani cheptundi
```

---

## <span style="color:#C92A2A;"><strong>5) "100% AI-Driven" Ante Exactly Enti?</strong></span>

Chala mandi ee word ni thappu ga ardham chesukuntaru. So clear ga:

### <span style="color:#2B8A3E;">❌ Idi kaadu:</span>

> "AI anni chestundi, manam emi chudakkarledu, review kuda avasaram ledu"

Idi **danger**. Enduku ante — AI ki "test pass avvali" ane goal iste, dhaaniki
oka easy shortcut undi: **assertion ni theesesi test ni green chesukovadam.**
Appudu test green, kani adi emi test cheyyatledu. Idi worst outcome — bug undi,
ani manaki teliyadu.

### <span style="color:#2B8A3E;">✅ Idi correct meaning:</span>

> **Pani antha AI chestundi. Decisions matram human confirm chestadu.**

Ante — 10 gantalu pattina work AI 10 nimushallo chestundi, kani "ee change
correct aa?" ane final call manadi.

### <span style="color:#364FC7;">Ee project lo AI ekkada full ga chestundi:</span>

| Stage                         | AI % | Explanation                                                   |
| ----------------------------- | ---- | ------------------------------------------------------------- |
| Scenario rayadam              | 100% | Domain chusi anni cases AI ye rasthundi                       |
| Layer decide cheyyadam        | 100% | Rules clear unnayi, AI apply chestundi                        |
| Test code rayadam             | 100% | Real browser lo verify chesi rasthundi                        |
| Test run cheyyadam            | 100% | CI lo automatic                                               |
| Fail ayite diagnose cheyyadam | 100% | Trace + screenshot + history chusi                            |
| Locator fix cheyyadam         | 95%  | Confidence ekkuva unte auto-apply, thakkuva unte propose only |
| Report rayadam                | 100% | Business language lo                                          |

### <span style="color:#364FC7;">Human ekkada avasaram (deliberate ga):</span>

| Gate                                 | Enduku ee gate undi                                                                                                                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app-domain` file confirm cheyyadam  | Idi **oracle** — "app ela pani cheyyali" ane truth. Ee file lo oka thappu line unte, dhaani base meeda rasina **anni** tests thappu avutayi. So `/explore-app` draft istundi, nuvvu confirm chestav. |
| App bug vs test bug decide cheyyadam | AI ki app contradict aithe, adi test ni marchadu — `docs/reports/app-bugs.md` lo rasi **red ga vadilestundi**. Enduku? App bug ni test lo "fix" cheyyadam ante, bug ni dhaachadam.                   |
| Low-confidence locator fix           | Thappu element ki point chese locator kanna, red test better.                                                                                                                                        |
| Quarantine cheyyadam                 | Oka roju fail aithe "flaky" ani anakudadhu. History kavali — adi `.test-history/` lo undi.                                                                                                           |
| Commit / merge                       | AI code rasthundi, kani commit **nuvve** chestav.                                                                                                                                                    |

<p><span style="color:#C92A2A;"><strong>Gurthu pettuko:</strong></span> Ee gates
<strong>limitation kaadu — feature</strong>. Ivi lekapote, AI konni vaaralaki
suite ni green ga marchestundi, kani aa green ki value undadu.</p>

---

## <span style="color:#5F3DC4;"><strong>6) `/autopilot` Ki Unna Hard Limits (Chala Important)</strong></span>

Ee 5 rules skill file lo **rasi unnayi** — advice kaadu, rules:

1. **Okka sari matrame** fix chesi malli run chestundi. Inka red unte agipothundi.
2. **Test ni weak chesi green cheyyadu** — assertion delete cheyyadu,
   `waitForTimeout` add cheyyadu, timeout penchadu, retry add cheyyadu.
3. **App bug ni file chestundi, test lo absorb cheyyadu.**
4. **Commit cheyyadu, push cheyyadu.**
5. **Oka red run tho quarantine cheyyadu.**

> Simple ga: "Inka red ga undi" ani cheppadam kuda oka **correct answer**. Adi
> cheppagalige AI ye trust cheyyadaniki worth.

---

## <span style="color:#2B8A3E;"><strong>7) Run History — Ee Project Ki "Memory"</strong></span>

Prathi run tarvata, prathi test ki oka line `.test-history/runs.jsonl` lo
add avutundi: pass aindaa, entha time paattindi, fail aithe **e type** failure.

Enduku idi important?

> **History lekapote "flaky" anedi oka feeling. History unte adi oka number.**

```
npm run history:analyze
```

Idi run cheste ee table vastundi:

| verdict                | meaning                              | em cheyyali                                                             |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `stable`               | Prathi sari pass                     | Emi cheyyakkarledu                                                      |
| `flaky`                | Kondaka sari pass, kondaka sari fail | `/detect-flaky` — cause kanukko                                         |
| `consistently-failing` | Eppudu pass avvatledu                | Idi **flaky kaadu** — idi broken. Playwright HTML report lo trace chudu |
| `insufficient-data`    | Inka thakkuva runs                   | Data kosam wait cheyyi                                                  |

<p><span style="color:#C92A2A;"><strong>Key point:</strong></span> Roju fail ayye
test <strong>flaky kaadu</strong> — adi <strong>broken</strong>. Ee rendintini
kalipite, real regression ni "just flaky" ani vadilestaru. Adi chala danger.</p>

---

## <span style="color:#364FC7;"><strong>8) Commands Cheat Sheet</strong></span>

### AI commands (Claude Code lo type cheyyi)

```
/ship-test <scenario>     ← Kotha test kavali
/autopilot                ← Suite check chesi fix cheyyi
/explore-app              ← Kotha app — domain draft cheyyi
/heal-test <spec>         ← Locator break ayindi
/detect-flaky             ← "Random ga fail avutundi" ante
/run-report               ← Manager ki report kavali
/audit-a11y               ← Accessibility check
/generate-api-tests       ← API layer tests
/generate-testdata        ← Boundary + security data
```

### Terminal commands

```powershell
npm run pw:test             # anni tests
npm run pw:test:smoke       # smoke matrame (fast)
npm run pw:test:headed      # browser kanipistundi
npm run pw:test:api         # API tests matrame
npm run pw:test:a11y        # accessibility audit
npm run history:analyze     # flaky stats
npm run report:open         # Allure HTML report
npm run typecheck           # TypeScript errors unnaya check
```

---

## <span style="color:#5F3DC4;"><strong>9) Ekkada Em Undi — Quick Map</strong></span>

```
playwright/
  e2e/            ← UI tests ikkada rastam
  api/            ← API tests
  testdata/       ← JSON data (fixed values STORE chestundi)
  support/
    pageObjects/  ← Prathi page ki oka class
    commonFunctions/ ← Logging, login, shared state
    api/          ← ApiClient
    a11y/         ← Accessibility scan
    data/         ← dataFactory (values GENERATE chestundi)
    reporting/    ← Reporters, history, teardown

docs/
  README.md       ← Index — e file enti ani telusukovadaniki
  architecture.md ← Design enduku ilaa undi
  quickstart.md   ← Step-by-step start
  pipeline/       ← AI skills READ chese files (scenarios, strategy)
  reports/        ← AI skills WRITE chese files (manam chadavadaniki)
  learning/       ← Ee file, and mee notes

.claude/skills/   ← AI ki instructions (15 skills)
.test-history/    ← Prathi run record (memory)
```

<p><span style="color:#2B8A3E;"><strong>Naming rule:</strong></span>
<code>data/</code> = values <strong>generate</strong> chestundi.
<code>testdata/</code> = values <strong>store</strong> chestundi. Rendu different
pani, so rendu different peru.</p>

---

## <span style="color:#C92A2A;"><strong>10) Inka Em Migilindi? (Honest List)</strong></span>

| Enti                                       | Enduku inka cheyyaledu                                                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual regression** (screenshot compare) | Baseline images store cheyyali + AI tho compare cheyyali. Pixel diff matram pette false positives ekkuva vastayi, appudu evaru nammaru. Idi periya pani.                                                       |
| **Unit tests**                             | Idi **deliberate ga vaddu** ani decide chesam. Unit tests app repo lo, code pakkana undali — ikkada kaadu.                                                                                                     |
| **Parallel execution**                     | Ippudu `fullyParallel: false` — endukante anni Page Objects oke `globalVariables.page` share chestunnayi. Fix cheyyalante **anni** Page Objects marchali. Adi periya breaking change, so adi manishi decision. |

---

## <span style="color:#0B7285;"><strong>11) Summary — Okka Paragraph Lo</strong></span>

> Ee project oka **normal Playwright framework** + **15 AI skills** kalipi
> chesindi. Nuvvu English lo scenario cheppithe test vastundi (`/ship-test`).
> Test break aithe AI ye fix chestundi (`/autopilot`). Prathi run record
> avutundi, so "flaky" anedi feeling kaadu, number. API, accessibility, security
> data — anni layers unnayi. AI **pani antha** chestundi, kani **decisions** —
> domain confirm cheyyadam, app bug vs test bug, commit — avi manam chestam.
> **Adi bug kaadu, adi design.**

---

_Related: [architecture.md](../architecture.md) (full design), [quickstart.md](../quickstart.md) (step-by-step), [roadmap.md](../roadmap.md) (em migilindi)_
