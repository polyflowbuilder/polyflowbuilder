import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && export NODE_ENV=test && npm run preview',
    port: 4173
  },
  testDir: 'tests',
  retries: 3
};

export default config;
