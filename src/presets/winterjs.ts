import { defineNitroPreset } from "../preset";

export const winterjs = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/winterjs",
  minify: false,
  serveStatic: "inline",
  commands: {
    preview:
      "wasmer run wasmer/winterjs --forward-host-env --net --mapdir app:./ app/server/index.mjs",
  },
});
