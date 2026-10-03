import { describe, expect, it } from 'vitest';
import { computeWeek, grossPayCents } from '../../src/engine/overtime';
import { roundMinutes } from '../../src/engine/round';
import { formatMoney, parseRateCents } from '../../src/engine/money';
import { RULE_SETS, describeRules } from '../../src/engine/rules/index';

const h = (hours: number) => hours * 60;
const week = (...hours: number[]) => hours.map(h);

describe('roundMinutes', () => {
  it('leaves exact time alone', () => {
    expect(roundMinutes(487, 0)).toBe(487);
  });
  it('applies the 7-minute rule at quarter hours', () => {
    expect(roundMinutes(8 * 60 + 7, 15)).toBe(8 * 60);
    expect(roundMinutes(8 * 60 + 8, 15)).toBe(8 * 60 + 15);
  });
  it('rounds to tenths of an hour', () => {
    expect(roundMinutes(2, 6)).toBe(0);
    expect(roundMinutes(3, 6)).toBe(6);
  });
  it('rounds to five minutes', () => {
    expect(roundMinutes(12, 5)).toBe(10);
    expect(roundMinutes(13, 5)).toBe(15);
  });
});

describe('federal', () => {
  const rules = RULE_SETS.federal;

  it('has no overtime at exactly 40 hours', () => {
    expect(computeWeek(week(8, 8, 8, 8, 8, 0, 0), rules).totals).toEqual({ regular: h(40), overtime: 0, doubleTime: 0 });
  });

  it('pays overtime past 40 hours in the week', () => {
    const result = computeWeek(week(9, 9, 9, 9, 9, 0, 0), rules);
    expect(result.totals).toEqual({ regular: h(40), overtime: h(5), doubleTime: 0 });
    expect(result.days[3]).toEqual({ regular: h(9), overtime: 0, doubleTime: 0 });
    expect(result.days[4]).toEqual({ regular: h(4), overtime: h(5), doubleTime: 0 });
  });

  it('has no daily overtime for a long day', () => {
    expect(computeWeek(week(14, 0, 0, 0, 0, 0, 0), rules).totals).toEqual({ regular: h(14), overtime: 0, doubleTime: 0 });
  });

  it('has no seventh-day premium', () => {
    expect(computeWeek(week(5, 5, 5, 5, 5, 5, 5), rules).totals).toEqual({ regular: h(35), overtime: 0, doubleTime: 0 });
  });
});

describe('california', () => {
  const rules = RULE_SETS.california;

  it('pays daily overtime past 8 hours', () => {
    const result = computeWeek(week(10, 10, 10, 10, 10, 0, 0), rules);
    expect(result.totals).toEqual({ regular: h(40), overtime: h(10), doubleTime: 0 });
    expect(result.days[0]).toEqual({ regular: h(8), overtime: h(2), doubleTime: 0 });
  });

  it('pays double time past 12 hours', () => {
    expect(computeWeek(week(14, 0, 0, 0, 0, 0, 0), rules).days[0]).toEqual({ regular: h(8), overtime: h(4), doubleTime: h(2) });
  });

  it('pays weekly overtime on a sixth 8-hour day', () => {
    const result = computeWeek(week(8, 8, 8, 8, 8, 8, 0), rules);
    expect(result.totals).toEqual({ regular: h(40), overtime: h(8), doubleTime: 0 });
    expect(result.days[5]).toEqual({ regular: 0, overtime: h(8), doubleTime: 0 });
  });

  it('does not count daily overtime toward the weekly 40', () => {
    // 4 × 10h gives 32 regular + 8 OT, so a fifth 8h day is all regular.
    const result = computeWeek(week(10, 10, 10, 10, 8, 0, 0), rules);
    expect(result.totals).toEqual({ regular: h(40), overtime: h(8), doubleTime: 0 });
    expect(result.days[4]).toEqual({ regular: h(8), overtime: 0, doubleTime: 0 });
  });

  it('pays the seventh consecutive day at overtime, then double time', () => {
    const result = computeWeek(week(8, 8, 8, 8, 8, 8, 10), rules);
    expect(result.days[6]).toEqual({ regular: 0, overtime: h(8), doubleTime: h(2) });
    expect(result.totals).toEqual({ regular: h(40), overtime: h(16), doubleTime: h(2) });
  });

  it('applies the seventh-day rule even under 40 hours', () => {
    const result = computeWeek(week(4, 4, 4, 4, 4, 4, 4), rules);
    expect(result.days[6]).toEqual({ regular: 0, overtime: h(4), doubleTime: 0 });
    expect(result.totals).toEqual({ regular: h(24), overtime: h(4), doubleTime: 0 });
  });

  it('skips the seventh-day rule when a day was not worked', () => {
    expect(computeWeek(week(8, 0, 8, 8, 8, 0, 8), rules).totals).toEqual({ regular: h(40), overtime: 0, doubleTime: 0 });
  });
});

