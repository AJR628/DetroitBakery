// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://detroitbakery.com',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/thanks/') &&
        !page.includes('/404'),
    }),
  ],
  build: { format: 'directory' },
});
