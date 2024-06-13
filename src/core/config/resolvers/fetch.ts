import consola from "consola";
import type { NitroOptions } from "nitro/types";

export async function resolveFetchOptions(options: NitroOptions) {
  // Use native fetch in builds
  options.alias = {
    "node-fetch-native/polyfill": "unenv/runtime/mock/empty",
    "node-fetch-native": "node-fetch-native/native",
    ...options.alias,
  };
}
