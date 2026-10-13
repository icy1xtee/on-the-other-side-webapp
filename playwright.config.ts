import { defineConfig, devices } from '@playwright/test';

// The e2e smoke tests run against the production build served by `vite preview`, so a build that
// breaks the game fails them too. `npm run e2e` builds first; `npx playwright test` on its own
// serves the last build. A port of its own: a preview Pavel runs by hand doesn't get in the way.
const port = 4180;
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  // Chrome is the target browser; the design's own page size, 1280×720.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
});
