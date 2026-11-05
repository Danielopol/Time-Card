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
    slug: 'calculate-hours-worked-in-military-time',
    title: 'How to Calculate Hours Worked in Military Time',
    description:
      'How to work out hours worked from military time: turn 0730 and 1615 into minutes, subtract, take off lunch, and handle a shift that ends after midnight.',
    published: '2026-10-29',
    updated: '2026-10-29',
    related: ['calculate-hours-worked-with-lunch', 'calculate-night-shift-hours', 'decimal-hours-vs-hours-and-minutes'],
  },
  {
    slug: 'calculate-hours-and-overtime-for-12-hour-shifts',
    title: '12-Hour Shifts: How to Calculate Hours, Overtime and Pay',
    description:
      'How to work out hours, overtime and pay for 12-hour shifts: paid hours after lunch, three and four shift weeks, and how states with daily overtime differ.',
    published: '2026-10-29',
    updated: '2026-10-29',
    related: ['daily-vs-weekly-overtime', 'how-to-calculate-overtime-pay', 'biweekly-vs-semi-monthly-overtime'],
  },
  {
    slug: 'calculate-night-shift-hours',
    title: 'How to Calculate Hours Worked on a Night Shift',
    description:
      'How to calculate hours for a night or overnight shift: count to midnight, add the time after it, take off lunch, and split a shift across two pay weeks.',
    published: '2026-10-29',
    updated: '2026-10-29',
    related: ['calculate-hours-worked-with-lunch', 'calculate-hours-worked-in-military-time', 'daily-vs-weekly-overtime'],
  },
  {
    slug: 'calculate-hours-worked-with-lunch',
    title: 'How to Calculate Hours Worked With a Lunch Break',
    description:
      'How to work out hours worked: subtract the unpaid lunch from the time between start and finish, with examples for a night shift, a long lunch and paid breaks.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['decimal-hours-vs-hours-and-minutes', 'check-your-paycheck-hours', 'fill-out-paper-time-card', 'calculate-night-shift-hours'],
  },
  {
    slug: 'decimal-hours-vs-hours-and-minutes',
    title: 'Decimal Hours vs Hours and Minutes: A Payroll Guide',
    description:
      'Why 8.30 hours is not 8:30, what the mix-up costs, why to convert the total and not each entry, and spreadsheet formulas for decimal hours.',
    published: '2026-10-09',
    updated: '2026-11-05',
    related: ['check-your-paycheck-hours', 'fill-out-paper-time-card', 'calculate-hours-worked-in-military-time', '7-minute-rule'],
  },
  {
    slug: 'how-to-calculate-overtime-pay',
    title: 'How to Calculate Overtime Pay With Worked Examples',
    description:
      'How to calculate overtime pay step by step: the overtime rate, overtime hours and total pay, with a worked example, a rate table and the regular rate explained.',
    published: '2026-10-09',
    updated: '2026-10-09',
    related: ['daily-vs-weekly-overtime', 'biweekly-vs-semi-monthly-overtime', 'calculate-hours-and-overtime-for-12-hour-shifts'],
  },
  {
    slug: 'daily-vs-weekly-overtime',
    title: 'Daily vs Weekly Overtime: Which States Pay Daily Overtime?',
    description:
      'Federal overtime is weekly, but some states also pay it for long days. Which places have daily overtime, how the two rules combine, and worked examples.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['how-to-calculate-overtime-pay', 'biweekly-vs-semi-monthly-overtime', 'calculate-hours-and-overtime-for-12-hour-shifts', 'california-meal-and-rest-breaks'],
  },
  {
    slug: 'california-meal-and-rest-breaks',
    title: 'California Meal and Rest Break Rules: Timing and Pay',
    description:
      'When California employers must give a 30-minute meal break and 10-minute rest breaks, when a meal can be waived, and the extra pay owed when one is missed.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['calculate-hours-worked-with-lunch', 'daily-vs-weekly-overtime', '7-minute-rule'],
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
    title: 'The 7-Minute Rule and Time Clock Rounding: Is It Legal?',
    description:
      'How the 7-minute rule rounds punches to the quarter hour, what federal and California law allow, and how 5, 6 and 15-minute rounding can cost you time.',
    published: '2026-10-06',
    updated: '2026-11-05',
    related: ['check-your-paycheck-hours', 'decimal-hours-vs-hours-and-minutes', 'california-meal-and-rest-breaks'],
  },
  {
    slug: 'check-your-paycheck-hours',
    title: 'How to Check the Hours on Your Paycheck',
    description:
      'A step-by-step way to check that the hours and pay on your paycheck match the hours you worked: add up your times, convert to decimals and compare.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['decimal-hours-vs-hours-and-minutes', '7-minute-rule', 'how-to-calculate-overtime-pay'],
  },
  {
    slug: 'fill-out-paper-time-card',
    title: 'How to Fill Out a Paper Time Card (Free Printable)',
    description:
      'How to fill in a paper time card: what goes in each box, how to take out lunch, how to total the hours and how to convert minutes to decimals.',
    published: '2026-10-06',
    updated: '2026-10-06',
    related: ['calculate-hours-worked-with-lunch', 'decimal-hours-vs-hours-and-minutes', 'check-your-paycheck-hours'],
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
