# Card Time: Build Plan

A payroll time-conversion hub of six tool pages: a weekly time card calculator, an hours calculator, a minutes ↔ decimal converter (two pages, one per direction), a military time converter and an overtime calculator.
Strategy: win the long tail with tools that are better than the SaaS lead-magnet widgets, then build toward the head terms over time.

---

## 1. Positioning

**What it is:** the fastest free payroll time calculator on the web. No sign-up. Your data stays in your browser, and you can share a time card with a link.

**Who it serves**
| User | Job to be done | What brings them back |
|---|---|---|
| Hourly employee | "Is my paycheck right?" | A time card saved in the browser, reused every week |
| Small-business owner / manager | Total hours for 1–15 people every pay period | Several saved cards, CSV export, a printable chart |
| Payroll / HR clerk | Convert punch times to decimal for payroll software | The decimal chart pinned to the wall, the converter bookmarked |

**Differentiators** (each one targets a weakness of the current page one)
1. **No sign-up, no email gate.** The SaaS widgets exist to capture leads, and this site doesn't need to.
2. **Share by link.** The time card state is encoded in the URL fragment (`#…`), so it never reaches a server. The manager opens the link and sees exactly what the employee entered.
3. **State overtime and meal-break rules.** Federal FLSA, plus California daily OT, 7th-day OT and meal-break flags at launch, with more states added through config.
4. **A printable decimal chart** for 1–60 minutes, printable from the converter page and downloadable as a PDF.
5. **Fast entry.** Typing `830a`, `8:30`, `1730` or `5:30p` all work. Tab moves through the cells, and it runs well on a phone.

---

## 2. Domain decision

**Decided: `hourstotal.com`.** One brandable domain for the whole hub. The notes below are the earlier reasoning.

- **Use one domain.** Splitting the cluster across three EMDs would split link equity three ways, and link equity is the scarcest resource here.
- **Recommendation: `WeeklyTimecardCalculator.com` as the primary.** It covers the biggest cluster (time card, 347k) and fits the "time card with lunch" and "free time card" long tails. Minutes-to-decimal pages sit naturally under it.
- **Alternative:** a short brandable `.com`, if one is available, works better for affiliate trust and for eventually ranking on the head term. EMDs give little ranking boost today.
- Register `MinutesToDecimalHours.com` defensively (it costs ~$10/yr) and 301 it to `/minutes-to-decimal/`. Skip `.net`.

---

## 3. Site architecture and keyword map

Structure set by the SERP-overlap check of 3 Oct 2026 (US web-search index, about 9 results per keyword, used as a proxy for Google). Keywords whose page-one results are the same pages share one page here.

### Core tool pages

| URL | Keywords covered (vol/mo) | What the page is | Phase |
|---|---|---|---|
| `/` (the time card calculator) | time card calculator (201k), hours worked / work hours calculator (135k), timesheet calculator (90.5k), time clock calculator (135k grouped), time card calculator with lunch (6.6k), free time card (27.1k) | Weekly time card tool. Lunch columns visible by default. Title carries "Free", "lunch break" and "overtime"; print and PDF export are prominent; H2s and FAQ cover "timesheet", "hours worked" and "time clock" | 1 |
| `/minutes-to-decimal/` | minutes to decimal (27.1k), convert time to decimal (18.1k), decimal hours chart (5.4k), minute to decimal chart (4.4k), 40 minutes in decimal (8.1k) + siblings | Converter (minutes and H:MM:SS input) with the printable 1–60 chart on the same page, as text with an anchor per row | 1 |
| `/decimal-to-minutes/` | decimal to minutes (6.6k) | Reverse converter | 1 |
| `/hours-calculator/` | hours calculator (368k) | Single start-and-end-time tool: "hours between two times" | 2 |
| `/overtime-calculator/` | overtime calculator (22.2k) | OT pay calculator (rate × hours by tier) | 2 |
| `/military-time-converter/` | military time converter (135k) | 12h ↔ 24h converter plus a printable conversion chart | 2 |

**Homepage = the time card.** The homepage collects most of a site's links, and the time card cluster needs them most, so the tool lives at `/` and there is no separate `/time-card-calculator/` URL. The other five pages are linked from the header and from a tool grid below the calculator.

