import type { NitroConfig } from "nitropack/types";

// Core
export { createNitro } from "./nitro";

// Prerender
export { prerender } from "./prerender/prerender";

// Dev server
export { createDevServer } from "./dev-server/server";

// Config loader
export { loadOptions } from "./config/loader";

// Tasks API
export { runTask, listTasks } from "./task";

// Build
export { build } from "./build/build";
export { copyPublicAssets } from "./build/assets";
export { prepare } from "./build/prepare";
export { writeTypes } from "./build/types";
export { generateTemplates } from "./build/templates";

// ----------- Backward compatibility -----------

/**
 * @deprecated Please import `defineNitroConfig` from nitropack/config instead
 */
export function defineNitroConfig(config: NitroConfig): NitroConfig {
  return config;
}

/** @deprecated Please import `defineNitroPreset` from nitropack/kit instead */
export { defineNitroPreset } from "nitropack/kit";

/** @deprecated Avoid depending on GLOB_SCAN_PATTERN  */
export { GLOB_SCAN_PATTERN } from "./scan";

/** @deprecated Directly import { runtimeDependencies } from "nitropack/runtime/meta"; */
export { runtimeDependencies as nitroRuntimeDependencies } from "nitropack/runtime/meta";

/** @deprecated Avoid depending on scan utils */
export {
  scanHandlers,
  scanMiddleware,
  scanModules,
  scanPlugins,
  scanServerRoutes,
  scanTasks,
} from "./scan";

/** @deprecated Directly import type { ... } from "nitropack/types"; */
export type {
  Nitro,
  NitroConfig,
  NitroDevServer,
  NitroOptions,
  NitroPreset,
  NitroWorker,
  LoadConfigOptions,
  Serialize,
  SerializeObject,
  SerializeTuple,
  Simplify,
} from "nitropack/types";
