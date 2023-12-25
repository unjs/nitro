import jiti from "jiti";
import { resolvePath } from "mlly";
import type { Nitro, NitroModule, NitroModuleInput } from "./types";

export function defineNitroModule(def: NitroModule) {
  return def;
}

export async function resolveNitroModule(
  mod: NitroModuleInput,
  nitroOptions: Nitro["options"]
): Promise<NitroModule & { _url: string }> {
  let _url: string | undefined;

  if (typeof mod === "string") {
    // @ts-ignore
    globalThis.defineNitroModule =
      // @ts-ignore
      globalThis.defineNitroModule || defineNitroModule;

    const _jiti = jiti(nitroOptions.rootDir, { interopDefault: true, esmResolve: true });
    const _modPath = _jiti.resolve(await resolvePath(mod, { url: nitroOptions.rootDir, extensions: ['.mjs', '.mts', '.js', '.ts', '.cjs'] }))
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

  return {
    _url,
    ...mod,
  };
}
