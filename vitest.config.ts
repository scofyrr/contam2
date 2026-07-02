import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
      "tests/e2e/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", "supabase"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/asientos-contables-utils.ts",
        "src/lib/asientos-generator.ts",
        "src/modules/contabilidad/pcge/services/pcge-validator.ts",
        "src/modules/contabilidad/diario/services/asiento-template-engine.ts",
        "src/modules/contabilidad/diario/services/asiento-validator-service.ts",
        "src/modules/caja/services/conciliacion-utils.ts",
        "src/modules/auth/services/permission-service.ts",
      ],
      exclude: ["src/**/*.d.ts", "src/**/*.test.*", "src/**/__mocks__/**", "src/types/**"],
      thresholds: {
        branches: 50,
        functions: 55,
        lines: 58,
        statements: 58,
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [40, 70],
        lines: [50, 80],
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
