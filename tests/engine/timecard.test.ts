import { describe, expect, it } from 'vitest';
import { cardToCSV } from '../../src/engine/export';
import { cardFromFragment, cardToFragment, decodeCard, encodeCard } from '../../src/engine/share';
import { computeCard, dayWorkedMinutes, emptyCard, parseCard, type DayPunches, type TimeCard } from '../../src/engine/timecard';
import { parseTime } from '../../src/engine/time';

const t = (s: string) => parseTime(s)!;
const day = (i: string, o: string, lunchOut?: string, lunchIn?: string): DayPunches => ({
  in: t(i),
  lunchOut: lunchOut ? t(lunchOut) : null,
  lunchIn: lunchIn ? t(lunchIn) : null,
  out: t(o),
});

describe('dayWorkedMinutes', () => {
  it('is zero for an empty or half-filled day', () => {
    expect(dayWorkedMinutes({ in: null, lunchOut: null, lunchIn: null, out: null })).toBe(0);
    expect(dayWorkedMinutes({ in: 480, lunchOut: null, lunchIn: null, out: null })).toBe(0);
  });

  it('measures a shift with no lunch', () => {
    expect(dayWorkedMinutes(day('9a', '5p'))).toBe(480);
  });

  it('deducts lunch', () => {
    expect(dayWorkedMinutes(day('8:30a', '5p', '12p', '12:30p'))).toBe(480);
  });

  it('ignores a lunch with only one punch', () => {
    expect(dayWorkedMinutes({ in: t('9a'), lunchOut: t('12p'), lunchIn: null, out: t('5p') })).toBe(480);
  });

  it('handles a shift that crosses midnight', () => {
    expect(dayWorkedMinutes(day('10p', '6a'))).toBe(480);
  });

  it('handles lunch after midnight on an overnight shift', () => {
    expect(dayWorkedMinutes(day('10p', '6:30a', '2a', '2:30a'))).toBe(480);
  });

  it('handles lunch that itself crosses midnight', () => {
    expect(dayWorkedMinutes(day('8p', '4a', '11:45p', '12:15a'))).toBe(450);
  });

  it('rounds each punch before measuring', () => {
    // 7:53 → 8:00, 5:07 → 5:00 under the 7-minute rule
    expect(dayWorkedMinutes(day('7:53a', '5:07p'), 15)).toBe(540);
    // 7:52 → 7:45, 5:08 → 5:15
    expect(dayWorkedMinutes(day('7:52a', '5:08p'), 15)).toBe(570);
  });
});

function sampleCard(): TimeCard {
  return {
    ...emptyCard(),
    name: 'Maria, week of 9/28',
    rateCents: 2000,
    days: [
      day('8a', '5p', '12p', '1p'),
      day('8a', '5p', '12p', '1p'),
      day('8a', '5p', '12p', '1p'),
      day('8a', '5p', '12p', '1p'),
      day('8a', '7p', '12p', '1p'),
      { in: null, lunchOut: null, lunchIn: null, out: null },
      { in: null, lunchOut: null, lunchIn: null, out: null },
    ],
  };
}

describe('computeCard', () => {
  it('totals a federal week', () => {
    const result = computeCard(sampleCard());
    expect(result.dayMinutes).toEqual([480, 480, 480, 480, 600, 0, 0]);
    expect(result.totals).toEqual({ regular: 2400, overtime: 120, doubleTime: 0 });
    expect(result.totalMinutes).toBe(2520);
    expect(result.pay.total).toBe(80000 + 6000);
  });

  it('applies the chosen rule set', () => {
    const card = { ...sampleCard(), ruleSet: 'california' as const };
    card.days[0] = day('6a', '8p', '12p', '1p'); // 13h
    const result = computeCard(card);
    expect(result.days[0]).toEqual({ regular: 480, overtime: 240, doubleTime: 60 });
  });

  it('computes overtime per workweek on a biweekly card', () => {
    const card = emptyCard(14);
    // 50h in week one, 30h in week two: the weeks do not average out.
    for (let i = 0; i < 5; i++) card.days[i] = day('8a', '6p');
    for (let i = 7; i < 12; i++) card.days[i] = day('8a', '2p');
    const result = computeCard(card);
    expect(result.totals).toEqual({ regular: 2400 + 1800, overtime: 600, doubleTime: 0 });
    expect(result.days).toHaveLength(14);
  });

  it('is all zeros for an empty card', () => {
    const result = computeCard(emptyCard());
    expect(result.totalMinutes).toBe(0);
    expect(result.pay.total).toBe(0);
  });
});

