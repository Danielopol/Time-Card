export interface Guide {
  slug: string;
  /** Page title and heading. Keep under about 60 characters. */
  title: string;
  /** Search result snippet. Aim for 70 to 160 characters. */
  description: string;
  /** ISO dates. */
  published: string;
  updated: string;
  /** Slugs of the guides to link at the bottom. Three or so, the closest in topic. */
  related: readonly string[];
}

export const GUIDES: readonly Guide[] = [
  {
    slug: 'calculate-hours-worked-with-lunch',
    title: 'How to Calculate Hours Worked With a Lunch Break',
    description:
      'How to work out hours worked: subtract the unpaid lunch from the time between start and finish, with examples for a night shift, a long lunch and paid breaks.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['minutes-to-decimal-for-payroll', 'check-your-paycheck-hours', 'fill-out-paper-time-card'],
  },
  {
    slug: 'minutes-to-decimal-for-payroll',
    title: 'How to Convert Minutes to Decimal for Payroll',
    description:
      'How payroll staff convert minutes to decimal hours: convert the total, not each entry, how many decimal places to use, and spreadsheet formulas that do it.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['decimal-hours-vs-hours-and-minutes', 'calculate-hours-worked-with-lunch', 'time-card-rounding-is-it-legal'],
  },
  {
    slug: 'decimal-hours-vs-hours-and-minutes',
    title: 'Decimal Hours vs Hours and Minutes: Why Payroll Uses Decimals',
    description:
      'Decimal hours and hours and minutes are not the same: 8.30 is not 8:30. How they differ, why payroll uses decimals and what the mix-up costs.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['minutes-to-decimal-for-payroll', 'check-your-paycheck-hours', 'fill-out-paper-time-card'],
  },
  {
    slug: 'how-to-calculate-overtime-pay',
    title: 'How to Calculate Overtime Pay With Worked Examples',
    description:
      'How to calculate overtime pay step by step: the overtime rate, overtime hours and total pay, with a worked example, a rate table and the regular rate explained.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['daily-vs-weekly-overtime', 'biweekly-vs-semi-monthly-overtime', 'how-to-calculate-california-overtime'],
  },
  {
    slug: 'daily-vs-weekly-overtime',
    title: 'Daily vs Weekly Overtime: Which States Pay Daily Overtime?',
    description:
      'Federal overtime is weekly, but some states also pay it for long days. Which places have daily overtime, how the two rules combine, and worked examples.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['how-to-calculate-overtime-pay', 'how-to-calculate-california-overtime', 'biweekly-vs-semi-monthly-overtime'],
  },
  {
    slug: 'how-to-calculate-california-overtime',
    title: 'How to Calculate California Overtime: Step-by-Step Examples',
    description:
      'Work out California overtime step by step: split each day at 8 and 12 hours, check the 40-hour week, apply the seventh-day rule, with six worked examples.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['california-meal-and-rest-breaks', 'daily-vs-weekly-overtime', 'how-to-calculate-overtime-pay'],
  },
  {
    slug: 'california-meal-and-rest-breaks',
    title: 'California Meal and Rest Break Rules: Timing and Pay',
    description:
      'When California employers must give a 30-minute meal break and 10-minute rest breaks, when a meal can be waived, and the extra pay owed when one is missed.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['how-to-calculate-california-overtime', 'calculate-hours-worked-with-lunch', 'daily-vs-weekly-overtime'],
  },
  {
    slug: 'biweekly-vs-semi-monthly-overtime',
    title: 'Biweekly vs Semi-Monthly Pay: How Overtime Is Counted',
    description:
      'A pay period is how often you are paid. Overtime is counted by the workweek. How biweekly, semi-monthly and monthly pay periods affect overtime.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['how-to-calculate-overtime-pay', 'daily-vs-weekly-overtime', 'check-your-paycheck-hours'],
  },
  {
    slug: '7-minute-rule',
    title: 'The 7-Minute Rule: How Time Clock Rounding Works',
    description:
      'The 7-minute rule rounds clock punches to the nearest quarter hour. How it works, what federal law allows, and how California treats rounding.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['time-card-rounding-is-it-legal', 'minutes-to-decimal-for-payroll', 'check-your-paycheck-hours'],
  },
  {
    slug: 'time-card-rounding-is-it-legal',
    title: 'Time Card Rounding: Is It Legal, and Is It Costing You?',
    description:
      'Is rounding time cards legal? What federal and California rules allow, how 5, 6 and 15 minute rounding gain or lose time, and how to check your own.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['7-minute-rule', 'check-your-paycheck-hours', 'calculate-hours-worked-with-lunch'],
  },
  {
    slug: 'check-your-paycheck-hours',
    title: 'How to Check the Hours on Your Paycheck',
    description:
      'A step-by-step way to check that the hours and pay on your paycheck match the hours you worked: add up your times, convert to decimals and compare.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['minutes-to-decimal-for-payroll', 'time-card-rounding-is-it-legal', 'how-to-calculate-overtime-pay'],
  },
  {
    slug: 'fill-out-paper-time-card',
    title: 'How to Fill Out a Paper Time Card (Free Printable)',
    description:
      'How to fill in a paper time card: what goes in each box, how to take out lunch, how to total the hours and how to convert minutes to decimals.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['calculate-hours-worked-with-lunch', 'minutes-to-decimal-for-payroll', 'decimal-hours-vs-hours-and-minutes'],
  },
];

export function getGuide(slug: string): Guide {
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) throw new Error(`Unknown guide: ${slug}`);
  return guide;
}

export const guidePath = (slug: string) => `/guides/${slug}/`;

/** "2026-10-06" as "October 6, 2026". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
