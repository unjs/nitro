import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  typescript: {
    // Because the TSConfig extends properties is not a merge but overwrite keys, we loose the paths from the NitroPack TSConfig.
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