describe('other states', () => {
  it('alaska pays daily overtime past 8 hours, with no double time', () => {
    expect(computeWeek(week(14, 0, 0, 0, 0, 0, 0), RULE_SETS.alaska).days[0]).toEqual({ regular: h(8), overtime: h(6), doubleTime: 0 });
  });
  it('nevada pays daily overtime past 8 hours', () => {
    expect(computeWeek(week(10, 0, 0, 0, 0, 0, 0), RULE_SETS.nevada).days[0]).toEqual({ regular: h(8), overtime: h(2), doubleTime: 0 });
  });
  it('colorado pays daily overtime past 12 hours', () => {
    const result = computeWeek(week(10, 13, 0, 0, 0, 0, 0), RULE_SETS.colorado);
    expect(result.days[0]).toEqual({ regular: h(10), overtime: 0, doubleTime: 0 });
    expect(result.days[1]).toEqual({ regular: h(12), overtime: h(1), doubleTime: 0 });
  });
});

describe('every rule set', () => {
  it.each(Object.values(RULE_SETS))('$name accounts for every minute worked', (rules) => {
    const worked = [437, 0, 791, 480, 613, 302, 845];
    const result = computeWeek(worked, rules);
    result.days.forEach((day, i) => {
      expect(day.regular + day.overtime + day.doubleTime).toBe(worked[i]);
    });
    const { regular, overtime, doubleTime } = result.totals;
    expect(regular + overtime + doubleTime).toBe(worked.reduce((a, b) => a + b));
    expect(regular).toBeLessThanOrEqual(rules.weeklyOvertimeAfter);
  });
});

describe('grossPayCents', () => {
  it('pays each tier at its multiplier', () => {
    expect(grossPayCents({ regular: h(40), overtime: h(5), doubleTime: h(2) }, 2000)).toEqual({
      regular: 80000,
      overtime: 15000,
      doubleTime: 8000,
      total: 103000,
    });
  });
  it('uses a custom overtime multiplier', () => {
    expect(grossPayCents({ regular: h(40), overtime: h(5), doubleTime: 0 }, 2000, 2)).toMatchObject({ overtime: 20000, total: 100000 });
  });
  it('matches the worked example on the overtime page', () => {
    expect(grossPayCents({ regular: h(40), overtime: h(5), doubleTime: 0 }, 1850)).toMatchObject({ regular: 74000, overtime: 13875, total: 87875 });
  });
  it('rounds to the cent', () => {
    // 8h40m at $18.50 = 8.6667 × 18.50 = $160.33
    expect(grossPayCents({ regular: 520, overtime: 0, doubleTime: 0 }, 1850).total).toBe(16033);
  });
});

describe('describeRules', () => {
  it('describes federal overtime', () => {
    expect(describeRules(RULE_SETS.federal)).toEqual(['Overtime (1.5×): hours over 40 in a workweek. There is no daily overtime.']);
  });
  it('describes every california tier', () => {
    expect(describeRules(RULE_SETS.california)).toEqual([
      'Overtime (1.5×): hours over 8 in a day or over 40 in a workweek.',
      'Double time (2×): hours over 12 in a day.',
      'Seventh day worked in a row in a workweek: the first 8 hours are overtime and the rest are double time.',
      RULE_SETS.california.notes,
    ]);
  });
  it('includes the conditions the engine does not model', () => {
    expect(describeRules(RULE_SETS.alaska)).toContain(RULE_SETS.alaska.notes);
  });
});

describe('money', () => {
  it.each([
    ['18.50', 1850],
    ['$18.5', 1850],
    ['20', 2000],
    ['', 0],
    ['0.07', 7],
  ])('parses %j as %i cents', (input, expected) => {
    expect(parseRateCents(input)).toBe(expected);
  });
  it.each(['abc', '18.505', '-5', '1,000'])('rejects %j', (input) => {
    expect(parseRateCents(input)).toBeNull();
  });
  it('formats cents as dollars', () => {
    expect(formatMoney(92000)).toBe('$920.00');
    expect(formatMoney(123456789)).toBe('$1,234,567.89');
  });
});

describe('rule sources', () => {
  it.each(Object.values(RULE_SETS))('$name cites at least one https source and a review date', (rules) => {
    expect(rules.sources.length).toBeGreaterThan(0);
    for (const source of rules.sources) {
      expect(source.label).not.toBe('');
      expect(source.url).toMatch(/^https:\/\//);
    }
    expect(rules.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
