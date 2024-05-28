import type { NitroAppPlugin } from "nitropack/schema";

export function defineNitroPlugin(def: NitroAppPlugin) {
  return def;
}

export const nitroPlugin = defineNitroPlugin;
