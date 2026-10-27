import { defineConfig, devices } from '@playwright/test'

const port = 3100
const baseURL = `http://localhost:${port}`

// Corre contra el build de producción: `npm run build` antes de `npm run e2e`.
export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // En CI: anotaciones en el PR + reporte HTML que el workflow sube si algo falla.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next start -p ${port}`,
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI
  }
})
