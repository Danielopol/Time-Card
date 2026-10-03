import { computeWeek, grossPayCents, type PayCents, type TierMinutes } from './overtime';
import { roundMinutes, ROUNDING_INCREMENTS, type RoundingIncrement } from './round';
import { RULE_SETS, isRuleSetId, type RuleSetId } from './rules/index';
import { MINUTES_PER_DAY } from './time';

/** One day's punches as minutes since midnight. `null` is an empty cell. */
export interface DayPunches {
  in: number | null;
  lunchOut: number | null;
  lunchIn: number | null;
  out: number | null;
}

export interface TimeCard {
  v: 1;
  name: string;
  /** Hourly rate in cents. */
  rateCents: number;
  ruleSet: RuleSetId;
  rounding: RoundingIncrement;
  /** Day the workweek starts on: 0 is Sunday, 6 is Saturday. */
  weekStart: number;
  /** 7 days for a weekly card, 14 for biweekly, in workweek order. */
  days: DayPunches[];
}

export const EMPTY_DAY: DayPunches = { in: null, lunchOut: null, lunchIn: null, out: null };

export function emptyCard(dayCount: 7 | 14 = 7): TimeCard {
  return {
    v: 1,
    name: '',
    rateCents: 0,
    ruleSet: 'federal',
    rounding: 0,
    weekStart: 1,
    days: Array.from({ length: dayCount }, () => ({ ...EMPTY_DAY })),
  };
}

export interface DayTimeline {
  start: number;
  lunchStart: number | null;
  lunchEnd: number | null;
  end: number;
}

/**
 * One day's punches on a single rising timeline. Each punch is rounded, then a punch
 * earlier than the one before it is taken as the next day, so overnight shifts work.
 * A lunch counts only when both of its punches are present. Null when In or Out is missing.
 */
export function dayTimeline(day: DayPunches, rounding: RoundingIncrement = 0): DayTimeline | null {
  if (day.in === null || day.out === null) return null;
  const hasLunch = day.lunchOut !== null && day.lunchIn !== null;
  const punches = hasLunch ? [day.in, day.lunchOut!, day.lunchIn!, day.out] : [day.in, day.out];

  const timeline: number[] = [];
  for (const punch of punches) {
    let t = roundMinutes(punch, rounding);
    const previous = timeline[timeline.length - 1];
    while (previous !== undefined && t < previous) t += MINUTES_PER_DAY;
    timeline.push(t);
  }

  return {
    start: timeline[0],
    lunchStart: hasLunch ? timeline[1] : null,
    lunchEnd: hasLunch ? timeline[2] : null,
    end: timeline[timeline.length - 1],
  };
}

/** Paid minutes for one day: the span from In to Out, less lunch. */
export function dayWorkedMinutes(day: DayPunches, rounding: RoundingIncrement = 0): number {
  const timeline = dayTimeline(day, rounding);
  if (!timeline) return 0;
  const lunch = timeline.lunchStart === null ? 0 : timeline.lunchEnd! - timeline.lunchStart;
  return timeline.end - timeline.start - lunch;
}

export interface CardResult {
  /** Paid minutes per day. */
  dayMinutes: number[];
  /** Tier split per day. */
  days: TierMinutes[];
  totals: TierMinutes;
  totalMinutes: number;
  pay: PayCents;
}

export function computeCard(card: TimeCard): CardResult {
  const rules = RULE_SETS[card.ruleSet];
  const dayMinutes = card.days.map((day) => dayWorkedMinutes(day, card.rounding));

  const days: TierMinutes[] = [];
  const totals: TierMinutes = { regular: 0, overtime: 0, doubleTime: 0 };
  for (let start = 0; start < dayMinutes.length; start += 7) {
    const week = computeWeek(dayMinutes.slice(start, start + 7), rules);
    days.push(...week.days);
    totals.regular += week.totals.regular;
    totals.overtime += week.totals.overtime;
    totals.doubleTime += week.totals.doubleTime;
  }

  return {
    dayMinutes,
    days,
    totals,
    totalMinutes: totals.regular + totals.overtime + totals.doubleTime,
    pay: grossPayCents(totals, card.rateCents),
  };
}

function isPunch(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) >= 0 && (value as number) < MINUTES_PER_DAY);
}

/** Validate untrusted data (a share link, localStorage) as a TimeCard. */
export function parseCard(data: unknown): TimeCard | null {
  if (typeof data !== 'object' || data === null) return null;
  const c = data as Record<string, unknown>;
  if (c.v !== 1 || typeof c.name !== 'string' || c.name.length > 200) return null;
  if (!Number.isInteger(c.rateCents) || (c.rateCents as number) < 0 || (c.rateCents as number) > 100_000_00) return null;
  if (!isRuleSetId(c.ruleSet)) return null;
  if (!ROUNDING_INCREMENTS.includes(c.rounding as RoundingIncrement)) return null;
  if (!Number.isInteger(c.weekStart) || (c.weekStart as number) < 0 || (c.weekStart as number) > 6) return null;
  if (!Array.isArray(c.days) || (c.days.length !== 7 && c.days.length !== 14)) return null;

  const days: DayPunches[] = [];
  for (const d of c.days as unknown[]) {
    if (typeof d !== 'object' || d === null) return null;
    const p = d as Record<string, unknown>;
    if (!isPunch(p.in) || !isPunch(p.lunchOut) || !isPunch(p.lunchIn) || !isPunch(p.out)) return null;
    days.push({ in: p.in, lunchOut: p.lunchOut, lunchIn: p.lunchIn, out: p.out });
  }

  return {
    v: 1,
    name: c.name,
    rateCents: c.rateCents as number,
    ruleSet: c.ruleSet,
    rounding: c.rounding as RoundingIncrement,
    weekStart: c.weekStart as number,
    days,
  };
}
