import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workedExample } from '../src/engine/examples';
import { RULE_SETS, ruleSetFromQuery } from '../src/engine/rules/index';
import { dayWorkedMinutes } from '../src/engine/timecard';
import { parseTime, toDecimalHours } from '../src/engine/time';
import { roundMinutes } from '../src/engine/round';
import { GUIDES, formatDate, getGuide } from '../src/guides';
import { STATES, getState } from '../src/states';

const h = (hours: number) => hours * 60;
const week = (...hours: number[]) => hours;

describe('guides', () => {
  it('has unique slugs and a page for each one', () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(existsSync(new URL(`../src/pages/guides/${slug}.astro`, import.meta.url)), slug).toBe(true);
    }
  });

  it.each(GUIDES.map((g) => [g.slug, g] as const))('%s has search-friendly metadata', (_slug, guide) => {
    expect(guide.title.length).toBeLessThanOrEqual(62);
    expect(guide.description.length).toBeGreaterThanOrEqual(70);
    expect(guide.description.length).toBeLessThanOrEqual(175);
    expect(guide.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(guide.updated >= guide.published).toBe(true);
  });

  it('finds a guide by slug and rejects an unknown one', () => {
    expect(getGuide('7-minute-rule').title).toContain('7-Minute Rule');
    expect(() => getGuide('nope')).toThrow();
  });

  it('formats dates without a time zone shift', () => {
    expect(formatDate('2026-10-06')).toBe('October 6, 2026');
    expect(formatDate('2026-01-01')).toBe('January 1, 2026');
  });
});

describe('state pages', () => {
  it('has a page for every rule set that adds state rules, and none for federal', () => {
    const ids = STATES.map((s) => s.ruleSet).sort();
    expect(ids).toEqual(Object.keys(RULE_SETS).filter((id) => id !== 'federal').sort());
  });

  it('has unique slugs', () => {
    const slugs = STATES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(() => getState('texas')).toThrow();
  });

  it.each(STATES.map((s) => [s.slug, s] as const))('%s has search-friendly metadata and complete examples', (_slug, state) => {
    expect(state.title.length).toBeLessThanOrEqual(62);
    expect(state.description.length).toBeGreaterThanOrEqual(70);
    expect(state.description.length).toBeLessThanOrEqual(175);
    expect(state.examples.length).toBeGreaterThanOrEqual(2);
    for (const example of state.examples) {
      expect(example.hours).toHaveLength(7);
      expect(example.rateCents).toBeGreaterThan(0);
    }
    expect(state.faq.length).toBeGreaterThanOrEqual(4);
    expect(state.notCovered.length).toBeGreaterThan(0);
  });

  // The figures below were worked out by hand from each state's rule, then compared with the engine.
  const expected: Record<string, { regular: number; overtime: number; doubleTime: number; pay: number }[]> = {
    california: [
      { regular: h(40), overtime: h(10), doubleTime: 0, pay: 110000 },
      { regular: h(8), overtime: h(4), doubleTime: h(1), pay: 32000 },
      { regular: h(40), overtime: h(16), doubleTime: 0, pay: 128000 },
    ],
    alaska: [
      { regular: h(40), overtime: h(5), doubleTime: 0, pay: 95000 },
      { regular: h(40), overtime: h(8), doubleTime: 0, pay: 104000 },
      { regular: h(40), overtime: h(8), doubleTime: 0, pay: 104000 },
    ],
    nevada: [
      { regular: h(32), overtime: h(8), doubleTime: 0, pay: 66000 },
      { regular: h(40), overtime: h(5), doubleTime: 0, pay: 71250 },
    ],
    colorado: [
      { regular: h(40), overtime: h(10), doubleTime: 0, pay: 110000 },
      { regular: h(12), overtime: h(2), doubleTime: 0, pay: 30000 },
      { regular: h(40), overtime: h(12), doubleTime: 0, pay: 116000 },
    ],
  };

  it.each(STATES.flatMap((s) => s.examples.map((example, i) => [s.slug, i, example] as const)))(
    '%s example %i matches the rule worked out by hand',
    (slug, i, example) => {
      const result = workedExample(RULE_SETS[getState(slug).ruleSet], example.hours, example.rateCents);
      const want = expected[slug][i];
      expect(result.totals).toEqual({ regular: want.regular, overtime: want.overtime, doubleTime: want.doubleTime });
      expect(result.pay.total).toBe(want.pay);
    },
  );

  it('has an expectation for every example', () => {
    for (const state of STATES) expect(expected[state.slug]).toHaveLength(state.examples.length);
  });
});

