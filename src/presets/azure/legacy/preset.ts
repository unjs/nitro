import { defineNitroPreset } from "nitropack";
import type { Nitro } from "nitropack";
import { writeFunctionsRoutes } from "./utils";

const azureFunctions = defineNitroPreset(
  {
    serveStatic: true,
    entry: "./runtime/azure-functions",
    commands: {
      deploy:
        "az functionapp deployment source config-zip -g <resource-group> -n <app-name> --src {{ output.dir }}/deploy.zip",
    },
    hooks: {
      async compiled(ctx: Nitro) {
        await writeFunctionsRoutes(ctx);
      },
    },
  },
  {
    name: "azure-functions" as const,
    url: import.meta.url,
  }
);

export default [azureFunctions] as const;
