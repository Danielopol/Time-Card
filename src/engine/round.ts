/**
 * Punch rounding increments in minutes. 0 is exact time.
 * 6 is a tenth of an hour; 15 is the quarter hour "7-minute rule" (29 CFR 785.48(b)).
 */
export type RoundingIncrement = 0 | 5 | 6 | 15;

export const ROUNDING_INCREMENTS: readonly RoundingIncrement[] = [0, 5, 6, 15];

/** Round to the nearest increment. Exact halves round up. */
export function roundMinutes(minutes: number, increment: RoundingIncrement): number {
  if (increment === 0) return minutes;
  return Math.floor(minutes / increment + 0.5) * increment;
}
