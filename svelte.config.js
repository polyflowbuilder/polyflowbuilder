import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';
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
        'script-src': [
          'self',
          'https://cdn.jsdelivr.net/npm/tw-elements@1.0.0-alpha13/dist/js/index.min.js'
        ]
      }
    }
  }
};

export default config;
