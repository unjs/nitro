import { defineNitroPreset } from "nitropack/kit";
import { updatePackageJSON } from "./utils";
import type { Nitro } from "nitropack/types";
const coolify = defineNitroPreset(
  {
    extends: "node-server",
    hooks: {
      async compiled(nitro: Nitro) {
        await updatePackageJSON(nitro);
      },
    },
  },
  {
    name: "coolify" as const,
    url: import.meta.url,
  }
);

export default [
  coolify
];