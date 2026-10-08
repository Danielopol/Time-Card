// A day drawn on a time scale: which stretch of the day to show, and the worked stretches on it.

import type { DayTimeline } from './timecard';

/** The stretch of time a track shows, in minutes since midnight. `to` can run past midnight. */
export interface TrackWindow {
  from: number;
  to: number;
}

export interface TrackSegment {
  from: number;
  to: number;
  /** Paid above the regular rate: overtime or double time. */
  premium: boolean;
}

export interface TrackTick {
  at: number;
  label: string;
}

const STEP = 180;
const DEFAULT_WINDOW: TrackWindow = { from: 6 * 60, to: 21 * 60 };

/** 6 AM to 9 PM, widened in 3-hour steps until every shift fits. */
export function trackWindow(timelines: readonly (Pick<DayTimeline, 'start' | 'end'> | null)[]): TrackWindow {
  let { from, to } = DEFAULT_WINDOW;
  for (const timeline of timelines) {
    if (!timeline) continue;
    from = Math.min(from, Math.floor(timeline.start / STEP) * STEP);
    to = Math.max(to, Math.ceil(timeline.end / STEP) * STEP);
  }
  return { from, to };
}

/** Labelled marks along a window, every 3 hours, or every 6 when the window is longer than 18 hours. */
export function trackTicks(window: TrackWindow): TrackTick[] {
  const step = window.to - window.from > 18 * 60 ? 2 * STEP : STEP;
  const ticks: TrackTick[] = [];
  for (let at = Math.ceil(window.from / step) * step; at <= window.to; at += step) {
    const hour = (at / 60) % 24;
    ticks.push({ at, label: `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'a' : 'p'}` });
  }
  return ticks;
}

/**
 * The worked stretches of one day, split around lunch. The last `premiumMinutes`
 * worked are marked as premium, because overtime is earned at the end of the day.
 */
export function daySegments(timeline: DayTimeline, premiumMinutes = 0): TrackSegment[] {
  const stretches =
    timeline.lunchStart === null
      ? [[timeline.start, timeline.end]]
      : [
          [timeline.start, timeline.lunchStart],
          [timeline.lunchEnd!, timeline.end],
        ];

  const segments: TrackSegment[] = [];
  let remaining = premiumMinutes;
  for (const [from, to] of stretches.reverse()) {
    const premium = Math.min(remaining, to - from);
    remaining -= premium;
    if (premium > 0) segments.unshift({ from: to - premium, to, premium: true });
    if (to - premium > from) segments.unshift({ from, to: to - premium, premium: false });
  }
  return segments;
}

/** Where a time sits along a window, as a percentage kept inside 0 to 100. */
export function trackPercent(at: number, window: TrackWindow): number {
  const percent = ((at - window.from) / (window.to - window.from)) * 100;
  return Math.min(100, Math.max(0, percent));
}
