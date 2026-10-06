// Overtime rule sets as data. Adding a state means adding an entry here plus tests.
// Each rule set cites the law it was checked against. Re-check every January and July,
// and see LEGAL-SOURCES.md for what was read and what could not be confirmed.

export interface RuleSource {
  label: string;
  url: string;
}

/** Meal-break thresholds in minutes of work. */
export interface MealBreakRule {
  /** Shortest meal break that counts. */
  minMinutes: number;
  /** A first meal is required for more work than this, and must start by this point. */
  firstAfter: number;
  /** The first meal can be waived by agreement up to this much work. */
  firstWaivableUpTo: number;
  /** A second meal is required for more work than this. */
  secondAfter: number;
  /** The second meal can be waived by agreement up to this much work, if the first was taken. */
  secondWaivableUpTo: number;
}

export interface RuleSet {
  id: string;
  name: string;
  /** Minutes in a workweek after which regular time becomes overtime (1.5×). */
  weeklyOvertimeAfter: number;
  /** Minutes in a day after which time is overtime (1.5×). */
  dailyOvertimeAfter?: number;
  /** Minutes in a day after which time is double time (2×). */
  dailyDoubleTimeAfter?: number;
  /**
   * Seventh consecutive day worked in the workweek: time up to this many minutes
   * is overtime, and the rest is double time.
   */
  seventhDayOvertimeUpTo?: number;
  /** Meal-break rules the time card checks punches against. They never change pay. */
  mealBreaks?: MealBreakRule;
  /** Conditions the engine does not model, shown to the user. */
  notes?: string;
  /** The law this rule set was checked against. */
  sources: readonly RuleSource[];
  lastReviewed: string;
}

const HOUR = 60;

/** The Department of Labor's state table. Read directly on 6 October 2026. */
const DOL_STATE_TABLE: RuleSource = {
  label: 'U.S. Department of Labor: state minimum wage and premium pay table (updated July 1, 2026)',
  url: 'https://www.dol.gov/agencies/whd/minimum-wage/state',
};

