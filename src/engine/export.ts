import { computeCard, type TimeCard } from './timecard';
import { format12, formatDecimalHours, formatHM } from './time';

function csvCell(value: string): string {
  // A leading =, +, - or @ would run as a formula in a spreadsheet.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** One row per day plus a totals row. `dayLabels` names each day, e.g. "Mon 9/29". */
export function cardToCSV(card: TimeCard, dayLabels: readonly string[]): string {
  const result = computeCard(card);
  const clock = (punch: number | null) => (punch === null ? '' : format12(punch));

  const rows: string[][] = [
    ['Day', 'In', 'Lunch start', 'Lunch end', 'Out', 'Hours (H:MM)', 'Hours (decimal)', 'Regular', 'Overtime', 'Double time'],
  ];
  card.days.forEach((day, i) => {
    const tiers = result.days[i];
    rows.push([
      dayLabels[i] ?? `Day ${i + 1}`,
      clock(day.in),
      clock(day.lunchOut),
      clock(day.lunchIn),
      clock(day.out),
      formatHM(result.dayMinutes[i]),
      formatDecimalHours(result.dayMinutes[i]),
      formatDecimalHours(tiers.regular),
      formatDecimalHours(tiers.overtime),
      formatDecimalHours(tiers.doubleTime),
    ]);
  });
  rows.push([
    'Total',
    '',
    '',
    '',
    '',
    formatHM(result.totalMinutes),
    formatDecimalHours(result.totalMinutes),
    formatDecimalHours(result.totals.regular),
    formatDecimalHours(result.totals.overtime),
    formatDecimalHours(result.totals.doubleTime),
  ]);
  if (card.rateCents > 0) {
    rows.push(['Gross pay', '', '', '', '', '', dollars(result.pay.total), dollars(result.pay.regular), dollars(result.pay.overtime), dollars(result.pay.doubleTime)]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
