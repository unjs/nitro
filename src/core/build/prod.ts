import { promises as fsp } from "node:fs";
import { formatCompatibilityDate } from "compatx";
import { writeFile } from "nitro/kit";
import { version as nitroVersion } from "nitro/meta";
import type { Nitro, NitroBuildInfo, RollupConfig } from "nitro/types";
import { dirname, join, relative, resolve } from "pathe";
import * as rollup from "rollup";
import { scanHandlers } from "../scan";
import { generateFSTree } from "../utils/fs-tree";
import { nitroServerName } from "../utils/nitro";
import { snapshotStorage } from "../utils/storage";
import { formatRollupError } from "./error";
import { writeTypes } from "./types";

export async function buildProduction(
  nitro: Nitro,
  rollupConfig: RollupConfig
) {
  await scanHandlers(nitro);
  await writeTypes(nitro);
  await _snapshot(nitro);

  if (!nitro.options.static) {
    nitro.logger.info(
      `Building ${nitroServerName(nitro)} (preset: \`${nitro.options.preset}\`, compatibility date: \`${formatCompatibilityDate(nitro.options.compatibilityDate)}\`)`
    );
    const build = await rollup.rollup(rollupConfig).catch((error) => {
      nitro.logger.error(formatRollupError(error));
      throw error;
    });

    await build.write(rollupConfig.output);
  }

  // Write .output/nitro.json
  const buildInfoPath = resolve(nitro.options.output.dir, "nitro.json");
  const buildInfo: NitroBuildInfo = {
    date: new Date().toJSON(),
    preset: nitro.options.preset,
    framework: nitro.options.framework,
    versions: {
      nitro: nitroVersion,
    },
    commands: {
      preview: nitro.options.commands.preview,
      deploy: nitro.options.commands.deploy,
    },
  };
  await writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));

  if (!nitro.options.static) {
    if (nitro.options.logging.buildSuccess) {
      nitro.logger.success(`${nitroServerName(nitro)} built`);
    }
    if (nitro.options.logLevel > 1) {
      process.stdout.write(
        (await generateFSTree(nitro.options.output.serverDir, {
          compressedSizes: nitro.options.logging.compressedSizes,
        })) || ""
      );
    }
  }

  await nitro.hooks.callHook("compiled", nitro);

  // Show deploy and preview hints
  const rOutput = relative(process.cwd(), nitro.options.output.dir);
  const rewriteRelativePaths = (input: string) => {
    return input.replace(/([\s:])\.\/(\S*)/g, `$1${rOutput}/$2`);
  };
  if (buildInfo.commands!.preview) {
    nitro.logger.success(
      `You can preview this build using \`${rewriteRelativePaths(
        buildInfo.commands!.preview
      )}\``
    );
  }
  if (buildInfo.commands!.deploy) {
    nitro.logger.success(
      `You can deploy this build using \`${rewriteRelativePaths(
        buildInfo.commands!.deploy
      )}\``
    );
  }
}

async function _snapshot(nitro: Nitro) {
  if (
    nitro.options.bundledStorage.length === 0 ||
    nitro.options.preset === "nitro-prerender"
  ) {
    return;
  }
  // TODO: Use virtual storage for server assets
  const storageDir = resolve(nitro.options.buildDir, "snapshot");
  nitro.options.serverAssets.push({
    baseName: "nitro:bundled",
    dir: storageDir,
  });

  const data = await snapshotStorage(nitro);
  await Promise.all(
    Object.entries(data).map(async ([path, contents]) => {
      if (typeof contents !== "string") {
        contents = JSON.stringify(contents);
      }
      const fsPath = join(storageDir, path.replace(/:/g, "/"));
      await fsp.mkdir(dirname(fsPath), { recursive: true });
      await fsp.writeFile(fsPath, contents, "utf8");
    })
  );
}
