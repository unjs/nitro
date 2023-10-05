import { useNitro } from "../context";
import { Nitro, NitroModule } from "../types";

export async function installModule (moduleToInstall: string | NitroModule, inlineOptions?: any, nitro: Nitro = useNitro()) {
  const { nitroModule } = loadNitroModuleInstall(moduleToInstall, nitro);

  const res = await nitroModule(inlineOptions, nitro);

  if (res === false) {
    return
  }

  return res
}

export function loadNitroModuleInstall(nitroModule: string | NitroModule, nitro: Nitro) {
  if (typeof nitroModule === "string") {
    throw new TypeError("Not implemented");
  }

  return { nitroModule }
}
