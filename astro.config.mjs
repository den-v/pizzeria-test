// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// The live site runs on Cloudflare: GitHub builds it with CLOCKHEART_TARGET=cloudflare.
// Keystatic's admin goes live once its GitHub App exists (PUBLIC_KEYSTATIC_GITHUB_APP_SLUG, set on
// GitHub only); the preview here keeps its own settings — added by Clockheart.
const onCloudflare = process.env.CLOCKHEART_TARGET === 'cloudflare';
const liveAdmin = onCloudflare && !!process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

const building = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
  adapter: onCloudflare ? cloudflare() : undefined,
  integrations: [react(), markdoc(), ...(building && !liveAdmin ? [] : [keystatic()])],

  fonts: [{
    provider: fontProviders.google(),
    name: 'Mulish',
    cssVariable: '--font-mulish',
    weights: ['200 1000'],
    styles: ['normal'],
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    fallbacks: ['sans-serif']
  }]
});