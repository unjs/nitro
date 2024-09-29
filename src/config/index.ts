import type { NitroConfig } from "nitropack/types";

export type { NitroConfig } from "nitropack/types";

export function defineNitroConfig(config: NitroConfig): NitroConfig {
  config.cloudflare?.wrangler?.compatibility_flags;
  return config;
}
