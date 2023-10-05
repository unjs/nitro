import { defu } from "defu";
import { ModuleDefinition, Nitro, NitroModule } from "../types";
import { useNitro } from "../context";

export function defineNitroModule(definition: ModuleDefinition | NitroModule) {
  if (typeof definition === 'function') { return defineNitroModule({ setup: definition }) }

  const module = defu(definition, { meta: {} })
  const options = {}

  async function normalizedModule(this: any, inlineOptions: any, nitro: Nitro = useNitro()) {
    const res = await module.setup?.call(null as any, options, nitro) ?? {}

    if (res === false) {
      return false
    }

    return res
  }

  return normalizedModule
}
