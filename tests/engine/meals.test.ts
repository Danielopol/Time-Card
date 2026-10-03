import { describe, expect, it } from 'vitest';
import { mealBreakFlags } from '../../src/engine/meals';
import { RULE_SETS } from '../../src/engine/rules/index';
import { parseTime } from '../../src/engine/time';
import type { DayPunches } from '../../src/engine/timecard';

const rule = RULE_SETS.california.mealBreaks;
const t = (s: string) => parseTime(s)!;
const day = (i: string, o: string, lunchOut?: string, lunchIn?: string): DayPunches => ({
  in: t(i),
  lunchOut: lunchOut ? t(lunchOut) : null,
  lunchIn: lunchIn ? t(lunchIn) : null,
  out: t(o),
});
const codes = (d: DayPunches) => mealBreakFlags(d, rule).map((f) => f.code);

describe('california meal breaks', () => {
  it('has nothing to say about an empty day', () => {
    expect(codes({ in: null, lunchOut: null, lunchIn: null, out: null })).toEqual([]);
  });

  it('needs no meal for exactly 5 hours', () => {
    expect(codes(day('9a', '2p'))).toEqual([]);
  });

  it('allows a waived meal between 5 and 6 hours', () => {
    expect(mealBreakFlags(day('9a', '2:01p'), rule)).toMatchObject([{ code: 'no-meal-waivable', severity: 'info' }]);
    expect(codes(day('9a', '3p'))).toEqual(['no-meal-waivable']);
  });

  it('warns when more than 6 hours has no meal', () => {
    expect(mealBreakFlags(day('9a', '3:01p'), rule)).toMatchObject([{ code: 'no-meal', severity: 'warning' }]);
  });

  it('accepts a 30-minute meal started by the end of the fifth hour', () => {
    expect(codes(day('8a', '4:30p', '12p', '12:30p'))).toEqual([]);
    expect(codes(day('8a', '4:30p', '1p', '1:30p'))).toEqual([]);
  });

  it('warns about a short meal', () => {
    const flags = mealBreakFlags(day('8a', '4:20p', '12p', '12:20p'), rule);
    expect(flags).toMatchObject([{ code: 'short-meal', severity: 'warning' }]);
    expect(flags[0].message).toContain('20 minutes');
  });

  it('warns about a meal started after the fifth hour', () => {
    const flags = mealBreakFlags(day('8a', '4:30p', '1:01p', '1:31p'), rule);
    expect(flags).toMatchObject([{ code: 'late-meal' }]);
    expect(flags[0].message).toContain('5:01');
  });

  it('can raise short and late together', () => {
    expect(codes(day('8a', '4:30p', '2p', '2:10p'))).toEqual(['short-meal', 'late-meal']);
  });

  it('needs no second meal for exactly 10 hours of work', () => {
    expect(codes(day('8a', '6:30p', '12p', '12:30p'))).toEqual([]);
  });

  it('allows a waived second meal up to 12 hours when the first was taken', () => {
    expect(mealBreakFlags(day('8a', '7:30p', '12p', '12:30p'), rule)).toMatchObject([{ code: 'second-meal-waivable', severity: 'info' }]);
    expect(codes(day('8a', '8:30p', '12p', '12:30p'))).toEqual(['second-meal-waivable']);
  });

  it('warns about the second meal past 12 hours', () => {
    expect(codes(day('8a', '8:31p', '12p', '12:30p'))).toEqual(['second-meal']);
  });

  it('does not allow waiving the second meal when the first was skipped', () => {
    expect(codes(day('8a', '7p'))).toEqual(['no-meal', 'second-meal']);
  });

  it('works across midnight', () => {
    expect(codes(day('10p', '6:30a', '2a', '2:30a'))).toEqual([]);
    expect(codes(day('10p', '6:30a', '4a', '4:30a'))).toEqual(['late-meal']);
  });

  it('ignores a lunch with only one punch', () => {
    expect(codes({ in: t('8a'), lunchOut: t('12p'), lunchIn: null, out: t('5p') })).toEqual(['no-meal']);
  });
});

describe('rule sets without meal rules', () => {
  it('only california carries meal-break data', () => {
    const withMeals = Object.values(RULE_SETS).filter((r) => 'mealBreaks' in r).map((r) => r.id);
    expect(withMeals).toEqual(['california']);
  });
});
