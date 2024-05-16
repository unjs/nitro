import { defineNitroPreset } from "nitropack";

const stormkit = defineNitroPreset(
  {
    entry: "./runtime/stormkit",
    output: {
      dir: "{{ rootDir }}/.stormkit",
    },
  },
  {
    name: "stormkit" as const,
    stdName: "stormkit",
    url: import.meta.url,
  }
);

export default [stormkit] as const;
