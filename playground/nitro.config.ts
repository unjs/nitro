import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  typescript: {
    // TSConfig `extends` property is not a merge, it overwrites keys and paths from the generated TSConfig are loosed.
    tsConfig: {
      compilerOptions: {
        paths: {
          nitropack: ["../../../src/index"],
          "nitropack/config": ["../../../src/config"],
          "#internal/nitro": ["../../../src/runtime/index"],
          "#internal/nitro/*": ["../../../src/runtime/*"],
        },
      },
    },
  },
});
