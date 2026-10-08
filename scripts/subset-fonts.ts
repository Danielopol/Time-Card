// Cuts the two typefaces down to the characters the site uses and writes them into src/fonts/.
// Run with `npm run fonts` after adding text with a new symbol or accented letter.
// A character that is missing from the cut-down files still shows, in the visitor's system font.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import subsetFont from 'subset-font';

const SOURCES = [
  { name: 'barlow-semi-condensed', weights: [400, 700] },
  { name: 'b612', weights: [400, 700] },
];
const OUT = 'src/fonts';

/** Every file under `dir` whose text ends up on a page. */
async function sourceFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (/\.(astro|tsx?)$/.test(entry.name)) files.push(path);
  }
  return files;
}

// Visitors type into the fields, so the whole keyboard range is kept: space to tilde.
const characters = new Set<string>();
for (let code = 0x20; code <= 0x7e; code++) characters.add(String.fromCharCode(code));
for (const file of await sourceFiles('src')) {
  for (const character of await readFile(file, 'utf8')) {
    if (character.codePointAt(0)! > 0x7e) characters.add(character);
  }
}
const text = [...characters].join('');

await mkdir(OUT, { recursive: true });
for (const { name, weights } of SOURCES) {
  for (const weight of weights) {
    const original = await readFile(`node_modules/@fontsource/${name}/files/${name}-latin-${weight}-normal.woff2`);
    const subset = await subsetFont(original, text, { targetFormat: 'woff2' });
    await writeFile(`${OUT}/${name}-${weight}.woff2`, subset);
    console.log(`${name}-${weight}.woff2  ${original.length} -> ${subset.length} bytes`);
  }
}
console.log(`${characters.size} characters kept`);
