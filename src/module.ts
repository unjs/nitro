import { defu } from "defu";
import type { ModuleDefinition, Nitro, NitroModule } from "./types";

export function defineNitroModule(definition: ModuleDefinition | NitroModule) {
  if (typeof definition === "function") {
    return defineNitroModule({ setup: definition });
  }

  const module = defu(definition, { meta: {} });
  const options = {};

  async function normalizedModule(nitro: Nitro, inlineOptions: any) {
    const res = await module.setup(nitro, options);

    return res;
  }

  return normalizedModule;
}
