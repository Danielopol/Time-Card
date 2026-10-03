// Writes the downloadable chart PDFs into public/. Run with `npm run pdf`.
// The values come from the same engine functions the pages use, so the PDFs cannot drift from the site.
import { writeFile } from 'node:fs/promises';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { roundMinutes } from '../src/engine/round';
import { format12, format24, formatDecimalHours, formatMilitary } from '../src/engine/time';
import { SITE } from '../src/site';

// US Letter in points. The content also fits inside A4 (595 × 842) when printed at "fit to page".
const PAGE = { width: 612, height: 792 };
const MARGIN = 40;
const GUTTER = 22;

const INK = rgb(0, 0, 0);
const MUTED = rgb(0.35, 0.35, 0.35);
const RULE = rgb(0.75, 0.75, 0.75);
const STRIPE = rgb(0.95, 0.95, 0.95);

interface Column {
  header: string;
  /** Share of the table width. */
  weight: number;
}

interface Chart {
  file: string;
  title: string;
  subtitle: string;
  columns: Column[];
  rows: string[][];
  /** Rows per block. The blocks sit side by side. */
  rowsPerBlock: number;
  /** Row height in points. */
  rowHeight: number;
  /** Cell text size in points. */
  textSize: number;
}

const host = new URL(SITE.url).host;

const decimalChart: Chart = {
  file: 'decimal-hours-chart.pdf',
  title: 'Minutes to Decimal Hours Chart',
  subtitle: 'Divide the minutes by 60. Payroll usually works to two decimal places.',
  columns: [
    { header: 'Minutes', weight: 1 },
    { header: 'Decimal hours', weight: 1.3 },
    { header: '3 places', weight: 1 },
    { header: 'Nearest 1/4 hour', weight: 1.4 },
  ],
  rows: Array.from({ length: 60 }, (_, i) => i + 1).map((m) => [
    String(m),
    formatDecimalHours(m),
    formatDecimalHours(m, 3),
    formatDecimalHours(roundMinutes(m, 15)),
  ]),
  rowsPerBlock: 30,
  rowHeight: 20,
  textSize: 10.5,
};

const militaryChart: Chart = {
  file: 'military-time-chart.pdf',
  title: 'Military Time Chart',
  subtitle: 'From 1:00 PM to 11:59 PM, add 12 to the hour. Midnight is 0000.',
  columns: [
    { header: 'Standard time', weight: 1.2 },
    { header: 'Military time', weight: 1 },
    { header: '24-hour clock', weight: 1 },
  ],
  rows: Array.from({ length: 24 }, (_, i) => i * 60).map((m) => [format12(m), formatMilitary(m), format24(m)]),
  rowsPerBlock: 12,
  rowHeight: 30,
  textSize: 13,
};

function drawBlock(page: PDFPage, chart: Chart, rows: string[][], x: number, top: number, width: number, font: PDFFont, bold: PDFFont): void {
  const totalWeight = chart.columns.reduce((sum, c) => sum + c.weight, 0);
  const offsets: number[] = [];
  let offset = 0;
  for (const column of chart.columns) {
    offsets.push(offset);
    offset += (column.weight / totalWeight) * width;
  }
  const pad = 6;
  const headerHeight = 20;
  const { rowHeight, textSize } = chart;

  chart.columns.forEach((column, i) => {
    page.drawText(column.header, { x: x + offsets[i] + pad, y: top - 13, size: 8.5, font: bold, color: INK });
  });
  page.drawLine({ start: { x, y: top - headerHeight }, end: { x: x + width, y: top - headerHeight }, thickness: 1, color: INK });

  rows.forEach((row, r) => {
    const rowTop = top - headerHeight - rowHeight * r;
    if (r % 2 === 1) {
      page.drawRectangle({ x, y: rowTop - rowHeight, width, height: rowHeight, color: STRIPE });
    }
    row.forEach((cell, i) => {
      page.drawText(cell, { x: x + offsets[i] + pad, y: rowTop - rowHeight / 2 - textSize * 0.35, size: textSize, font: i === 0 ? bold : font, color: INK });
    });
    page.drawLine({ start: { x, y: rowTop - rowHeight }, end: { x: x + width, y: rowTop - rowHeight }, thickness: 0.5, color: RULE });
  });
}

async function buildChart(chart: Chart): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(chart.title);
  pdf.setAuthor(SITE.name);
  pdf.setSubject(chart.subtitle);
  // Fixed dates keep the file byte-identical between builds, so git only sees real changes.
  const date = new Date('2026-01-01T00:00:00Z');
  pdf.setCreationDate(date);
  pdf.setModificationDate(date);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([PAGE.width, PAGE.height]);

  let y = PAGE.height - MARGIN;
  page.drawText(chart.title, { x: MARGIN, y: y - 20, size: 20, font: bold, color: INK });
  y -= 38;
  page.drawText(chart.subtitle, { x: MARGIN, y, size: 10, font, color: MUTED });
  y -= 16;

  const blocks = Math.ceil(chart.rows.length / chart.rowsPerBlock);
  const blockWidth = (PAGE.width - 2 * MARGIN - GUTTER * (blocks - 1)) / blocks;
  for (let b = 0; b < blocks; b++) {
    const rows = chart.rows.slice(b * chart.rowsPerBlock, (b + 1) * chart.rowsPerBlock);
    drawBlock(page, chart, rows, MARGIN + b * (blockWidth + GUTTER), y, blockWidth, font, bold);
  }

  const bottom = y - 20 - chart.rowHeight * chart.rowsPerBlock;
  if (bottom < MARGIN + 14) throw new Error(`${chart.file}: the chart does not fit on one page`);
  page.drawText(`Free calculators and charts at ${host}`, { x: MARGIN, y: MARGIN - 6, size: 9, font, color: MUTED });

  return pdf.save();
}

for (const chart of [decimalChart, militaryChart]) {
  const bytes = await buildChart(chart);
  await writeFile(new URL(`../public/${chart.file}`, import.meta.url), bytes);
  console.log(`public/${chart.file} (${(bytes.length / 1024).toFixed(1)} KB)`);
}
