import { describe, expect, it } from 'vitest';
import { daySegments, trackPercent, trackTicks, trackWindow } from '../../src/engine/track';

const h = (hours: number) => hours * 60;

describe('trackWindow', () => {
  it('shows 6 AM to 9 PM when every shift fits', () => {
    expect(trackWindow([{ start: h(8), end: h(17) }, null])).toEqual({ from: h(6), to: h(21) });
    expect(trackWindow([])).toEqual({ from: h(6), to: h(21) });
  });

  it('widens in 3-hour steps for an early start or an overnight end', () => {
    expect(trackWindow([{ start: h(4.5), end: h(13) }])).toEqual({ from: h(3), to: h(21) });
    expect(trackWindow([{ start: h(22), end: h(30) }])).toEqual({ from: h(6), to: h(30) });
  });
});

describe('trackTicks', () => {
  it('labels every 3 hours', () => {
    expect(trackTicks({ from: h(6), to: h(21) }).map((t) => t.label)).toEqual(['6a', '9a', '12p', '3p', '6p', '9p']);
  });

  it('labels every 6 hours on a long window, past midnight', () => {
    expect(trackTicks({ from: h(6), to: h(30) }).map((t) => t.label)).toEqual(['6a', '12p', '6p', '12a', '6a']);
  });
});

describe('daySegments', () => {
  const withLunch = { start: h(8), lunchStart: h(12), lunchEnd: h(12.5), end: h(16.25) };

  it('splits the day around lunch', () => {
    expect(daySegments(withLunch)).toEqual([
      { from: h(8), to: h(12), premium: false },
      { from: h(12.5), to: h(16.25), premium: false },
    ]);
  });

  it('marks the last minutes worked as premium', () => {
    expect(daySegments(withLunch, h(3.5))).toEqual([
      { from: h(8), to: h(12), premium: false },
      { from: h(12.5), to: h(12.75), premium: false },
      { from: h(12.75), to: h(16.25), premium: true },
    ]);
  });

  it('carries premium time back across lunch', () => {
    expect(daySegments(withLunch, h(4.75))).toEqual([
      { from: h(8), to: h(11), premium: false },
      { from: h(11), to: h(12), premium: true },
      { from: h(12.5), to: h(16.25), premium: true },
    ]);
  });

  it('marks a whole day with no lunch', () => {
    expect(daySegments({ start: h(9), lunchStart: null, lunchEnd: null, end: h(13) }, h(4))).toEqual([{ from: h(9), to: h(13), premium: true }]);
  });
});

describe('trackPercent', () => {
  it('places a time along the window and stays inside it', () => {
    const window = { from: h(6), to: h(21) };
    expect(trackPercent(h(13.5), window)).toBe(50);
    expect(trackPercent(h(2), window)).toBe(0);
    expect(trackPercent(h(23), window)).toBe(100);
  });
});
