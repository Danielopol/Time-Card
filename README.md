# Hours Total

Payroll time tools: time card calculator, hours calculator, minutes ↔ decimal converters, overtime calculator and military time converter. See [PLAN.md](PLAN.md).

Static Astro site with Preact islands. All calculation lives in `src/engine` as pure TypeScript and stores time as integer minutes.

```bash
npm run dev      # dev server on http://localhost:4321
npm test         # engine tests
npm run pdf      # regenerate the chart PDFs in public/
npm run fonts    # cut the two typefaces down to the characters the site uses
npm run brand    # regenerate the logo files, icons and sharing image in public/
npm run build    # regenerate the PDFs, then build the static site in dist/
```

## Deploying

The site runs on Cloudflare as the Worker `time-card`, connected to this repository on GitHub. Every push to `main` builds and deploys it; it serves only the static files in `dist/` (see `wrangler.jsonc`).

Cloudflare build settings: build command `npm run build`, deploy command `npx wrangler deploy`. The Node version comes from `.node-version`.

Pass `noindex` to `Base` on any page that should stay out of search results.

## Fonts

Words are set in Barlow Semi Condensed and numbers in B612, both under the SIL Open Font License. The files in `src/fonts/` hold only the keyboard characters plus every other character found in `src/`. After adding text with a new symbol or accented letter, run `npm run fonts` and commit the result. A character missing from the files still shows, in the visitor's system font.

## Logo and icons

The header logo is drawn in CSS in `src/layouts/Base.astro`. `npm run brand` writes the same mark as files in `public/`: `logo.svg` and `logo-dark.svg` (mark and wordmark, for light and dark backgrounds), `logo-mark.svg`, `apple-touch-icon.png`, `favicon.ico` and `og.png`, the image shown when a page is shared. `favicon.svg` is kept by hand. Run the script again after changing the mark or the colours.

## Content

- **Guides:** list each guide in `src/guides.ts` (title, description, dates) and put its page in `src/pages/guides/<slug>.astro` using the `Guide` layout. Worked examples run through the engine, and a mismatch with the text fails the build.
- **State pages:** the content for each is in `src/states.ts`. Add a rule set in `src/engine/rules/index.ts` first, with its sources, then a state entry and its expected example figures in `tests/content.test.ts`.
- **Rule data:** update `lastReviewed` whenever a rule set is re-read, and record what was read in `LEGAL-SOURCES.md`.
- **Embeds:** the framed widget pages are `src/pages/embed/converter.astro` and `chart.astro`. `public/_headers` removes `X-Frame-Options` for those two only. They are left out of the sitemap in `astro.config.mjs`.
- **Time card links:** `/?rules=california` opens the time card with a rule set chosen. The valid ids are the keys of `RULE_SETS`.
