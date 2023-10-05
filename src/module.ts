import { defu } from "defu";
import type { ModuleDefinition, Nitro, NitroModule } from "./types";

export function defineNitroModule(definition: ModuleDefinition | NitroModule) {
  if (typeof definition === "function") {
    return defineNitroModule({ setup: definition });
  }

  const module = definition;

  async function normalizedModule(nitro: Nitro) {
    const res = await module.setup(nitro);

    return res;
  }

  return normalizedModule;
}