describe('share links', () => {
  it('round-trips a card', () => {
    const card = sampleCard();
    expect(decodeCard(encodeCard(card))).toEqual(card);
    expect(cardFromFragment(cardToFragment(card))).toEqual(card);
  });

  it('keeps a weekly card link short', () => {
    expect(cardToFragment(sampleCard()).length).toBeLessThan(600);
  });

  it('returns null for garbage', () => {
    expect(decodeCard('not-a-card')).toBeNull();
    expect(decodeCard('')).toBeNull();
    expect(cardFromFragment('')).toBeNull();
    expect(cardFromFragment('#other=1')).toBeNull();
  });
});

describe('parseCard', () => {
  const valid = () => JSON.parse(JSON.stringify(sampleCard()));

  it('accepts a valid card', () => {
    expect(parseCard(valid())).toEqual(sampleCard());
  });

  it('drops unknown fields', () => {
    const data = { ...valid(), extra: 'x' };
    expect(parseCard(data)).toEqual(sampleCard());
  });

  it.each([
    ['a non-object', () => 'card'],
    ['null', () => null],
    ['a wrong version', () => ({ ...valid(), v: 2 })],
    ['an unknown rule set', () => ({ ...valid(), ruleSet: 'texas' })],
    ['an inherited rule set key', () => ({ ...valid(), ruleSet: 'toString' })],
    ['a bad rounding increment', () => ({ ...valid(), rounding: 7 })],
    ['a week start out of range', () => ({ ...valid(), weekStart: 7 })],
    ['a missing week start', () => { const c = valid(); delete c.weekStart; return c; }],
    ['a negative rate', () => ({ ...valid(), rateCents: -1 })],
    ['a fractional rate', () => ({ ...valid(), rateCents: 10.5 })],
    ['the wrong number of days', () => ({ ...valid(), days: valid().days.slice(0, 5) })],
    ['a punch out of range', () => { const c = valid(); c.days[0].in = 1440; return c; }],
    ['a string punch', () => { const c = valid(); c.days[0].in = '8:00'; return c; }],
    ['a missing punch field', () => { const c = valid(); delete c.days[0].out; return c; }],
  ])('rejects %s', (_label, make) => {
    expect(parseCard(make())).toBeNull();
  });
});

describe('cardToCSV', () => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  it('writes a header, a row per day, totals and pay', () => {
    const lines = cardToCSV(sampleCard(), labels).trimEnd().split('\r\n');
    expect(lines).toHaveLength(1 + 7 + 2);
    expect(lines[0]).toBe('Day,In,Lunch start,Lunch end,Out,Hours (H:MM),Hours (decimal),Regular,Overtime,Double time');
    expect(lines[1]).toBe('Mon,8:00 AM,12:00 PM,1:00 PM,5:00 PM,8:00,8.00,8.00,0.00,0.00');
    expect(lines[5]).toBe('Fri,8:00 AM,12:00 PM,1:00 PM,7:00 PM,10:00,10.00,8.00,2.00,0.00');
    expect(lines[8]).toBe('Total,,,,,42:00,42.00,40.00,2.00,0.00');
    expect(lines[9]).toBe('Gross pay,,,,,,860.00,800.00,60.00,0.00');
  });

  it('omits pay when no rate is set', () => {
    const lines = cardToCSV({ ...sampleCard(), rateCents: 0 }, labels).trimEnd().split('\r\n');
    expect(lines).toHaveLength(1 + 7 + 1);
  });

  it('quotes commas and neutralizes formulas in labels', () => {
    const csv = cardToCSV(sampleCard(), ['Mon, Sep 28', '=HYPERLINK("x")']);
    expect(csv).toContain('"Mon, Sep 28",8:00 AM');
    expect(csv).toContain(`"'=HYPERLINK(""x"")",8:00 AM`);
  });
});
