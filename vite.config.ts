/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors `paths` in tsconfig.app.json; Vitest picks it up from here too.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  oxc: {
    // Built-in Oxc replacement for babel-plugin-styled-components:
    // readable class names like `Stage__Layer-sc-xyz` in devtools.
    plugins: {
      styledComponents: {
        displayName: true,
        fileName: true,
      },
    },
  },
  test: {
    // Only pure logic is tested (engine, lib helpers); UI and JSX are not.
    include: ['src/**/*.test.ts'],
  },
});
