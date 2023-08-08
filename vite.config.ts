import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults } from 'vitest/config';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  test: {
    // need to enable globals for auto-cleanup of rendered DOM resources
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTest.ts'],
    coverage: {
      exclude: ['setupTest.ts']
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: [...configDefaults.exclude, 'tests'],
    testTimeout: 10000
  }
};

export default config;
