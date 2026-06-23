import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: [
      {
        find: /assets\/fonts\/Ionicons\.ttf$/,
        replacement: path.resolve(__dirname, 'src/bootstrap/__tests__/mocks/ioniconsFontMock.ts'),
      },
    ],
  },
});
