import type { MealBreakRule } from './rules/index';
import { dayTimeline, type DayPunches } from './timecard';
import { formatHM } from './time';

export interface MealFlag {
  code: 'no-meal' | 'no-meal-waivable' | 'short-meal' | 'late-meal' | 'second-meal' | 'second-meal-waivable';
  /** `warning` looks like a missed requirement. `info` is allowed if the break was waived by agreement. */
  severity: 'warning' | 'info';
  message: string;
}

function hoursText(minutes: number): string {
  const hours = minutes / 60;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

/**
 * Check one day's punches against a meal-break rule. The flags are reminders and never change pay.
 * Punches are used exactly as entered: meal periods are not rounded.
 */
export function mealBreakFlags(day: DayPunches, rule: MealBreakRule): MealFlag[] {
  const timeline = dayTimeline(day, 0);
  if (!timeline) return [];

  const lunch = timeline.lunchStart === null ? null : timeline.lunchEnd! - timeline.lunchStart;
  const worked = timeline.end - timeline.start - (lunch ?? 0);
  const need = `${rule.minMinutes}-minute meal break`;
  const flags: MealFlag[] = [];

  if (worked > rule.firstAfter) {
    if (lunch === null) {
      flags.push(
        worked <= rule.firstWaivableUpTo
          ? {
              code: 'no-meal-waivable',
              severity: 'info',
              message: `No meal break recorded. More than ${hoursText(rule.firstAfter)} of work requires a ${need}, unless you and your employer agreed to skip it, which is allowed for up to ${hoursText(rule.firstWaivableUpTo)} of work.`,
            }
          : {
              code: 'no-meal',
              severity: 'warning',
              message: `No meal break recorded. More than ${hoursText(rule.firstWaivableUpTo)} of work requires a ${need}.`,
            },
      );
    } else {
      if (lunch < rule.minMinutes) {
        flags.push({
          code: 'short-meal',
          severity: 'warning',
          message: `The meal break is ${lunch} minutes. It must be at least ${rule.minMinutes} minutes.`,
        });
      }
      const workedBeforeLunch = timeline.lunchStart! - timeline.start;
      if (workedBeforeLunch > rule.firstAfter) {
        flags.push({
          code: 'late-meal',
          severity: 'warning',
          message: `The meal break started after ${formatHM(workedBeforeLunch)} of work. It must start by the end of hour ${rule.firstAfter / 60}.`,
        });
      }
    }
  }

  if (worked > rule.secondAfter) {
    const waivable = worked <= rule.secondWaivableUpTo && lunch !== null;
    flags.push(
      waivable
        ? {
            code: 'second-meal-waivable',
            severity: 'info',
            message: `More than ${hoursText(rule.secondAfter)} of work requires a second ${need}, unless you and your employer agreed to skip it, which is allowed for up to ${hoursText(rule.secondWaivableUpTo)} of work. This card records one break a day.`,
          }
        : {
            code: 'second-meal',
            severity: 'warning',
            message: `More than ${hoursText(rule.secondAfter)} of work requires a second ${need}. This card records one break a day.`,
          },
    );
  }

  return flags;
}
