import { defineConfig } from 'patchright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  use: {
    headless: false,
    trace: 'on',
  },
});

