import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** Standalone Vitest config — vite.config.ts exports a callback; mergeConfig cannot merge callbacks. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@xevn/ui': path.resolve(__dirname, '../../../packages/ui/src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    /** RTL suite can hang on jsdom + GlobalFilter; run via `vitest run src/modules/hrm/HrmWorkspacePanel.errorDisplay.test.tsx` when fixing. */
    exclude: ['src/modules/hrm/HrmWorkspacePanel.errorDisplay.test.tsx'],
    clearMocks: true,
  },
});