**Keeping `/hours-calculator/` apart from the time card.** The two would compete if they looked alike. The hours calculator is one start time, one end time, an optional break and a result. It has no week grid, no pay rate and no overtime. Its copy talks about "hours between two times" and never about time cards or timesheets, and it links to the time card for anything weekly.

### What the check removed
- `/hours-worked-calculator/`: folded into the time card page (4 of 9 results shared).
- `/time-card-calculator-with-lunch/`: folded into the time card page.
- `/time-to-decimal/` and `/decimal-hours-chart/`: folded into `/minutes-to-decimal/`. The chart keeps its print stylesheet and PDF download, but has no indexable page of its own.
- `/minutes/40-minutes-in-decimal/` ×59: not built. For "40 minutes in decimal", chart and converter pages rank (4 of 10), and the dedicated pages that rank are homework Q&A sites, not tool sites with per-minute pages. The chart rows on `/minutes-to-decimal/` target these searches instead (see §4.3).
- `/free-time-card/`: folded into the time card page. All nine results for "free time card" are calculators, four of them the same pages that rank for the head term. No template page.
- `/california-time-card-calculator/` and `/biweekly-time-card-calculator/`: these were not checked, but both are variants of the time card and would probably hit the same results. They become options on the time card (rule-set selector, biweekly toggle). California search demand is served by the state page and guides, which target "California overtime rules", a different query.

### Supporting pages

| URL | Keyword | Notes |
|---|---|---|
| `/states/{state}/` | "{state} overtime rules" | Only for states with distinct rules (CA, AK, NV, CO) |
| `/guides/…` | how-to long tail | See §7 |
| `/best-time-tracking-apps/` | commercial comparisons | Affiliate money page |
| `/embed/` | — | Embeddable widget / chart for link earning |

**Left out for now:** time duration calculator (135k). It shares no pages with "hours calculator", so it would need a seventh tool page. Revisit after Phase 2.

---

## 4. Tool specifications

### 4.1 Calculation engine (shared, pure TypeScript)
- **Store all time as integer minutes internally.** Convert to decimal only for display, which avoids float drift (0.1 + 0.2).
- Parse flexible input: `8`, `830`, `8:30`, `8:30a`, `0830`, `20:30`, `8.5` (decimal hours).
- Shifts that cross midnight: if out < in, add 24h.
- Multiple punch pairs per day (in/out/in/out). An unpaid break can be entered as a duration *or* as a punch pair.
- **Rounding modes:** exact; nearest 5 min; nearest 6 min (1/10 h); nearest 15 min (the 7-minute rule, 29 CFR 785.48(b)). Rounding applies per punch or per day, and the user chooses which.
- **Decimal display precision:** 2 places (payroll default) or 3/4. The page explains that 0.67 and 0.667 differ by about 1¢/hr at typical wages.
- 100% unit-test coverage on the engine (Vitest), including a golden-file test suite of tricky cases: midnight crossover, the 7th CA day, 12+ hour days, a lunch longer than the shift.

### 4.2 Minutes ↔ decimal converter
- Two-way live fields: H:MM ↔ decimal hours. Also handles minutes-only, H:MM:SS and decimal → H:MM.
- The 1–60 chart below it highlights the current value (see §4.3).
- "Copy" buttons and a "batch mode" textarea: paste a column of times and get a column of decimals, for clerks.

### 4.3 Printable decimal chart
- Lives on `/minutes-to-decimal/`, below the converter. It is not a separate page.
- The full 1–60 chart is real HTML text, never an image. Columns: minutes, decimal (2 places), decimal (3 places) and the quarter-hour rounded value.
- **Each row reads as a liftable sentence**, such as "40 minutes = 0.67 hours", so a search engine can quote it for "X minutes in decimal" searches. This replaces the per-minute pages.
- **Each row has its own anchor** (`/minutes-to-decimal/#40-minutes`), so a result can jump straight to it. Arriving on an anchor highlights the row and fills the converter with that value.
- A "Print chart" button uses a print stylesheet that hides everything but the chart (one page, US Letter/A4).
- A static pre-built PDF download (`public/decimal-hours-chart.pdf`, generated by `npm run pdf`), which is also a link-earning asset.

