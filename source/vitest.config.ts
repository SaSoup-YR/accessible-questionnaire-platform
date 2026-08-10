import { configDefaults, defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      'tests/e2e/**',
      'tests/e2e-support/**',
    ],
  },
});
