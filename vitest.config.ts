import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests as Node; these are pure logic tests (no DOM needed).
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    globals: true,
  },
});
