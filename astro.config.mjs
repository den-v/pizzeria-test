// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Keystatic's admin runs only while developing (local mode): the live site is a
// static `astro build`, and content is edited on this computer.
const building = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
  integrations: [react(), markdoc(), ...(building ? [] : [keystatic()])],

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