import { resolvePathSync } from "mlly";
import { defineNitroPreset } from "../preset";
import {
  exportConditions,
  nodeExportConditions,
} from "../utils/export-conditions";

export const bun = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/bun",
  exportConditions: exportConditions("bun", nodeExportConditions),
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
