import { defineNitroPreset } from "nitropack/kit";

const node = defineNitroPreset(
  {
    entry: "./runtime/node-listener",
  },
  {
    name: "node-listener" as const,
    aliases: ["node"] as const,
    url: import.meta.url,
  }
);

const nodeServer = defineNitroPreset(
  {
    extends: "node",
    entry: "./runtime/node-server",
    serveStatic: true,
    commands: {
      preview: "node ./server/index.mjs",
    },
  },
  {
    name: "node-server" as const,
    url: import.meta.url,
  }
);

const nodeCluster = defineNitroPreset(
  {
    extends: "node-server",
    entry: "./runtime/node-cluster",
  },
  {
    name: "node-cluster" as const,
    url: import.meta.url,
  }
);

const cli = defineNitroPreset(
  {
    extends: "node",
    entry: "./runtime/cli",
    commands: {
      preview: "Run with node ./server/index.mjs [route]",
    },
  },
  {
    name: "cli" as const,
    url: import.meta.url,
  }
);

export default [node, nodeServer, nodeCluster, cli] as const;
