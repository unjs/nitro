import { join } from "pathe";
import * as rollup from "rollup";
import { watch } from "chokidar";
import { debounce } from "perfect-debounce";
import { GLOB_SCAN_PATTERN, scanHandlers } from "../scan";
import type { Nitro, RollupConfig } from "nitropack/types";
import { nitroServerName } from "../../kit/utils";
import { writeTypes } from "./types";
import defu from "defu";
import { formatRollupError } from "../utils/error";

export async function watchDev(nitro: Nitro, rollupConfig: RollupConfig) {
  let rollupWatcher: rollup.RollupWatcher;

  async function load() {
    if (rollupWatcher) {
      await rollupWatcher.close();
    }
    await scanHandlers(nitro);
    rollupWatcher = startRollupWatcher(nitro, rollupConfig);
    await writeTypes(nitro);
  }
  const reload = debounce(load);

  const watchPatterns = nitro.options.scanDirs.flatMap((dir) => [
    join(dir, "api"),
    join(dir, "routes"),
    join(dir, "middleware", GLOB_SCAN_PATTERN),
    join(dir, "plugins"),
    join(dir, "modules"),
  ]);

  const watchReloadEvents = new Set(["add", "addDir", "unlink", "unlinkDir"]);
  const reloadWatcher = watch(watchPatterns, { ignoreInitial: true }).on(
    "all",
    (event) => {
      if (watchReloadEvents.has(event)) {
        reload();
      }
    }
  );

  nitro.hooks.hook("close", () => {
    rollupWatcher.close();
    reloadWatcher.close();
  });

  nitro.hooks.hook("rollup:reload", () => reload());

  await load();
}

function startRollupWatcher(nitro: Nitro, rollupConfig: RollupConfig) {
  const watcher = rollup.watch(
    defu(rollupConfig, {
      watch: {
        chokidar: nitro.options.watchOptions,
      },
    })
  );
  let start: number;

  watcher.on("event", (event) => {
    switch (event.code) {
      // The watcher is (re)starting
      case "START": {
        return;
      }

      // Building an individual bundle
      case "BUNDLE_START": {
        start = Date.now();
        return;
      }

      // Finished building all bundles
      case "END": {
        nitro.hooks.callHook("compiled", nitro);

        if (nitro.options.logging.buildSuccess) {
          nitro.logger.success(
            `${nitroServerName(nitro)} built`,
            start ? `in ${Date.now() - start} ms` : ""
          );
        }

        nitro.hooks.callHook("dev:reload");
        return;
      }

      // Encountered an error while bundling
      case "ERROR": {
        nitro.logger.error(formatRollupError(event.error));
      }
    }
  });
  return watcher;
}
