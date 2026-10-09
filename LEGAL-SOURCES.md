# Legal sources for the overtime rules

Checked on 3 October 2026. This records which law each rule in `src/engine/rules/index.ts` was read against, how the text was obtained, and what could not be confirmed. It is a source check, not legal advice; a payroll professional should still review the rule pages before launch.

## Summary

| Rule set | Rule in the code | Matches the source? | How the text was read |
|---|---|---|---|
| Federal | Overtime over 40 h/week at 1.5×; no daily overtime | Yes | Statute text (Cornell LII copy of the U.S. Code) and the DOL overtime page |
| California | Over 8 h/day at 1.5×; over 12 h/day at 2×; over 40 h/week at 1.5×; 7th day: first 8 h at 1.5×, rest at 2× | Yes | Official statute text on leginfo.legislature.ca.gov |
| Alaska | Over 8 h/day or 40 h/week at 1.5×; weekly count excludes daily overtime hours; exempt under four employees | Yes | Statute text as printed in the state's Wage and Hour Pamphlet 100 (October 2025) |
| Nevada | Over 8 h/day at 1.5× only if paid under 1.5× minimum wage; over 40 h/week at 1.5× | Yes, with two gaps (below) | Statute text from an unofficial mirror; the official sites blocked automated access |
| Colorado | Over 12 h/day, 12 consecutive hours, or 40 h/week at 1.5× | Yes; the order number was out of date | Official COMPS Order #40 text from cdle.colorado.gov |

## Federal

- **29 U.S.C. § 207(a)(1)**: no workweek "longer than forty hours" unless the excess is paid at "not less than one and one-half times the regular rate". <https://www.law.cornell.edu/uscode/text/29/207>
- **U.S. Department of Labor, Overtime Pay**: confirms there is no daily overtime and no premium for weekends or holidays as such. <https://www.dol.gov/agencies/whd/overtime>
- **29 CFR 785.48(b)** (punch rounding): rounding to the nearest 5 minutes, one-tenth or quarter of an hour is accepted provided it does not, over time, fail to pay employees for all time worked. <https://www.ecfr.gov/current/title-29/section-785.48> (read via the Cornell LII copy; ecfr.gov blocked automated access)

## California

- **Labor Code § 510(a)**, read in full on the official site. It sets all four tiers used in the code, and says rates need not be combined for the same hour. <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=510.&lawCode=LAB>
- § 510(a) excludes employees on an alternative workweek schedule (§ 511) or certain collective bargaining agreements (§ 514). The calculator does not model these, so the rule set now carries a note saying so.
- **Labor Code § 512(a)** (for the planned meal-break warnings): a 30-minute meal for a work period over 5 hours, waivable by mutual consent if the day is no more than 6 hours; a second for over 10 hours, waivable if the day is no more than 12 hours and the first was not waived. <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=512.&lawCode=LAB>
- **Meal-break timing**: the Labor Commissioner's meal period FAQ says the first meal must be provided "no later than the end of the employee's fifth hour of work" and the second no later than the end of the tenth, citing *Brinker Restaurant Corp. v. Superior Court* (2012) 53 Cal.4th 1004. <https://www.dir.ca.gov/dlse/faq_mealperiods.htm> (read through a search-engine summary; the site blocked direct access)
- **Labor Code § 226.7** (premium pay): one additional hour of pay at the regular rate for each workday a required meal period is not provided. Confirmed through a search-engine summary of the Labor Commissioner's pages; the official statute page returned an error when opened. <https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=226.7.&lawCode=LAB>
- The time card's meal-break notes use these thresholds (`mealBreaks` in the California rule set). They use punches exactly as entered, without rounding, and never change pay. The card records one meal break a day, so it cannot confirm a second one.
- The Labor Commissioner's overtime FAQ (<https://www.dir.ca.gov/dlse/faq_overtime.htm>) is cited as a plain-language reference but could not be fetched during this check.

## Alaska

- **AS 23.10.060(a)–(b)**: no workweek over 40 hours or day over eight hours without overtime at 1.5×. Weekly hours are counted "without including hours that are worked in excess of eight hours in a day". This matches the engine, which counts only non-premium hours toward the weekly 40.
- **AS 23.10.060(d)(1)**: does not apply to "an employer employing fewer than four employees in the regular course of business". Subsection (d) lists further exempt occupations that the calculator does not model.
- Read from **Wage and Hour Pamphlet 100, October 2025**. <https://labor.alaska.gov/lss/forms/pam100.pdf>
- Official statute site: <https://www.akleg.gov/basis/statutes.asp#23.10.060> (blocked automated access).

