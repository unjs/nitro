import type { Nitro, NitroDynamicConfig } from "nitro/types";
import { normalizeRouteRules } from "./resolvers/route-rules";
import { normalizeRuntimeConfig } from "./resolvers/runtime-config";
import consola from "consola";

export async function updateNitroConfig(
  nitro: Nitro,
  config: NitroDynamicConfig
) {
  nitro.options.routeRules = normalizeRouteRules(
    config.routeRules ? config : nitro.options
  );
  nitro.options.runtimeConfig = normalizeRuntimeConfig(
    config.runtimeConfig ? config : nitro.options
  );
  await nitro.hooks.callHook("rollup:reload");
  consola.success("Nitro config hot reloaded!");
}
