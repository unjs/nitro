import jiti from "jiti";
import type { Nitro, NitroModule, NitroModuleInput } from "./types";
import { resolvePath } from "./utils";

export function defineNitroModule(def: NitroModule) {
  return def;
}

export function resolveNitroModule(
  mod: NitroModuleInput,
  nitroOptions: Nitro["options"]
): Promise<NitroModule & { _url: string }> {
  let _url: string | undefined;

  if (typeof mod === "string") {
    // @ts-ignore
    globalThis.defineNitroModule =
      // @ts-ignore
      globalThis.defineNitroModule || defineNitroModule;

    const _jiti = jiti(nitroOptions.rootDir, { interopDefault: true });
    const _modPath = _jiti.resolve(resolvePath(mod, nitroOptions));
    _url = _modPath;
    mod = _jiti(_modPath) as NitroModule;
  }

  if (typeof mod === "function") {
    mod = { setup: mod };
  }

  if (!mod.setup) {
    // TODO: Warn?
    mod.setup = () => {};
  }

  return Promise.resolve({
    _url,
    ...mod,
  });
}