describe('guide figures', () => {
  // Two schedules at $15 an hour through every rule set, as in the daily vs weekly guide.
  const cases: [string, number[], Record<string, number>][] = [
    ['four 10-hour days', week(10, 10, 10, 10, 0, 0, 0), { federal: 60000, california: 66000, alaska: 66000, nevada: 66000, colorado: 60000 }],
    ['one 13-hour day', week(13, 0, 0, 0, 0, 0, 0), { federal: 19500, california: 24000, alaska: 23250, nevada: 23250, colorado: 20250 }],
  ];
  it.each(cases)('%s pays what the guide says', (_label, hours, pay) => {
    for (const [id, cents] of Object.entries(pay)) {
      expect(workedExample(RULE_SETS[id as keyof typeof RULE_SETS], hours, 1500).pay.total, id).toBe(cents);
    }
  });

  it('shows why two weeks are not averaged', () => {
    const one = workedExample(RULE_SETS.federal, week(10, 10, 10, 10, 10, 0, 0), 2000);
    const two = workedExample(RULE_SETS.federal, week(10, 10, 10, 0, 0, 0, 0), 2000);
    expect(one.totals.overtime + two.totals.overtime).toBe(h(10));
    expect(one.pay.total + two.pay.total).toBe(170000);
  });

  it('matches the paycheck example', () => {
    const result = workedExample(RULE_SETS.federal, week(9, 9, 9, 9, 7.5, 0, 0), 1850);
    expect(result.totals).toEqual({ regular: h(40), overtime: 210, doubleTime: 0 });
    expect(result.pay).toEqual({ regular: 74000, overtime: 9713, doubleTime: 0, total: 83713 });
  });

  it('matches the 7-minute rounding table', () => {
    const rounded = (minute: number) => roundMinutes(8 * 60 + minute, 15) - 8 * 60;
    for (let m = 0; m <= 59; m++) {
      const expectedMinute = m <= 7 ? 0 : m <= 22 ? 15 : m <= 37 ? 30 : m <= 52 ? 45 : 60;
      expect(rounded(m), `8:${m}`).toBe(expectedMinute);
    }
  });
});

describe('figures in the other guides', () => {
  it.each([
    ['one 9-hour day', week(9, 0, 0, 0, 0, 0, 0), 19000],
    ['four 12-hour days', week(12, 12, 12, 12, 0, 0, 0), 112000],
    ['six 8-hour days', week(8, 8, 8, 8, 8, 8, 0), 104000],
    ['a 10-hour seventh day', week(8, 8, 8, 8, 8, 8, 10), 136000],
  ])('California: %s pays what the guide says at $20 an hour', (_label, hours, cents) => {
    expect(workedExample(RULE_SETS.california, hours, 2000).pay.total).toBe(cents);
  });

  it('pays a seventh day of 10 hours as 8 overtime and 2 double time', () => {
    const result = workedExample(RULE_SETS.california, week(8, 8, 8, 8, 8, 8, 10), 2000);
    expect(result.totals).toEqual({ regular: h(40), overtime: h(16), doubleTime: h(2) });
  });

  it('matches the federal overtime pay example', () => {
    const result = workedExample(RULE_SETS.federal, week(10, 10, 10, 10, 6, 0, 0), 1850);
    expect(result.pay).toEqual({ regular: 74000, overtime: 16650, doubleTime: 0, total: 90650 });
  });

  it('shows rounding each entry loses more than converting the total', () => {
    const exact = Math.round((2500 * 2000) / 60);
    const convertTotal = Math.round((Math.round(toDecimalHours(2500) * 100) * 2000) / 100);
    const convertEach = Math.round((Math.round(toDecimalHours(500) * 100) * 5 * 2000) / 100);
    expect([exact, convertTotal, convertEach]).toEqual([83333, 83340, 83300]);
  });

  it('shows the same clock habits losing different time under different rounding', () => {
    const t = (s: string) => parseTime(s)!;
    const lunch = { lunchOut: t('12:00 PM'), lunchIn: t('12:30 PM') };
    const diff = (inn: string, out: string, rounding: 0 | 5 | 6 | 15) =>
      (dayWorkedMinutes({ in: t(inn), ...lunch, out: t(out) }, rounding) - dayWorkedMinutes({ in: t(inn), ...lunch, out: t(out) }, 0)) * 5;
    expect([0, 5, 6, 15].map((r) => diff('7:55 AM', '5:00 PM', r as 0 | 5 | 6 | 15))).toEqual([0, 0, 5, -25]);
    expect([0, 5, 6, 15].map((r) => diff('8:00 AM', '5:06 PM', r as 0 | 5 | 6 | 15))).toEqual([0, -5, 0, -30]);
  });
});

describe('ruleSetFromQuery', () => {
  it.each([
    ['?rules=california', 'california'],
    ['?rules=colorado', 'colorado'],
    ['?foo=1&rules=nevada', 'nevada'],
    ['rules=alaska', 'alaska'],
  ])('reads %s', (search, expected) => {
    expect(ruleSetFromQuery(search)).toBe(expected);
  });

  it.each(['', '?rules=', '?rules=texas', '?rules=toString', '?rule=california'])('ignores %j', (search) => {
    expect(ruleSetFromQuery(search)).toBeNull();
  });
});
