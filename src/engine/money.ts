const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Cents as dollars, e.g. 92000 → "$920.00". */
export function formatMoney(cents: number): string {
  return usd.format(cents / 100);
}

/**
 * Parse an hourly rate such as `18.50` or `$18.5` into cents.
 * An empty string is 0. Returns null for anything else that is not a rate.
 */
export function parseRateCents(rate: string): number | null {
  const s = rate.trim().replace(/^\$/, '');
  if (s === '') return 0;
  if (!/^\d{1,5}(\.\d{0,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}
