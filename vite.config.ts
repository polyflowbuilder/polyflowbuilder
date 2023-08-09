import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults } from 'vitest/config';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  test: {
    // need to enable globals for auto-cleanup of rendered DOM resources
    globals: true,
    environment: 'jsdom',
    setupFiles: ['setupTest.ts'],
    coverage: {
      exclude: ['setupTest.ts']
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: [...configDefaults.exclude, 'tests'],
    testTimeout: 10000
  },
  // see https://github.com/vitest-dev/vitest/issues/3866
  // TLDR: need to explicitly allow files to be used for tests
  // that are outside of project root (src)
  server: {
    fs: {
      allow: process.env.VITEST
        ? [
            'setupTest.ts',
            'tests/util/storeMocks.ts',
            'tests/util/testUtil.ts',
            'tests/util/testFlowcharts.ts'
          ]
        : undefined
    }
  }
};

export default config;