export const RULE_SETS = {
  federal: {
    id: 'federal',
    name: 'Federal (FLSA)',
    weeklyOvertimeAfter: 40 * HOUR,
    sources: [
      { label: '29 U.S.C. § 207(a)(1)', url: 'https://www.law.cornell.edu/uscode/text/29/207' },
      { label: 'U.S. Department of Labor: Overtime Pay', url: 'https://www.dol.gov/agencies/whd/overtime' },
    ],
    lastReviewed: '2026-10-06',
  },
  california: {
    id: 'california',
    name: 'California',
    weeklyOvertimeAfter: 40 * HOUR,
    dailyOvertimeAfter: 8 * HOUR,
    dailyDoubleTimeAfter: 12 * HOUR,
    seventhDayOvertimeUpTo: 8 * HOUR,
    mealBreaks: {
      minMinutes: 30,
      firstAfter: 5 * HOUR,
      firstWaivableUpTo: 6 * HOUR,
      secondAfter: 10 * HOUR,
      secondWaivableUpTo: 12 * HOUR,
    },
    notes: 'Different rules apply to employees on an alternative workweek schedule or under some union contracts.',
    sources: [
      DOL_STATE_TABLE,
      {
        label: 'California Labor Code § 510',
        url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=510.&lawCode=LAB',
      },
      { label: 'California Labor Commissioner: Overtime', url: 'https://www.dir.ca.gov/dlse/faq_overtime.htm' },
      {
        label: 'California Labor Code § 512 (meal periods)',
        url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=512.&lawCode=LAB',
      },
      { label: 'California Labor Commissioner: Meal Periods', url: 'https://www.dir.ca.gov/dlse/faq_mealperiods.htm' },
    ],
    lastReviewed: '2026-10-06',
  },
  alaska: {
    id: 'alaska',
    name: 'Alaska',
    weeklyOvertimeAfter: 40 * HOUR,
    dailyOvertimeAfter: 8 * HOUR,
    notes: 'Does not apply to employers with fewer than four employees.',
    sources: [
      DOL_STATE_TABLE,
      { label: 'Alaska Statutes § 23.10.060', url: 'https://www.akleg.gov/basis/statutes.asp#23.10.060' },
      { label: 'Alaska Wage and Hour Pamphlet 100 (October 2025)', url: 'https://labor.alaska.gov/lss/forms/pam100.pdf' },
    ],
    lastReviewed: '2026-10-06',
  },
  nevada: {
    id: 'nevada',
    name: 'Nevada',
    weeklyOvertimeAfter: 40 * HOUR,
    dailyOvertimeAfter: 8 * HOUR,
    notes:
      'Daily overtime applies only to employees paid less than 1.5 times the state minimum wage. With the minimum wage at $12.00 in July 2026, that is less than $18.00 an hour; if you earn more, choose Federal. Daily overtime does not apply to an employee on a schedule of four 10-hour days agreed with the employer. This calculator treats each row of the card as one workday.',
    sources: [
      DOL_STATE_TABLE,
      { label: 'Nevada Revised Statutes § 608.018', url: 'https://www.leg.state.nv.us/nrs/nrs-608.html#NRS608Sec018' },
      {
        label: 'Nevada Labor Commissioner: 2026 Daily Overtime Bulletin',
        url: 'https://labor.nv.gov/uploadedFiles/labornvgov/content/Employer/26.06.29%20Annual%20Bulletin%20-%20Daily%20Overtime.pdf',
      },
    ],
    lastReviewed: '2026-10-06',
  },
  colorado: {
    id: 'colorado',
    name: 'Colorado',
    weeklyOvertimeAfter: 40 * HOUR,
    dailyOvertimeAfter: 12 * HOUR,
    notes: 'Overtime also applies after 12 consecutive hours, which this calculator does not track across days.',
    sources: [
      DOL_STATE_TABLE,
      {
        label: 'Colorado COMPS Order #40, Rule 4.1 (7 CCR 1103-1, effective February 1, 2026)',
        url: 'https://cdle.colorado.gov/sites/cdle/files/adopted_2026_comps_order_%2340_7_ccr_1103-1_12.8.25.pdf',
      },
    ],
    lastReviewed: '2026-10-06',
  },
} as const satisfies Record<string, RuleSet>;

export type RuleSetId = keyof typeof RULE_SETS;

/** Plain-language lines saying which hours a rule set pays at a premium. */
export function describeRules(rules: RuleSet): string[] {
  const hours = (minutes: number) => minutes / HOUR;
  const lines: string[] = [];

  const weekly = `over ${hours(rules.weeklyOvertimeAfter)} in a workweek`;
  lines.push(
    rules.dailyOvertimeAfter !== undefined
      ? `Overtime (1.5×): hours over ${hours(rules.dailyOvertimeAfter)} in a day or ${weekly}.`
      : `Overtime (1.5×): hours ${weekly}. There is no daily overtime.`,
  );
  if (rules.dailyDoubleTimeAfter !== undefined) {
    lines.push(`Double time (2×): hours over ${hours(rules.dailyDoubleTimeAfter)} in a day.`);
  }
  if (rules.seventhDayOvertimeUpTo !== undefined) {
    lines.push(
      `Seventh day worked in a row in a workweek: the first ${hours(rules.seventhDayOvertimeUpTo)} hours are overtime and the rest are double time.`,
    );
  }
  if (rules.notes) lines.push(rules.notes);
  return lines;
}

export function isRuleSetId(value: unknown): value is RuleSetId {
  return typeof value === 'string' && Object.hasOwn(RULE_SETS, value);
}

/** The rule set named by a `?rules=` query parameter, or null when it is absent or unknown. */
export function ruleSetFromQuery(search: string): RuleSetId | null {
  const value = new URLSearchParams(search).get('rules');
  return isRuleSetId(value) ? value : null;
}
