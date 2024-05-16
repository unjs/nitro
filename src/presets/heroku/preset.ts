import { defineNitroPreset } from "nitropack";

const heroku = defineNitroPreset(
  {
    extends: "node-server",
  },
  {
    name: "heroku" as const,
    url: import.meta.url,
  }
);

export default [heroku] as const;
