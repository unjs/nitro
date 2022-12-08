import { defineNitroPreset } from "../preset";

export const nodeServer = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/node-server",
  serveStatic: true,
  commands: {
    preview: "node ./server/index.mjs",
  },
});

export const nodeCluster = defineNitroPreset({
  extends: "node-server",
  entry: "#internal/nitro/entries/node-cluster",
});
