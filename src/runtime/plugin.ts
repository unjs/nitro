import type { NitroApp } from './app'

export interface NitroAppPlugin {
  (nitro: NitroApp): void
}

export function defineNitroPlugin (def: NitroAppPlugin) {
  return def
}

export const nitroPlugin = defineNitroPlugin
