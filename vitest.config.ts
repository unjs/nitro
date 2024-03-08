import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 10_000,
    coverage: {
      reporter: ["text", "clover", "json"],
    },
    include: ["test/**/*.test.ts"],
  },
});
