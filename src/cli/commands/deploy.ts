import { defineCommand } from "citty";
import type { DateString } from "compatx";
import { resolve } from "pathe";
import consola from "consola";
import {
  build,
  copyPublicAssets,
  createNitro,
  deploy,
  getBuildInfo,
  prepare,
  prerender,
} from "nitro/builder";
import { buildArgs } from "./build.ts";

export default defineCommand({
  meta: {
    name: "deploy",
    description: "Build and deploy nitro project for production",
  },
  args: {
    ...buildArgs,
    prebuilt: {
      type: "boolean",
      description: "Skip the build step and deploy the existing build",
    },
  },
  async run({ args, rawArgs }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);

    let preset = args.preset;
    if (args.prebuilt) {
      const { buildInfo } = await getBuildInfo(rootDir);
      if (!buildInfo) {
        consola.error("No build info found, cannot deploy.");
        process.exit(1);
      }
      preset = buildInfo.preset;
    }

    const nitro = await createNitro(
      {
        rootDir,
        dev: false,
        minify: args.minify,
        preset,
        builder: args.builder as "rollup" | "rolldown" | "vite",
      },
      {
        compatibilityDate: args.compatibilityDate as DateString,
      }
    );

    if (!args.prebuilt) {
      await prepare(nitro);
      await copyPublicAssets(nitro);
      await prerender(nitro);
      await build(nitro);
    }

    const extraArgs = rawArgs.includes("--") ? rawArgs.slice(rawArgs.indexOf("--") + 1) : [];

    try {
      await deploy(nitro, { args: extraArgs });
    } catch (error) {
      consola.error((error as Error).message);
      process.exit(1);
    } finally {
      await nitro.close();
    }
  },
});
