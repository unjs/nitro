import { defineCommand } from "citty";
import { resolve } from "pathe";
import { createNitro } from "../../nitro";
import { build, prepare } from "../../build";
import { createDevServer } from "../../dev/server";
import { commonArgs } from "../common";

export default defineCommand({
  meta: {
    name: "dev",
    description: "Start the development server",
  },
  args: {
    ...commonArgs,
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    const nitro = await createNitro({
      rootDir,
      dev: true,
      preset: "nitro-dev",
    });
    const server = createDevServer(nitro);
    await server.listen({});
    await prepare(nitro);
    await build(nitro);
  },
});