## Nevada

- **NRS 608.018(1)–(2)**: 1.5× for an employee paid less than 1.5 times the minimum wage who works more than 40 hours in a scheduled week or more than 8 hours in any workday, "unless by mutual agreement the employee works a scheduled 10 hours per day for 4 calendar days". Employees paid at or above that rate get weekly overtime only. Read from an unofficial mirror dated 26 May 2025: <https://nevada.public.law/statutes/nrs_608.018>. Official text: <https://www.leg.state.nv.us/nrs/nrs-608.html#NRS608Sec018>.
- **Wage threshold**: the Labor Commissioner's bulletin of 29 June 2026 puts the minimum wage at $12.00 and the daily-overtime threshold at $18.00 an hour from 1 July 2026. <https://labor.nv.gov/uploadedFiles/labornvgov/content/Employer/26.06.29%20Annual%20Bulletin%20-%20Daily%20Overtime.pdf>
- **Gaps**
  - Neither official Nevada site could be opened, so the $18.00 figure comes from a search-engine summary of the bulletin, not from the bulletin itself. Open the PDF by hand to confirm.
  - The bulletin describes daily overtime as over 8 hours "in a 24-hour period". The definition of "workday" (NRS 608.0126) was not read. The calculator totals each calendar row separately, so it can miss overtime when a shift starts less than 24 hours after the previous one started. The rule set's note says this.

## Colorado

- **COMPS Order #40, 7 CCR 1103-1**, adopted 8 December 2025, effective 1 February 2026. It replaces Order #39, which the plan had cited. <https://cdle.colorado.gov/sites/cdle/files/adopted_2026_comps_order_%2340_7_ccr_1103-1_12.8.25.pdf>
- **Rule 4.1.1**: time and one-half for work over 40 hours per workweek, 12 hours per workday, or 12 consecutive hours regardless of when the workday starts and ends.
- **Rule 4.1.2**: whichever calculation gives the greater pay applies. The engine's result equals the larger of the daily and weekly methods, because it never counts the same hour twice.
- **Rule 4.1.3**: hours in two or more workweeks are not averaged. The biweekly card computes each week separately.
- **Rule 5.1**: a 30-minute meal period when a shift exceeds 5 consecutive hours.
- The 12-consecutive-hours test is not modelled across days; the rule set's note says so.
- A proposed **COMPS Order #41** was posted on 30 September 2026. Check in January whether it changes Rule 4. <https://cdle.colorado.gov/dlss/labor-laws-rules-resources/labor-rules-proposed-and-adopted>

## Not covered by any rule set

- Exempt employees (executive, administrative, professional and others) in every jurisdiction.
- The "regular rate" when someone has more than one pay rate, bonuses or commissions. The calculators use a single hourly rate.
- Local ordinances and industry-specific wage orders.

## Re-check schedule

- **January**: Colorado's new COMPS Order; any statute changes taking effect on 1 January.
- **July**: Nevada's minimum wage bulletin and the daily-overtime threshold in the Nevada note.
- Update `lastReviewed` in the rule data whenever a rule set is re-read.

## Added 6 October 2026: guides, state pages and the widget

Sources read for the six guides and the four state pages. Everything below was read in full unless it says otherwise.

### Department of Labor state table (read directly)

The table at <https://www.dol.gov/agencies/whd/minimum-wage/state>, marked "Updated July 1, 2026", was read in a browser, not through a summary. It lists:

- **Daily overtime:** Alaska (8 hours), California (8, double time after 12), Colorado (12), Nevada (8, for employees earning less than 1.5 times the minimum wage), Puerto Rico (8), U.S. Virgin Islands (8), and Oregon (10 hours, for some manufacturing, mill and packing work).
- **Seventh-day rules:** California, Kentucky (when all seven days are worked), the Virgin Islands (6th or 7th consecutive day), Connecticut (restaurants and hotel restaurants), and a statutory rest day in Puerto Rico.
- **Other weekly thresholds:** 48 hours for Minnesota, 44 for New York residential workers, 45 for North Carolina seasonal amusement, and 52 for Missouri seasonal amusement.
- **Nevada:** a basic minimum rate of $12.00 an hour, and the premium pay rule above. 1.5 times $12.00 is $18.00, so the $18.00 threshold on the Nevada pages is now confirmed against an official source. The Labor Commissioner's own bulletin was still not opened.
- **Alaska:** the 10-hour flexible work hour plan and the fewer-than-four-employees exemption.

