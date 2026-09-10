import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: {
    ...devices['iPhone 13'],
    defaultBrowserType: 'chromium',
    channel: 'msedge',
    baseURL: 'http://localhost:4173',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: {
    command: 'npm run preview -- --host localhost --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
})
