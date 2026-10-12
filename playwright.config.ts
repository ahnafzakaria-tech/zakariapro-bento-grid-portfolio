import { defineConfig, devices } from '@playwright/test';
import os from 'os';
import path from 'path';

const tempReportDir = path.join(os.tmpdir(), 'playwright-report');
const tempOutputDir = path.join(os.tmpdir(), 'playwright-test-results');

export default defineConfig({
  testDir: './e2e',
  outputDir: tempOutputDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: tempReportDir, open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    video: 'off',
    screenshot: 'only-as-needed',
  },
  projects: [
    {
      name: 'Desktop 1920',
      use: { ...devices['Desktop 1080p'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Desktop 1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop 1280',
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'Tablet-Landscape',
      use: { viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'Tablet-Portrait',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Mobile-430',
      use: { viewport: { width: 430, height: 932 } },
    },
    {
      name: 'Mobile-390',
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'Mobile-360',
      use: { viewport: { width: 360, height: 740 } },
    },
    {
      name: 'Mobile-320',
      use: { viewport: { width: 320, height: 568 } },
    },
    {
      name: 'Mobile-Landscape',
      use: { viewport: { width: 844, height: 390 } },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
});
