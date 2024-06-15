import { defineCommand } from "citty";
import { resolve } from "pathe";
import {
  build,
  copyPublicAssets,
  createNitro,
  prepare,
  prerender,
} from "nitro/core";
import { commonArgs } from "../common";

export default defineCommand({
  meta: {
    name: "render",
    description: "Render single route with already built nitro project (run build first)",
  },
  args: {
    route: {
      type: "positional",
      description: "The route to render",
      required: true,
    },
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
    stdout: {
      type: "boolean",
      description: "Print the output to stdout, will silence nitro logs",
    }
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    const nitro = await createNitro({
      rootDir,
      logLevel: 0,
      dev: false,
      minify: args.minify,
      preset: args.preset,
      prerender: {
        routes: [(args.route.startsWith("/") ? "" : "/") + args.route],
        crawlLinks: false,
        stdout: args.stdout,
      },
    });
    // await prepare(nitro);
    // await copyPublicAssets(nitro);
    await prerender(nitro);
    // await build(nitro);
    await nitro.close();
  },
});
