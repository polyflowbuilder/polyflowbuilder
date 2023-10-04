import { devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && export NODE_ENV=test && npm run preview',
    reuseExistingServer: !process.env.CI,
    port: 4173,
    timeout: 120000
  },
  testDir: 'tests',
  retries: 3,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      }
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // see https://github.com/microsoft/playwright/issues/24457
        deviceScaleFactor: 1
      }
    }
  ]
};

export default config;
