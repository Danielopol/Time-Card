// Writes the logo files, the icons and the social sharing image into public/. Run with `npm run brand`.
// Lettering is converted to outlines, so the files look the same where the typefaces are not installed.
import { readFile, writeFile } from 'node:fs/promises';
import * as hb from 'harfbuzzjs';
import sharp from 'sharp';
import subsetFont from 'subset-font';
import { SITE } from '../src/site';

const INK = '#15181B';
const PAPER = '#EEF0F1';
const GROUND = '#E9EBEC';
const MUTED = '#525A60';
const TICK = '#AEB4B8';
const SIGNAL = '#F04E12';
const SIGNAL_ON_DARK = '#FF6A2B';

const KEYBOARD = Array.from({ length: 95 }, (_, i) => String.fromCharCode(0x20 + i)).join('');

/** HarfBuzz reads plain TrueType, so the site's woff2 files are unpacked first. */
async function loadFont(file: string): Promise<hb.Font> {
  const sfnt = await subsetFont(await readFile(`src/fonts/${file}.woff2`), KEYBOARD, { targetFormat: 'sfnt' });
  return new hb.Font(new hb.Face(new hb.Blob(sfnt.buffer.slice(sfnt.byteOffset, sfnt.byteOffset + sfnt.byteLength) as ArrayBuffer)));
}

const FONTS = {
  bold: await loadFont('barlow-semi-condensed-700'),
  regular: await loadFont('barlow-semi-condensed-400'),
  number: await loadFont('b612-400'),
};

interface Lettering {
  svg: string;
  width: number;
}

/** `text` as outlines with its baseline at y = 0 and its left edge at x = 0. `tracking` is in ems. */
function lettering(font: hb.Font, text: string, size: number, fill: string, tracking = 0): Lettering {
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const scale = size / font.face.upem;
  const positions = buffer.getGlyphPositions();

  let x = 0;
  const paths = buffer.getGlyphInfos().map((glyph, i) => {
    const path = `<path transform="translate(${x.toFixed(2)} 0) scale(${scale} ${-scale})" d="${font.glyphToPath(glyph.codepoint)}"/>`;
    x += positions[i].xAdvance * scale + tracking * size;
    return path;
  });
  return { svg: `<g fill="${fill}">${paths.join('')}</g>`, width: x - tracking * size };
}

const at = (x: number, y: number, svg: string, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})">${svg}</g>`;

/** The mark on a 24 × 28 grid: ruler ticks that read as an H, underlined by the total. */
function mark(ink: string, signal: string): string {
  const ticks = [
    [0, 3, 22],
    [6, 2, 9],
    [11, 2, 13],
    [16, 2, 9],
    [21, 3, 22],
  ];
  return (
    ticks.map(([x, width, height]) => `<rect x="${x}" y="${22 - height}" width="${width}" height="${height}" fill="${ink}"/>`).join('') +
    `<rect x="0" y="25" width="24" height="3" fill="${signal}"/>`
  );
}

/** The mark with the wordmark standing on the same baseline as the ticks. `unit` is the size of one grid square. */
function logo(unit: number, ink: string, signal: string): Lettering {
  const size = unit * 28;
  const hours = lettering(FONTS.bold, 'HOURS', size, ink, 0.06);
  const total = lettering(FONTS.regular, 'TOTAL', size, ink, 0.06);
  const textX = unit * 34;
  const totalX = textX + hours.width + size * 0.06;
  return {
    svg: at(0, 0, mark(ink, signal), unit) + at(textX, unit * 22, hours.svg) + at(totalX, unit * 22, total.svg),
    width: totalX + total.width,
  };
}

const svgFile = (width: number, height: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(width)} ${height}" role="img" aria-label="${SITE.name}">${body}</svg>\n`;

// Logo files, for use off the site.
const light = logo(2, INK, SIGNAL);
const dark = logo(2, PAPER, SIGNAL_ON_DARK);
await writeFile('public/logo.svg', svgFile(light.width, 56, light.svg));
await writeFile('public/logo-dark.svg', svgFile(dark.width, 56, dark.svg));
await writeFile('public/logo-mark.svg', svgFile(24, 28, mark(INK, SIGNAL)));

// Icons. The mark sits in the middle of a plain square.
const icon = (size: number, unit: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${GROUND}"/>${at(
    (size - 24 * unit) / 2,
    (size - 28 * unit) / 2,
    mark(INK, SIGNAL),
    unit,
  )}</svg>`;

await sharp(Buffer.from(icon(180, 4.5))).png().toFile('public/apple-touch-icon.png');

// favicon.ico for browsers and crawlers that do not read the SVG: one 32 px PNG inside an ICO wrapper.
const png32 = await sharp(Buffer.from(icon(32, 1))).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18); // where the PNG starts
await writeFile('public/favicon.ico', Buffer.concat([header, png32]));

// Social sharing image, 1200 × 630: the logo, the tagline and one day drawn on the time scale.
const W = 1200;
const H = 630;
const LEFT = 80;
const RIGHT = W - 80;
const SCALE_Y = 452;
const hourX = (hour: number) => LEFT + ((hour - 6) / 15) * (RIGHT - LEFT);

const big = logo(4, INK, SIGNAL);
const tagline = lettering(FONTS.bold, 'SIMPLE TOOLS FOR WORKING WITH TIME', 30, MUTED, 0.14);
const address = lettering(FONTS.number, new URL(SITE.url).host, 24, MUTED);

let scale = `<rect x="${LEFT}" y="${SCALE_Y}" width="${RIGHT - LEFT}" height="2" fill="${INK}"/>`;
for (let hour = 6; hour <= 21; hour++) {
  const major = hour % 3 === 0;
  scale += `<rect x="${hourX(hour) - 1}" y="${SCALE_Y - (major ? 14 : 0)}" width="2" height="${major ? 14 : 86}" fill="${major ? INK : TICK}"/>`;
  if (major) {
    const label = lettering(FONTS.number, `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'a' : 'p'}`, 22, MUTED);
    scale += at(hourX(hour) - label.width / 2, SCALE_Y - 24, label.svg);
  }
}
const bar = (from: number, to: number, fill: string) => `<rect x="${hourX(from)}" y="${SCALE_Y + 26}" width="${hourX(to) - hourX(from)}" height="36" fill="${fill}"/>`;
scale += bar(8, 12, INK) + bar(12.5, 16, INK) + bar(16, 18.5, SIGNAL);

const share =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${GROUND}"/>` +
  at(LEFT, 96, big.svg) +
  at(LEFT, 280, tagline.svg) +
  scale +
  at(RIGHT - address.width, 590, address.svg) +
  '</svg>';
await sharp(Buffer.from(share)).png().toFile('public/og.png');

console.log('Wrote logo.svg, logo-dark.svg, logo-mark.svg, apple-touch-icon.png, favicon.ico and og.png to public/');