### 4.4 Weekly time card
- 7 rows (with the week start day configurable). Each row has In / Lunch start / Lunch end / Out, plus Daily total (H:MM and decimal). The lunch columns are visible by default, because this page also serves the "with lunch" searches. A break can be entered as a duration instead.
- **Inputs:** hourly rate, OT rule set (Federal, California, Alaska, Nevada, Colorado), rounding mode, and an optional 2nd rate for double time (derived automatically).
- **Outputs:** regular / OT 1.5× / DT 2× hours, gross pay by tier, and the weekly total.
- **Meal-break flags (CA), built:** the card shows warnings and doesn't adjust pay.
  - A 30-min meal is required before the end of the 5th hour, and a 2nd one for shifts over 10 h. The waiver conditions are noted.
  - It notes that a missed meal may owe 1 hour of premium pay. This appears as an informational line, not a computed amount.
- **Persistence:** cards autosave to `localStorage` and can be named ("Maria – week of 9/29"). A list of saved cards serves managers, and data never leaves the device.
- **Share link:** state → JSON → compressed (lz-string) → base64url in `#c=…`. Opening the link loads a read-only view, which has a "Make a copy" button.
- **Export:**
  - CSV, one row per day plus a totals row, ready to paste into payroll software.
  - PDF via print stylesheet (zero dependencies) plus a "Download PDF" button using jsPDF + autotable (lazy-loaded).
  - "Print blank time card" prints the empty grid for filling in by hand. This covers anyone who searched "free time card" wanting a printable.
  - Print and PDF ship in Phase 1 and sit next to the result, not in a menu.
- **Biweekly mode (a toggle, not a separate page):** 14 rows. OT is still computed per *workweek*, and the UI explains why.

### 4.5 Overtime rule sets (data-driven config)

Each state is a config object, so adding one means adding data plus tests, not new code.

| Rule set | Daily OT | Daily DT | Weekly OT | Other |
|---|---|---|---|---|
| Federal (FLSA) | — | — | >40 h @1.5× | — |
| California | >8 h @1.5× | >12 h @2× | >40 h @1.5× (excluding hours already paid as daily OT) | 7th consecutive day: first 8 h @1.5×, beyond 8 @2×. Meal-break flags |
| Alaska | >8 h @1.5× | — | >40 h @1.5× | Employers with 4+ employees |
| Nevada | >8 h in 24h @1.5× | — | >40 h @1.5× | Applies only if rate < 1.5× state minimum wage (show a toggle) |
| Colorado | >12 h/day or >12 consecutive h @1.5× | — | >40 h @1.5× | COMPS Order #40; whichever method pays more applies |

