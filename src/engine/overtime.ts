import type { RuleSet } from './rules/index';

/** Minutes worked, split by pay tier. */
export interface TierMinutes {
  regular: number;
  overtime: number;
  doubleTime: number;
}

export interface WeekBreakdown {
  days: TierMinutes[];
  totals: TierMinutes;
}

/**
 * Split one workweek into regular, overtime and double time.
 * `dayMinutes` holds the minutes worked on each day, in workweek order.
 * Overtime is always computed per workweek, so a biweekly card calls this twice.
 */
export function computeWeek(dayMinutes: readonly number[], rules: RuleSet): WeekBreakdown {
  const workedEveryDay = dayMinutes.length === 7 && dayMinutes.every((m) => m > 0);
  const days: TierMinutes[] = [];
  let regularSoFar = 0;

  dayMinutes.forEach((worked, index) => {
    let regular: number;
    let overtime: number;
    let doubleTime: number;

    if (rules.seventhDayOvertimeUpTo !== undefined && workedEveryDay && index === 6) {
      regular = 0;
      overtime = Math.min(worked, rules.seventhDayOvertimeUpTo);
      doubleTime = worked - overtime;
    } else {
      doubleTime = Math.max(0, worked - (rules.dailyDoubleTimeAfter ?? Infinity));
      overtime = Math.max(0, worked - doubleTime - (rules.dailyOvertimeAfter ?? Infinity));
      regular = worked - overtime - doubleTime;
    }

    // Weekly overtime counts only hours not already paid at a daily premium.
    const regularAllowed = Math.max(0, rules.weeklyOvertimeAfter - regularSoFar);
    if (regular > regularAllowed) {
      overtime += regular - regularAllowed;
      regular = regularAllowed;
    }
    regularSoFar += regular;

    days.push({ regular, overtime, doubleTime });
  });

  const totals = days.reduce<TierMinutes>(
    (sum, day) => ({
      regular: sum.regular + day.regular,
      overtime: sum.overtime + day.overtime,
      doubleTime: sum.doubleTime + day.doubleTime,
    }),
    { regular: 0, overtime: 0, doubleTime: 0 },
  );

  return { days, totals };
}

export interface PayCents {
  regular: number;
  overtime: number;
  doubleTime: number;
  total: number;
}

/**
 * Gross pay in cents for an hourly rate given in cents. Each tier rounds to the cent.
 * Overtime pays 1.5× unless the employer uses another multiplier. Double time is always 2×.
 */
export function grossPayCents(minutes: TierMinutes, rateCents: number, overtimeMultiplier = 1.5): PayCents {
  const regular = Math.round((minutes.regular * rateCents) / 60);
  const overtime = Math.round((minutes.overtime * rateCents * overtimeMultiplier) / 60);
  const doubleTime = Math.round((minutes.doubleTime * rateCents * 2) / 60);
  return { regular, overtime, doubleTime, total: regular + overtime + doubleTime };
}
