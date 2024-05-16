import { defineNitroPreset } from "nitropack";

const digitalOcean = defineNitroPreset(
  {
    extends: "node-server",
  },
  {
    name: "digital-ocean" as const,
    url: import.meta.url,
  }
);

export default [digitalOcean] as const;
