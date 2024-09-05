import { createJiti } from "jiti";
import type { Nitro, NitroModule, NitroModuleInput } from "nitro/types";

export async function installModules(nitro: Nitro) {
  const _modules = [...(nitro.options.modules || [])];
  const modules = await Promise.all(
    _modules.map((mod) => _resolveNitroModule(mod, nitro.options))
  );
  const _installedURLs = new Set<string>();
  for (const mod of modules) {
    if (mod._url) {
      if (_installedURLs.has(mod._url)) {
        continue;
      }
      _installedURLs.add(mod._url);
    }
    await mod.setup(nitro);
  }
}

async function _resolveNitroModule(
  mod: NitroModuleInput,
  nitroOptions: Nitro["options"]
): Promise<NitroModule & { _url?: string }> {
  let _url: string | undefined;

  if (typeof mod === "string") {
    // @ts-ignore
    globalThis.defineNitroModule =
      // @ts-ignore
      globalThis.defineNitroModule || ((mod) => mod);

    const jiti = createJiti(nitroOptions.rootDir, {
      interopDefault: true,
      alias: nitroOptions.alias,
    });
    const _modPath = jiti.esmResolve(mod);
    _url = _modPath;
    mod = (await jiti.import(_modPath)) as NitroModule;
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
