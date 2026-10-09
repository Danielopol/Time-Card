import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  // Compressing the HTML drops the space between a word and a link that starts on the next line of the source.
  compressHTML: false,
  integrations: [preact(), sitemap({ filter: (page) => !/\/embed\/(converter|chart)\/$/.test(page) })],
});
