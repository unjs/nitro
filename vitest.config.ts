import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "nitropack/dist/runtime": "./src/runtime",
    },
    coverage: {
      reporter: ["text", "clover", "json"],
    },
    include: ["test/**/*.test.ts"],
  },
});
