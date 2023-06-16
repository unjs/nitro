import { resolvePathSync } from "mlly";
import { defineNitroPreset } from "../preset";

export const bun = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/bun",
  externals: {
    traceInclude: ["ofetch", "uncrypto", "node-fetch-native"].map((id) =>
      resolvePathSync(id, {
        url: import.meta.url,
        conditions: ["bun"],
      })
    ),
  },
  commands: {
    preview: "bun run ./server/index.mjs",
  },
});