> **Checked against primary sources on 3 Oct 2026; see [LEGAL-SOURCES.md](LEGAL-SOURCES.md).** Re-check each January (Colorado issues a new COMPS Order) and each July (Nevada's daily-overtime wage threshold). Each rule page shows a "last reviewed" date and a disclaimer that it isn't legal or payroll advice.

### 4.6 Hours calculator (Phase 2)
- One start time, one end time, an optional break → hours (H:MM + decimal). Handles shifts past midnight.
- No week grid, pay rate or overtime, so it stays distinct from the time card.
- "Add to a weekly time card" link, which connects the tools and increases pages per session.

### 4.7 Military time converter (Phase 2)
- Two-way live fields: 12-hour ↔ 24-hour. Reuses the engine's time parser.
- A printable 24-hour conversion chart on the same page.
- Links to the time card, which accepts 24-hour entry.

### 4.8 Overtime calculator (Phase 2)
- Inputs: hourly rate, regular hours, OT hours (and double-time hours), with the multiplier editable.
- Output: pay by tier and total. A rule-set selector explains which hours count as OT in that state.
- Links to the time card for people who need the hours worked out from punch times.

---

## 5. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** (static output) + **Preact** islands for the tools | Pages ship as pure HTML, only the tool hydrates, and Core Web Vitals stay top-tier |
| Language | TypeScript | Shared engine across tools |
| Styling | Hand-written CSS with custom properties, plus a print stylesheet | Small, with full control over print |
| Tests | Vitest (engine), Playwright (tool flows, print snapshot) | The engine's correctness is the product |
| Hosting | **Cloudflare Pages** (free tier) | Global CDN and instant deploys, with no server to run |
| Analytics | Plausible or Cloudflare Web Analytics + Google Search Console | Privacy-friendly, which fits the "your data stays local" message |
| PDF | jsPDF + jspdf-autotable (lazy-loaded) | Client-side only |
| Share links | lz-string | Compact URL fragments |
| Schema | `WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList` JSON-LD | Rich results |

**Repo layout**
```
/src
  /engine        parse.ts, round.ts, overtime.ts, rules/{federal,ca,ak,nv,co}.ts, export.ts, share.ts
  /components    TimeCard.tsx, Converter.tsx, HoursCalc.tsx, MilitaryTime.tsx, OvertimeCalc.tsx, DecimalChart.astro
  /pages         index.astro (time card), minutes-to-decimal.astro, decimal-to-minutes.astro, hours-calculator.astro,
                 military-time-converter.astro, overtime-calculator.astro, …
  /content       guides/*.md (Astro content collections)
/public          decimal-hours-chart.pdf, blank-time-card.pdf
/tests           engine/*.test.ts, e2e/*.spec.ts
```

**Performance budget:** LCP < 1.5s on mobile 4G, JS < 40 KB gzipped per tool page (excluding lazy PDF), CLS 0. Reserve fixed-size ad slots so ads can't cause layout shift later.

---

## 6. Monetization

1. **Affiliate (primary).** Gusto, Homebase, QuickBooks Time, plus candidates like Connecteam and When I Work. Check each program's current terms, commission and approval rules before relying on it.
   - **Placement:** a single contextual card *below the result*, where the employer user's intent peaks: "Doing this every pay period? Homebase tracks hours and runs payroll automatically."
   - **Persona targeting:** show it after a 2nd saved card, or on a biweekly/multi-employee pattern. Those people are managers; employees checking a paycheck don't convert.
   - **Money page:** `/best-time-tracking-apps/` and "X vs Y" comparisons, built honestly from hands-on trials.
2. **Display ads (secondary, later).** Apply to a premium network once traffic qualifies. Keep ads *out* of the tool area and the printable views.
3. **No paywall.** "No sign-up" is the moat. A possible later upsell: optional cloud sync / team accounts, only if demand appears.

**Compliance:** an FTC affiliate disclosure near the links, a privacy policy (an easy one: no tool data is collected), and a cookie-consent banner only once ads or affiliate tracking cookies are added.

---

## 7. Content and SEO plan

**On-page, for every tool page:** the tool sits above the fold, followed by a short direct answer, a worked example, the chart or table, an FAQ (with FAQPage schema), and internal links to sibling tools. The tool loads first and stays visible, unlike the SaaS widgets that hide it behind a form.

**Guides, around 12 at launch + 2/month after**
- How to convert minutes to decimal for payroll
- How to calculate hours worked (with lunch)
- The 7-minute rounding rule explained
- California overtime rules, with worked examples
- California meal and rest break rules
- Daily vs weekly overtime: which states have daily OT?
- Biweekly vs semi-monthly pay periods and overtime
- How to check your paycheck hours
- Decimal hours vs hours:minutes: why payroll uses decimals
- Time card rounding: is it legal?
- How to fill out a paper time card (links to the blank printable card)
- How to calculate overtime pay

**E-E-A-T:** an About page that names who maintains the site, a "how we calculate" methodology page that cites the regulations, and "last reviewed" dates. Ideally, have a payroll professional (CPP) review the rule pages; a freelance review is cheap.

**Link earning** (the head terms need links, and SaaS competitors have them)
- **Printable chart + blank time card PDF:** pitch them to union locals (one already ranks with a PDF), HR blogs, small-business resource pages, community colleges and workforce boards.
- **Embeddable widget:** `/embed/` offers a copy-paste converter or chart with an attribution link, which spreads naturally into intranets and blogs.
- **Unlinked mentions and resource pages:** "payroll resources", "small business tools" lists.
- **Community:** genuinely answer questions in r/smallbusiness, r/Payroll and r/AskHR, linking only where it helps.
- **The copleys.com angle:** the old page proves how valuable an aged, linked tool is. Find who links to it and offer the modern equivalent.

---

## 8. Phased roadmap

| Phase | Timeline | Deliverables | Exit criteria |
|---|---|---|---|
| **0: Setup** | Days 1–3 | Register the domain(s). Set up the repo, Astro, CI and Cloudflare Pages. Set up GSC + analytics | Deploy pipeline is live |
| **1: Long-tail MVP** | Weeks 1–3 | Engine + tests; `/minutes-to-decimal/` with chart + PDF; `/decimal-to-minutes/`; weekly time card at `/` (federal OT, lunch, rounding, localStorage, share link, CSV, print, PDF export, blank printable card); legal and privacy pages | Lighthouse ≥ 95 on all pages, engine coverage 100%, launched and indexed |
| **2: Depth** | Weeks 4–7 | `/hours-calculator/`; `/overtime-calculator/`; `/military-time-converter/`; CA/AK/NV/CO rule sets + meal flags; biweekly toggle; first 12 guides | All six tool pages live; first long-tail page-1 rankings |
| **3: Monetize + links** | Months 2–4 | Affiliate cards + comparison page; embed widget; outreach campaign (target 30–50 referring domains); state pages | First affiliate conversions; referring domains growing |
| **4: Head-term push** | Months 5–12 | Content refreshes, more links, UX iteration based on analytics; apply to an ad network | Top-10 for "time card calculator" / "hours worked calculator" (same page), then "hours calculator" |

---

## 9. KPIs

- **SEO:** long-tail keywords in the top 10 (goal: 20 by month 3); referring domains; impressions/clicks in GSC.
- **Engagement:** tool interaction rate (goal > 60% of sessions); return visitors (the bookmark thesis predicts > 25%); saved cards per user; share links created.
- **Revenue:** affiliate CTR on employer-pattern sessions; EPC; RPM once ads run.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Head terms (SERP 7) dominated by SaaS link equity | Rank the long tail first; earn links with printables and the embed widget; accept a 6–12 month horizon on head terms |
| A calculation error damages trust or creates liability | Integer-minute engine, golden tests, a methodology page, a CPP review, and a "not legal advice" disclaimer |
| State law changes | Rules live in dated config files; a calendar reminder each January to re-verify thresholds |
| The time card and hours calculator compete with each other | Keep the hours calculator to a single start/end pair with no pay or week grid; distinct titles and copy; watch GSC for both URLs ranking on the same query |
| Low affiliate conversion (traffic skews to employees) | Target the manager persona with behaviour signals; display ads as the fallback revenue |
| Competitors copy the features | Speed and UX polish, the no-sign-up promise and an accumulated link profile are hard to copy quickly |

---

## 11. Immediate next steps

1. Pick the primary domain (§2) and register it.
2. Scaffold the Astro project and build the **engine + tests first**, since everything else is UI on top of it.
3. Ship `/minutes-to-decimal/` (with the chart) and `/decimal-to-minutes/` first, then the time card.

---

## 12. Status: content and growth pages (6 October 2026)

**Built**
- **State pages** at `/states/{california,alaska,nevada,colorado}/`, plus the `/states/` comparison hub. Each has the rules, worked examples run through the engine, what the calculator does not cover, a FAQ and the sources. Links like `/?rules=california` open the time card with that rule set.
- **Six guides** at `/guides/`: the 7-minute rule, California meal and rest breaks, daily vs weekly overtime, biweekly vs semi-monthly pay, how to check paycheck hours, and how to fill out a paper time card.
- **Embeddable widgets** at `/embed/`: the minutes to decimal converter and chart, as framed pages (`/embed/converter/`, `/embed/chart/`) with copy-paste code that includes a credit link. Only those two frames can be embedded by other sites; every other page still sends `X-Frame-Options: DENY` (see `public/_headers`).

**Guides from §7 that were not written, and why.** The SERP-overlap checks showed the same pages ranking for related queries, so separate pages would compete with pages that already exist:
- "How to convert minutes to decimal for payroll" and "Decimal hours vs hours:minutes" duplicate `/minutes-to-decimal/`.
- "How to calculate hours worked (with lunch)" duplicates the homepage.
- "How to calculate overtime pay" duplicates `/overtime-calculator/`.
- "California overtime rules, with worked examples" is the California state page.
- "Time card rounding: is it legal?" is covered in the 7-minute rule guide.

**Next**
- Affiliate cards and a comparison page (§6), once there is traffic to judge them against.
- Link building for the chart PDF, the blank time card and the embed page (§7).
- Re-check the rule data each January and July.
