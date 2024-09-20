import { defineNitroPreset } from "nitropack/kit";
import type { Nitro } from "nitropack/types";
import { writeIISFiles, writeIISNodeFiles } from "./utils";

const iisHandler = defineNitroPreset(
  {
    extends: "node-server",
    hooks: {
      async compiled(nitro: Nitro) {
        await writeIISFiles(nitro);
      },
    },
  },
  {
    name: "iis-handler" as const,
    aliases: ["iis"] as const,
    url: import.meta.url,
  }
);

const iisNode = defineNitroPreset(
  {
    extends: "node-server",
    hooks: {
      async compiled(nitro: Nitro) {
        await writeIISNodeFiles(nitro);
      },
    },
  },
  {
    name: "iis-node" as const,
    url: import.meta.url,
  }
);

export default [iisHandler, iisNode] as const;
