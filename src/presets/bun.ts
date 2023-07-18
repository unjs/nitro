import { resolvePathSync } from "mlly";
import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/bun",
  // https://bun.sh/docs/runtime/modules#resolution
  exportConditions: ["bun", "worker", "module", "node", "default", "browser"],
  commands: {
    preview: "bun run ./server/index.mjs",
  },
});
