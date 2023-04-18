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
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    const nitro = await createNitro({
      rootDir,
      dev: false,
    });
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await build(nitro);
    await nitro.close();
  },
});
