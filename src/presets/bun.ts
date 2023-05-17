import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/bun",
  commands: {
    preview: "bun run ./server/index.mjs",
  },
});
