import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { GUIDES, guidePath } from './src/guides.ts';
import { SITE } from './src/site.ts';
import { STATES, statePath } from './src/states.ts';

// Only pages with a real "updated" date get a lastmod. Search engines ignore the field when it is not trustworthy.
const lastmod = new Map([...GUIDES.map((g) => [guidePath(g.slug), g.updated]), ...STATES.map((s) => [statePath(s.slug), s.updated])]);

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  // Compressing the HTML drops the space between a word and a link that starts on the next line of the source.
  compressHTML: false,
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !/\/embed\/(converter|chart)\/$/.test(page),
      serialize(item) {
        const date = lastmod.get(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
  ],
});
