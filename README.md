# Hours Total

Payroll time tools: time card calculator, hours calculator, minutes ↔ decimal converters, overtime calculator and military time converter. See [PLAN.md](PLAN.md).

Static Astro site with Preact islands. All calculation lives in `src/engine` as pure TypeScript and stores time as integer minutes.

```bash
npm run dev      # dev server on http://localhost:4321
npm test         # engine tests
npm run pdf      # regenerate the chart PDFs in public/
npm run build    # regenerate the PDFs, then build the static site in dist/
```

## Deploying

The site is hosted on Cloudflare Pages, connected to this repository on GitHub. Every push to `main` builds and deploys to https://hourstotal.com; other branches get a preview address.

Cloudflare build settings: framework preset Astro, build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=22`.

Pass `noindex` to `Base` on any page that should stay out of search results.
