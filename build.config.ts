import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  name: "nitro",
  entries: [
    "src/index",
    "src/config",
    "src/cli/cli",
    { input: "src/runtime/", outDir: "dist/runtime", format: "esm" },
  ],
  externals: ["@nuxt/schema", "firebase-functions"],
});
