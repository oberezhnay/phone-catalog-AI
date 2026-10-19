import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // config/env.ts validates process.env on import; fixed values keep the
    // tests independent of a local .env file.
    env: {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
      JWT_SECRET: 'test-secret-test-secret-test-secret-1234',
      CORS_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
  },
});
