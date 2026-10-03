import { describe, expect, it } from 'vitest';
import {
  decimalHoursToMinutes,
  format12,
  format24,
  formatDecimalHours,
  formatHM,
  formatMilitary,
  minutesBetween,
  parseDuration,
  parseHours,
  parsePunch,
  parseTime,
  toDecimalHours,
} from '../../src/engine/time';

describe('parseTime', () => {
  it.each([
    ['8', 480],
    ['830', 510],
    ['0830', 510],
    ['8:30', 510],
    ['08:30', 510],
    ['8:30a', 510],
    ['8:30 AM', 510],
    ['8:30 a.m.', 510],
    ['830a', 510],
    ['5p', 1020],
    ['5:30p', 1050],
    ['5:30 pm', 1050],
    ['17:30', 1050],
    ['1730', 1050],
    ['12a', 0],
    ['12:15am', 15],
    ['12p', 720],
    ['12:00', 720],
    ['0:00', 0],
    ['0000', 0],
    ['23:59', 1439],
    ['  9:05  ', 545],
  ])('%s → %i', (input, expected) => {
    expect(parseTime(input)).toBe(expected);
  });

  it.each(['', 'abc', '24:00', '8:60', '860', '13pm', '0am', '8:5', '12345', '8.5', '-8', '8:30x'])(
    'rejects %j',
    (input) => {
      expect(parseTime(input)).toBeNull();
    },
  );
});

describe('parsePunch', () => {
  const at = (s: string) => parseTime(s)!;

  it('parses like parseTime with no earlier punch', () => {
    expect(parsePunch('5', null)).toBe(300);
  });

  it.each([
    ['5', '9a', '5p'],
    ['5:30', '9a', '5:30p'],
    ['1', '12p', '1p'],
    ['9', '9a', '9p'],
    ['12', '9a', '12p'],
    ['10', '9a', '10a'],
    ['6', '10p', '6a'],
    ['5a', '9a', '5a'],
    ['05:00', '9a', '5a'],
    ['0500', '9a', '5a'],
    ['17:00', '9a', '5p'],
  ])('%s after %s is %s', (input, previous, expected) => {
    expect(parsePunch(input, at(previous))).toBe(at(expected));
  });

  it('rejects what parseTime rejects', () => {
    expect(parsePunch('abc', 540)).toBeNull();
  });
});

describe('parseDuration', () => {
  it.each([
    ['30', 30],
    ['30m', 30],
    ['90', 90],
    ['0:30', 30],
    ['1:15', 75],
    ['1h', 60],
    ['1h15', 75],
    ['1h 15m', 75],
    ['1.5h', 90],
    ['0', 0],
  ])('%s → %i', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each(['', 'abc', '1:75', '1.5h15m', '-30'])('rejects %j', (input) => {
    expect(parseDuration(input)).toBeNull();
  });
});

describe('parseHours', () => {
  it.each([
    ['40', 2400],
    ['5.5', 330],
    ['5:30', 330],
    ['0.25', 15],
    ['.5', 30],
    ['7.', 420],
    ['0', 0],
    [' 8 ', 480],
  ])('%s → %i minutes', (input, expected) => {
    expect(parseHours(input)).toBe(expected);
  });

  it.each(['', 'abc', '5:75', '-5', '5:3', '1000', '5.5.5', '5h'])('rejects %j', (input) => {
    expect(parseHours(input)).toBeNull();
  });
});

describe('minutesBetween', () => {
  it('measures a same-day shift', () => {
    expect(minutesBetween(480, 1020)).toBe(540);
  });
  it('treats an earlier end as the next day', () => {
    expect(minutesBetween(22 * 60, 6 * 60)).toBe(480);
  });
  it('is zero for equal times', () => {
    expect(minutesBetween(480, 480)).toBe(0);
  });
});

describe('decimal conversion', () => {
  it.each([
    [1, 0.02],
    [15, 0.25],
    [20, 0.33],
    [40, 0.67],
    [45, 0.75],
    [59, 0.98],
    [60, 1],
    [510, 8.5],
  ])('%i minutes → %f hours', (minutes, expected) => {
    expect(toDecimalHours(minutes)).toBe(expected);
  });

  it('supports three places', () => {
    expect(toDecimalHours(40, 3)).toBe(0.667);
  });

  it('formats with fixed places', () => {
    expect(formatDecimalHours(60)).toBe('1.00');
    expect(formatDecimalHours(40, 3)).toBe('0.667');
  });

  it('converts decimal hours back to minutes', () => {
    expect(decimalHoursToMinutes(7.75)).toBe(465);
    expect(decimalHoursToMinutes(0.67)).toBe(40);
    expect(decimalHoursToMinutes(0.1)).toBe(6);
  });

  it('round-trips every minute of the hour at two places', () => {
    for (let m = 0; m <= 60; m++) {
      expect(decimalHoursToMinutes(toDecimalHours(m))).toBe(m);
    }
  });
});

describe('formatting', () => {
  it('formats durations as H:MM', () => {
    expect(formatHM(510)).toBe('8:30');
    expect(formatHM(5)).toBe('0:05');
    expect(formatHM(2700)).toBe('45:00');
  });
  it('formats 24-hour clock times', () => {
    expect(format24(0)).toBe('00:00');
    expect(format24(1050)).toBe('17:30');
  });
  it('formats military times', () => {
    expect(formatMilitary(0)).toBe('0000');
    expect(formatMilitary(545)).toBe('0905');
    expect(formatMilitary(1050)).toBe('1730');
    expect(formatMilitary(1439)).toBe('2359');
  });
  it('formats 12-hour clock times', () => {
    expect(format12(0)).toBe('12:00 AM');
    expect(format12(720)).toBe('12:00 PM');
    expect(format12(1050)).toBe('5:30 PM');
    expect(format12(545)).toBe('9:05 AM');
  });
});
