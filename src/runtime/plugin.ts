import type { NitroAppPlugin } from "nitropack/types";

export function defineNitroPlugin(def: NitroAppPlugin) {
  return def;
}

export const nitroPlugin = defineNitroPlugin;
