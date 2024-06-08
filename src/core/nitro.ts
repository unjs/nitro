import { createHooks, createDebugger } from "hookable";
import { createUnimport } from "unimport";
import { consola } from "consola";
import type {
  NitroConfig,
  NitroDynamicConfig,
  Nitro,
  LoadConfigOptions,
} from "nitropack/types";
import { loadOptions } from "./config/loader";
import { createStorage } from "./utils/storage";
import { installModules } from "./module";
import { updateNitroConfig } from "./config/update";
import { addNitroTasksVirtualFile } from "./task";
import { scanAndSyncOptions } from "./scan";

export async function createNitro(
  config: NitroConfig = {},
  opts: LoadConfigOptions = {}
): Promise<Nitro> {
  // Resolve options
  const options = await loadOptions(config, opts);

  // Create nitro context
  const nitro: Nitro = {
    options,
    hooks: createHooks(),
    vfs: {},
    logger: consola.withTag("nitro"),
    scannedHandlers: [],
    close: () => nitro.hooks.callHook("close"),
    storage: undefined as any,
    async updateConfig(config: NitroDynamicConfig) {
      updateNitroConfig(nitro, config);
    },
  };

  // Scan dirs and sync options
  // TODO: Make it side-effect free to allow proper watching
  await scanAndSyncOptions(nitro);

  // Storage
  nitro.storage = await createStorage(nitro);
  nitro.hooks.hook("close", async () => {
    await nitro.storage.dispose();
  });

  // Debug and timing
  if (nitro.options.debug) {
    createDebugger(nitro.hooks, { tag: "nitro" });
    nitro.options.plugins.push("nitropack/runtime/internal/debug");
  }
  if (nitro.options.timing) {
    nitro.options.plugins.push("nitropack/runtime/internal/timing");
  }

  // Logger
  if (nitro.options.logLevel !== undefined) {
    nitro.logger.level = nitro.options.logLevel;
  }

  // Hooks
  nitro.hooks.addHooks(nitro.options.hooks);

  // Tasks
  addNitroTasksVirtualFile(nitro);

  // Auto imports
  if (nitro.options.imports) {
    // Create unimport instance
    nitro.unimport = createUnimport(nitro.options.imports);
    await nitro.unimport.init();
    // Support for importing from '#imports'
    nitro.options.virtual["#imports"] = () => nitro.unimport?.toExports() || "";
    // Backward compatibility
    nitro.options.virtual["#nitro"] = 'export * from "#imports"';
  }

  // Scan and install modules as last step
  await installModules(nitro);

  return nitro;
}
