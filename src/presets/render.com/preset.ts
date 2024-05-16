import { defineNitroPreset } from "nitropack";

export const renderCom = defineNitroPreset(
  {
    extends: "node-server",
  },
  {
    name: "render-com" as const,
    url: import.meta.url,
  }
);

export default [renderCom] as const;
