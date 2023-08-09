import { resolvePathSync } from "mlly";
import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/bun",
  // https://bun.sh/docs/runtime/modules#resolution
  exportConditions: ["bun", "worker", "node", "require", "import", "default"],
  commands: {
    preview: "bun run ./server/index.mjs",
  },
});
