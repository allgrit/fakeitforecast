import { defineConfig } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND || 'npm run dev -- --host 0.0.0.0 --port 4173'
const webServerUrl = process.env.PLAYWRIGHT_WEB_SERVER_URL || baseURL

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: webServerCommand,
    url: webServerUrl,
    reuseExistingServer: true,
    timeout: 120000
  }
})
