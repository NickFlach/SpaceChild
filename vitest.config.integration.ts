import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'integration',
    environment: 'node',
    include: ['**/*.integration.test.ts', '**/*.integration.test.tsx'],
    exclude: ['node_modules', 'dist', 'build'],
    globals: true,
    setupFiles: ['./vitest.setup.integration.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['server/**/*.ts'],
      exclude: [
        'server/**/*.test.ts',
        'server/**/*.spec.ts',
        'server/**/types.ts',
        'node_modules/**',
      ],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
});
