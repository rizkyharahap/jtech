// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Base-agnostic: these two env vars are the ONLY things that differ per host.
//   Vercel   → SITE_URL=https://<project>.vercel.app        BASE_PATH=/ (default)
//   GH Pages → SITE_URL=https://<user>.github.io   BASE_PATH=/jtech
// Every internal link goes through withBase() (src/lib/url.ts), so no source
// edit is needed when switching hosts.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://jtechlawangperkasa.com',
  base: process.env.BASE_PATH ?? '/',

  output: 'static', // SSG only — no adapter, ever
  trailingSlash: 'always', // deterministic URLs on GH Pages and Vercel
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
    routing: { prefixDefaultLocale: false },
  },

  // sharp is Astro's built-in default image service — no extra dependency.
  image: { responsiveStyles: true },

  // Astro 7 native Fonts API: self-hosted, preloaded, zero npm packages.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700, 800],
      subsets: ['latin'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Outfit',
      cssVariable: '--font-display',
      weights: [500, 600, 700],
      subsets: ['latin'],
      display: 'swap',
    },
  ],

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID', en: 'en-US' } },
    }),
  ],

  vite: { plugins: [tailwindcss()] },
});
