import { defineConfig } from "vitest/config";

// Pruebas de integración de la API contra un servidor en marcha (`npm run test:api`).
// Requieren la base con seed y `next start` en API_BASE_URL (por defecto http://localhost:3000).
export default defineConfig({
  test: {
    include: ["tests/api/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
