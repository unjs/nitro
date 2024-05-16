import { defineNitroPreset } from "nitropack";

export const flightControl = defineNitroPreset(
  {
    extends: "node-server",
  },
  {
    name: "flight-control" as const,
    url: import.meta.url,
  }
);

export default [flightControl] as const;
