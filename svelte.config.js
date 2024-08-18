import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import { execSync } from 'node:child_process';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    vitePreprocess(),
    preprocess({
      postcss: true
    })
  ],

  kit: {
    adapter: adapter(),
    csp: {
      mode: 'auto',
      directives: {
        'script-src': ['self', 'https://analytics.polyflowbuilder.io']
      }
    },
    version: {
      name: execSync('git rev-parse --short HEAD').toString().trim()
    }
  },

  vitePlugin: {
    inspector: true
  }
};

export default config;
