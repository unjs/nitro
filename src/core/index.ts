import type { NitroConfig } from "nitropack/types";

// export * from "nitropack/types";

export * from "./config";
export * from "./build";
export * from "./nitro";
export * from "./scan";
export * from "./dev/server";
export * from "./prerender";
export * from "./task";

/**
 * @deprecated Please import `defineNitroConfig` from nitropack/config instead
 */
export function defineNitroConfig(config: NitroConfig): NitroConfig {
  return config;
}
