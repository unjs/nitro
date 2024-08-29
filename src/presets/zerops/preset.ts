import { defineNitroPreset } from "nitropack/kit";

const zerops = defineNitroPreset(
  {
    extends: "node-server",
  },
  {
    name: "zerops" as const,
    url: import.meta.url,
  }
);

export default [zerops] as const;
