import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';
import { vitePreprocess } from '@sveltejs/kit/vite';

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
  }
};

export default config;
