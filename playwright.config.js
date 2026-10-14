const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const standaloneUrl = `file://${path.resolve('app/cashrec.html')}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'standalone',
      use: {
        ...devices['Desktop Chrome'],
        appUrl: standaloneUrl
      },
    },
    {
      name: 'web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
        appUrl: 'http://localhost:4173/index.html'
      },
    },
  ],

  webServer: {
    command: 'npx http-server web -p 4173 -c-1',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
