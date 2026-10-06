import { computeWeek, grossPayCents, type PayCents, type WeekBreakdown } from './overtime';
import type { RuleSet } from './rules/index';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export interface WorkedExample extends WeekBreakdown {
  /** Minutes worked on each day. */
  minutes: number[];
  pay: PayCents;
}

/**
 * A worked example for the guides and state pages. It runs the same code as the calculators,
 * so the figures printed on a page cannot drift from what the tools produce.
 * `hours` is hours worked on each day of one workweek, Monday first.
 */
export function workedExample(rules: RuleSet, hours: readonly number[], rateCents: number): WorkedExample {
  const minutes = hours.map((h) => Math.round(h * 60));
  const week = computeWeek(minutes, rules);
  return { minutes, ...week, pay: grossPayCents(week.totals, rateCents) };
}
