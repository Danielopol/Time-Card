export interface Guide {
  slug: string;
  /** Page title and heading. Keep under about 60 characters. */
  title: string;
  /** Search result snippet. Aim for 70 to 160 characters. */
  description: string;
  /** ISO dates. */
  published: string;
  updated: string;
}

export const GUIDES: readonly Guide[] = [
  {
    slug: '7-minute-rule',
    title: 'The 7-Minute Rule: How Time Clock Rounding Works',
    description:
      'The 7-minute rule rounds clock punches to the nearest quarter hour. How it works, what federal law allows, and how California treats rounding.',
    published: '2026-10-06',
    updated: '2026-10-06',
  },
  {
    slug: 'california-meal-and-rest-breaks',
    title: 'California Meal and Rest Break Rules: Timing and Pay',
    description:
      'When California employers must give a 30-minute meal break and 10-minute rest breaks, when a meal break can be waived, and the extra pay owed when one is missed.',
    published: '2026-10-06',
    updated: '2026-10-06',
  },
  {
    slug: 'daily-vs-weekly-overtime',
    title: 'Daily vs Weekly Overtime: Which States Pay Daily Overtime?',
    description:
      'Federal overtime is weekly, but some states also pay it for long days. Which places have daily overtime, how the two rules combine, and worked examples.',
    published: '2026-10-06',
    updated: '2026-10-06',
  },
  {
    slug: 'biweekly-vs-semi-monthly-overtime',
    title: 'Biweekly vs Semi-Monthly Pay: How Overtime Is Counted',
    description:
      'A pay period is how often you are paid. Overtime is counted by the workweek. How biweekly, semi-monthly and monthly pay periods affect overtime.',
    published: '2026-10-06',
    updated: '2026-10-06',
  },
  {
    slug: 'check-your-paycheck-hours',
    title: 'How to Check the Hours on Your Paycheck',
    description:
      'A step-by-step way to check that the hours and pay on your paycheck match the hours you worked: add up your times, convert to decimals and compare.',
    published: '2026-10-06',
    updated: '2026-10-06',
  },
  {
    slug: 'fill-out-paper-time-card',
    title: 'How to Fill Out a Paper Time Card (Free Printable)',
    description:
      'How to fill in a paper time card: what goes in each box, how to take out lunch, how to total the hours and how to convert minutes to decimals.',
    published: '2026-10-06',
    updated: '2026-10-06',
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
