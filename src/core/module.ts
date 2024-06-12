import jiti from "jiti";
import type { Nitro, NitroModule, NitroModuleInput } from "nitropack/types";

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

function _resolveNitroModule(
  mod: NitroModuleInput,
  nitroOptions: Nitro["options"]
): Promise<NitroModule & { _url?: string }> {
  let _url: string | undefined;

  if (typeof mod === "string") {
    // @ts-ignore
    globalThis.defineNitroModule =
      // @ts-ignore
      globalThis.defineNitroModule || ((mod) => mod);

    const _jiti = jiti(nitroOptions.rootDir, {
      interopDefault: true,
      esmResolve: true,
      alias: nitroOptions.alias,
    });
    const _modPath = _jiti.resolve(mod);
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
