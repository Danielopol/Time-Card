// All time is held as integer minutes. Decimal hours exist only for display.

export const MINUTES_PER_DAY = 1440;

/**
 * Parse a clock time into minutes since midnight.
 * Accepts `8`, `830`, `0830`, `8:30`, `8:30a`, `8:30 PM`, `5p`, `5 p.m.`, `17:30`, `1730`.
 * Without am/pm the value is read as 24-hour.
 */
export function parseTime(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, '');
  const m = /^(\d{1,4})(?::(\d{2}))?(?:([ap])\.?(?:m\.?)?)?$/.exec(s);
  if (!m) return null;

  const [, digits, colonMinutes, meridiem] = m;
  let hours: number;
  let minutes: number;
  if (colonMinutes !== undefined) {
    if (digits.length > 2) return null;
    hours = Number(digits);
    minutes = Number(colonMinutes);
  } else if (digits.length <= 2) {
    hours = Number(digits);
    minutes = 0;
  } else {
    hours = Number(digits.slice(0, -2));
    minutes = Number(digits.slice(-2));
  }
  if (minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (meridiem === 'p' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Parse a punch that follows an earlier punch on the same day.
 * A bare hour that would land at or before the earlier punch is read as PM,
 * so In `9` then Out `5` means 5:00 PM. Times typed with am/pm, a leading zero
 * or an hour of 12 or more are taken as written.
 */
export function parsePunch(input: string, previous: number | null): number | null {
  const t = parseTime(input);
  if (t === null || previous === null) return t;
  const s = input.trim();
  const explicit = /[ap]/i.test(s) || s.startsWith('0') || t >= 720;
  if (!explicit && t <= previous && t + 720 > previous) return t + 720;
  return t;
}

/**
 * Parse a length of time into minutes.
 * Accepts `30` (minutes), `30m`, `1:15`, `1h`, `1h15`, `1h 15m`, `1.5h`.
 */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, '');
  let m = /^(\d+):(\d{2})$/.exec(s);
  if (m) {
    const minutes = Number(m[2]);
    return minutes > 59 ? null : Number(m[1]) * 60 + minutes;
  }
  m = /^(\d+(?:\.\d+)?)h(?:(\d{1,2})m?)?$/.exec(s);
  if (m) {
    if (m[1].includes('.') && m[2] !== undefined) return null;
    return Math.round(Number(m[1]) * 60) + Number(m[2] ?? 0);
  }
  m = /^(\d+)m?$/.exec(s);
  if (m) return Number(m[1]);
  return null;
}

/**
 * Parse an amount of hours into minutes.
 * Accepts decimal hours (`5.5`, `40`) or hours and minutes (`5:30`).
 */
export function parseHours(input: string): number | null {
  const s = input.trim();
  const hm = /^(\d{1,3}):(\d{2})$/.exec(s);
  if (hm) {
    const minutes = Number(hm[2]);
    return minutes > 59 ? null : Number(hm[1]) * 60 + minutes;
  }
  if (!/^(\d{1,3}(\.\d*)?|\.\d+)$/.test(s)) return null;
  return Math.round(Number(s) * 60);
}

/** Minutes between two clock times. An end before the start is taken as the next day. */
export function minutesBetween(start: number, end: number): number {
  return end >= start ? end - start : end + MINUTES_PER_DAY - start;
}

/** Decimal hours rounded to `places`, e.g. 40 → 0.67. */
export function toDecimalHours(minutes: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round((minutes / 60) * factor) / factor;
}

/** Decimal hours as a fixed-width string, e.g. 60 → "1.00". */
export function formatDecimalHours(minutes: number, places = 2): string {
  return toDecimalHours(minutes, places).toFixed(places);
}

/** Decimal hours to the nearest whole minute, e.g. 7.75 → 465. */
export function decimalHoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/** A duration as H:MM, e.g. 510 → "8:30". */
export function formatHM(minutes: number): string {
  const sign = minutes < 0 ? '-' : '';
  const abs = Math.abs(minutes);
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}

/** A clock time as 24-hour HH:MM, e.g. 1050 → "17:30". */
export function format24(minutesSinceMidnight: number): string {
  const m = ((minutesSinceMidnight % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** A clock time as four-digit military time, e.g. 1050 → "1730". */
export function formatMilitary(minutesSinceMidnight: number): string {
  return format24(minutesSinceMidnight).replace(':', '');
}

/** A clock time as 12-hour h:MM AM/PM, e.g. 1050 → "5:30 PM". */
export function format12(minutesSinceMidnight: number): string {
  const m = ((minutesSinceMidnight % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(m / 60);
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(m % 60).padStart(2, '0')} ${hours24 < 12 ? 'AM' : 'PM'}`;
}