### California

- **Labor Code § 512 timing and § 226.7(c)** are confirmed from the California Supreme Court's opinion in *Donohue v. AMN Services, LLC* (No. S253677, February 25, 2021), which sets out both. The first meal period begins no later than the end of the fifth hour of work and the second no later than the end of the tenth. A missed meal period costs one additional hour of pay at the regular rate for each workday it is not provided. <https://supreme.courts.ca.gov/sites/default/files/supremecourt/default/2022-08/S253677.pdf>
- **Rounding:** *Donohue* holds that employers cannot round time punches in the meal period context. It also describes *See's Candy Shops v. Superior Court* (2012) 210 Cal.App.4th 889, a court of appeal decision allowing neutral rounding of work time. *See's Candy* itself was not read separately.
- **Rest periods:** the DOL table dated January 2023 gives a paid 10-minute rest period for each 4 hours worked or major fraction of that, with no requirement under 3½ hours. The Labor Commissioner's statements that more than 2 hours is a "major fraction" of 4 and that the extra pay for rest periods is one hour per workday come from a search summary of <https://www.dir.ca.gov/dlse/faq_restperiods.htm>, which could not be opened from here.

### Federal

- **29 CFR 778.104** (each workweek stands alone), **778.105** (the workweek is a fixed, recurring 168 hours), **778.106** (overtime is paid on the regular payday for the period in which the workweek ends) and **Fact Sheet #23** (revised October 2019) were read in full.

### Changes made to the rule data

- The Nevada note no longer says daily overtime counts hours "in the 24 hours after a shift starts". That came from a search summary of the bulletin, and the statute says "workday", whose definition (NRS 608.0126) was not read. The note now says the calculator treats each row of the card as one workday.
- The DOL table was added as a source on the California, Alaska, Nevada and Colorado rule sets, and all review dates are now 2026-10-06.

### Still open

- **Colorado meal periods:** a summary of the DOL's January 2023 meal-period table said Colorado's rule applies only to certain industries. The COMPS Order #40 text, read directly, has no such limit in Rule 5.1, so the Colorado page follows the order. Worth a check with the Colorado Division of Labor Standards and Statistics.
- **Unreachable from here:** dir.ca.gov and labor.nv.gov did not respond. akleg.gov and leg.state.nv.us show a bot check to automated browsers. All four are linked as sources and load normally in an ordinary browser.
- **Not covered by any page:** exempt employees, multiple pay rates, bonuses that change the regular rate, and local rules.

## Added 9 October 2026: the remaining six guides

All read in full unless noted.

- **29 CFR 785.19 (meal) and 785.18 (rest):** a bona fide meal period is not work time, the employee must be completely relieved from duty to eat, 30 minutes or more is ordinarily long enough, and an employee required to eat at a desk is still working. Rest periods of about 5 to 20 minutes are counted as hours worked. <https://www.law.cornell.edu/cfr/text/29/785.19>, <https://www.law.cornell.edu/cfr/text/29/785.18>
- **DOL Fact Sheet #22 (Hours Worked, revised July 2008):** short rest periods, usually 20 minutes or less, must be counted as hours worked; bona fide meal periods, typically 30 minutes or more, generally need not be compensated. <https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked>
- **DOL Fact Sheet #56A (The Regular Rate, revised December 2019):** the regular rate is total pay for the workweek, less the payments the law excludes, divided by total hours worked in the week. It includes all remuneration for employment, and payments that are entirely at the employer's discretion can be excluded. The overtime guide states this principle only. It gives no worked example with bonuses, because the method for adding the overtime premium was not read. <https://www.dol.gov/agencies/whd/fact-sheets/56a-regular-rate>
- **Spreadsheet formulas** in the payroll conversion guide (`=A2*24`, `=TIMEVALUE(A2)*24`, `=B2+C2/60`, the `[h]:mm` format) are standard Excel and Google Sheets behaviour. They were not run in either program.
- **California overtime examples** use only Labor Code § 510, as read on 6 October.

