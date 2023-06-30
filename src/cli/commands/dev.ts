import { defineCommand } from "citty";
import { resolve } from "pathe";
import { consola } from "consola";
import { createNitro } from "../../nitro";
import { build, prepare } from "../../build";
import { createDevServer } from "../../dev/server";
import { commonArgs } from "../common";
import type { Nitro } from "../../types";

const hmrKeyRe = /^runtimeConfig\.|routeRules\./;

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
    let nitro: Nitro;
    const reload = async () => {
      if (nitro) {
        consola.info("Restarting dev server...");
        if ("unwatch" in nitro.options._c12) {
          await nitro.options._c12.unwatch();
        }
        await nitro.close();
      }
      nitro = await createNitro(
        {
          rootDir,
          dev: true,
          preset: "nitro-dev",
        },
        {
          watch: true,
          c12: {
            async onUpdate({ getDiff, newConfig }) {
              const diff = getDiff();

              if (diff.length === 0) {
                return; // No changes
              }

              consola.info(
                "Nitro config updated:\n" +
                  diff.map((entry) => `  ${entry.toString()}`).join("\n")
              );

              await (diff.every((e) => hmrKeyRe.test(e.key))
                ? nitro.updateConfig(newConfig.config) // Full reload
                : reload()); // Hot reload
            },
          },
        }
      );
      nitro.hooks.hookOnce("restart", reload);
      const server = createDevServer(nitro);
      await server.listen({});
      await prepare(nitro);
      await build(nitro);
    };
    await reload();
  },
});
