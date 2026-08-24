import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  server: {
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(import.meta.dirname, 'standalone.html'),
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
