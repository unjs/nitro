import { defineCommand } from "citty";
import { resolve } from "pathe";
import { createNitro } from "../../nitro";
import { build, prepare, copyPublicAssets } from "../../build";
import { prerender } from "../../prerender";
import { commonArgs } from "../common";

export default defineCommand({
  meta: {
    name: "build",
    description: "Build nitro project for production",
  },
  args: {
    ...commonArgs,
    minify: {
      type: "boolean",
      description:
        "Minify the output (overides preset defaults you can also use `--no-minify` to disable).",
    },
    preset: {
      type: "string",
      description:
        "The build preset to use (you can also use `NITRO_PRESET` environment variable).",
    },
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    console.log(args.minify);
    const nitro = await createNitro({
      rootDir,
      dev: false,
      minify: args.minify,
      preset: args.preset,
    });
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await build(nitro);
    await nitro.close();
  },
});
