import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  integrations: [preact(), sitemap({ filter: (page) => !/\/embed\/(converter|chart)\/$/.test(page) })],
});
